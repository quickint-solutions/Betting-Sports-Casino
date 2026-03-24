var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class FullMarketCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, marketOddsService, marketService, $timeout, toasterService, $rootScope, $state, $q, $compile, $filter, promiseTracker, WSSocketService, $sce, commentaryService, placeBetDataService, localStorageHelper, commonDataService, localCacheHelper, settings, betService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.marketOddsService = marketOddsService;
                this.marketService = marketService;
                this.$timeout = $timeout;
                this.toasterService = toasterService;
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$q = $q;
                this.$compile = $compile;
                this.$filter = $filter;
                this.promiseTracker = promiseTracker;
                this.WSSocketService = WSSocketService;
                this.$sce = $sce;
                this.commentaryService = commentaryService;
                this.placeBetDataService = placeBetDataService;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.localCacheHelper = localCacheHelper;
                this.settings = settings;
                this.betService = betService;
                var listenPPL = this.$rootScope.$on("catch-for-ppl", () => {
                    this.calculatePPL();
                    this.calculatePPL(false);
                });
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
                var wsListnerScore = this.$rootScope.$on("ws-score-changed", (event, response) => {
                    if (response.success) {
                        if (response.data.scoreSource) {
                            var data = response.data;
                            this.$scope.fullMarket.event.scoreSource = data.scoreSource;
                            if (data.commentary) {
                                this.$scope.fullMarket.commentary = JSON.parse(data.commentary);
                            }
                            if (data.audioConfig) {
                                this.$scope.fullMarket.audioConfig = JSON.parse(data.audioConfig);
                            }
                        }
                        else {
                            angular.forEach(response.data, (data) => {
                                if (this.$scope.fullMarket && data.eventId == this.$scope.fullMarket.event.sourceId) {
                                    if (data.eventTypeId == this.settings.SoccerBfId) {
                                        this.getSoccerScore(data);
                                    }
                                    else if (data.eventTypeId == this.settings.TennisBfId) {
                                        this.getTennisScore(data);
                                    }
                                    else if (data.eventTypeId == this.settings.CricketBfId) {
                                        this.getCricketScore(data);
                                    }
                                }
                            });
                        }
                    }
                });
                var wsListnerMarketCount = this.$rootScope.$on("ws-marketcount-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        this.checkNewMarket(data.eventId);
                    }
                });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_market_status);
                    this.$timeout.cancel(this.$scope.timer_date_diff);
                    listenPPL();
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListnerScore();
                    wsListnerMarketCount();
                    wsListnerMarketOdds();
                });
                super.init(this);
            }
            betProcessStarted(marketid) {
                if (this.$scope.fullMarket.id == marketid) {
                    this.$scope.fullMarket.betInProcess = true;
                }
                else {
                    this.$scope.otherMarkets.forEach((o) => {
                        o.markets.forEach((m) => {
                            if (m.id == marketid) {
                                m.betInProcess = true;
                            }
                        });
                    });
                    this.$scope.fancyMarkets.forEach((o) => {
                        if (o.id == marketid) {
                            o.betInProcess = true;
                        }
                    });
                }
            }
            betProcessComplete(marketid) {
                if (this.$scope.fullMarket.id == marketid) {
                    this.$scope.fullMarket.betInProcess = false;
                }
                else {
                    this.$scope.otherMarkets.forEach((o) => {
                        o.markets.forEach((m) => {
                            if (m.id == marketid) {
                                m.betInProcess = false;
                            }
                        });
                    });
                    this.$scope.fancyMarkets.forEach((o) => {
                        if (o.id == marketid) {
                            o.betInProcess = false;
                        }
                    });
                }
            }
            calculatePPL(singlemarket = true) {
                this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
                if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                    if (singlemarket && this.$scope.fullMarket) {
                        var bets = this.$scope.placeBetData.bets.filter((b) => { return b.marketId == this.$scope.fullMarket.id; });
                        intranet.common.helpers.PotentialPLCalc.calcPL(this.$scope.fullMarket, bets);
                    }
                    else {
                        if (this.$scope.otherMarkets) {
                            this.$scope.otherMarkets.forEach((om) => {
                                om.markets.forEach((m) => {
                                    var bets = this.$scope.placeBetData.bets.filter((b) => { return b.marketId == m.id; });
                                    intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                                });
                            });
                        }
                        if (this.$scope.fancyMarkets) {
                            this.$scope.fancyMarkets.forEach((m) => {
                                var bets = this.$scope.placeBetData.bets.filter((b) => { return b.marketId == m.id; });
                                intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                            });
                        }
                    }
                }
                else {
                    if (this.$scope.fullMarket) {
                        this.$scope.fullMarket.marketRunner.forEach((mr) => { mr.pPL = 0; });
                    }
                    if (this.$scope.otherMarkets) {
                        this.$scope.otherMarkets.forEach((om) => {
                            om.markets.forEach((m) => {
                                m.marketRunner.forEach((mr) => { mr.pPL = 0; });
                            });
                        });
                    }
                    if (this.$scope.fancyMarkets) {
                        this.$scope.fancyMarkets.forEach((m) => {
                            m.marketRunner.forEach((mr) => { mr.pPL = 0; });
                        });
                    }
                }
            }
            initScopeValues() {
                this.$scope.otherMarkets = [];
                this.$scope.fancyMarkets = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.otherMarketTemplate = this.settings.ThemeName + '/template/other-market.html';
                this.$scope.isRequestProcessing = false;
                this.$scope.loadderTemplate = this.commonDataService.market_loader_template;
                this.$scope.isLMTAvailable = this.settings.IsLMTAvailable;
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            }
            loadInitialData() {
                this.getFullmarket();
                this.loadPinnedMarkets();
            }
            handleEventChange(eventid, bfEventId, eventType, scoreSourceId) {
                var data = { eventId: eventid, bfEventId: bfEventId, eventType: eventType, scoreSourceId: scoreSourceId };
                if (this.$scope.fullMarket.inPlay) {
                    this.$scope.$emit('event-changed', data);
                }
                else {
                    this.$scope.$emit('event-changed', '');
                }
            }
            loadPinnedMarkets() {
                var pinned = this.localStorageHelper.get(this.settings.MultiMarketPin);
                if (pinned) {
                    this.$scope.pinnedMarkets = pinned;
                }
            }
            isMarketPinned(marketid) {
                return this.$scope.pinnedMarkets.some((m) => { return m == marketid; });
            }
            pinMe(market) {
                market.pin = !market.pin;
                if (market.pin) {
                    this.localStorageHelper.setInArray(this.settings.MultiMarketPin, market.id);
                    this.$scope.pinnedMarkets.push(market.id);
                }
                else {
                    this.localStorageHelper.removeFromArray(this.settings.MultiMarketPin, market.id);
                    var index = this.$scope.pinnedMarkets.indexOf(market.id);
                    if (index > -1) {
                        this.$scope.pinnedMarkets.splice(index, 1);
                    }
                }
            }
            getFullmarket() {
                this.$scope.isRequestProcessing = true;
                this.marketOddsService.getFullMarketByEventId(this.$stateParams.eventId)
                    .success((response) => {
                    this.$scope.fullMarket = response.data;
                    if (this.$scope.fullMarket.event) {
                        this.subscribeOdds();
                        this.handleEventChange(this.$scope.fullMarket.eventId, this.$scope.fullMarket.event.sourceId, this.$scope.fullMarket.eventType.id, this.$scope.fullMarket.event.scoreSourceId);
                        this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                        this.$scope.fullMarket.pin = this.isMarketPinned(this.$scope.fullMarket.id);
                        if (this.$scope.fullMarket.event.scoreSource != intranet.common.enums.ScoreSource.AANS) {
                            this.readScoreFromBF();
                        }
                        this.$scope.eventTypeName = this.commonDataService.getEventTypeName(this.$scope.fullMarket.eventType.id);
                        if (this.settings.ThemeName == 'sports') {
                            this.countDateDiff();
                        }
                    }
                }).finally(() => { this.getOtherMarkets(); });
            }
            countDateDiff() {
                this.$scope.fullMarket.datediff = this.$filter('dateDiffTime2')(this.$scope.fullMarket.event.openDate);
                this.$scope.timer_date_diff = this.$timeout(() => { this.countDateDiff(); }, 1000);
            }
            setSportBreadcrumb() {
                this.$rootScope.$broadcast('sporttree-br-changed', { eventTypeId: this.$scope.fullMarket.eventType.id });
            }
            getTabName(group) {
                var name = intranet.common.enums.MarketGroup[group];
                return name.replaceAll('_', ' ');
            }
            getOtherMarkets() {
                this.$scope.isRequestProcessing = true;
                this.marketOddsService.getOtherMarketsById(this.$stateParams.eventId, this.$scope.fullMarket.id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.otherMarkets = response.data;
                        if (this.$scope.otherMarkets.length > 0) {
                            this.$scope.otherMarkets.forEach((o) => {
                                o.markets.forEach((m) => {
                                    if (this.commonDataService.BetInProcess(m.id)) {
                                        m.betInProcess = true;
                                    }
                                });
                            });
                            var fancyIndex = intranet.common.helpers.Utility.IndexOfObject(this.$scope.otherMarkets, 'group', intranet.common.enums.MarketGroup.Fancy);
                            if (fancyIndex > -1) {
                                this.$scope.fancyMarkets = this.$scope.otherMarkets[fancyIndex].markets;
                                this.$scope.otherMarkets.splice(fancyIndex, 1);
                            }
                            else {
                                this.$scope.fancyMarkets.splice(0);
                            }
                            angular.forEach(this.$scope.fancyMarkets, (f) => { this.setSessionPrice(f); });
                            var popularIndex = intranet.common.helpers.Utility.IndexOfObject(this.$scope.otherMarkets, 'group', intranet.common.enums.MarketGroup.Popular);
                            if (popularIndex > -1) {
                                var mIndex = [];
                                angular.forEach(this.$scope.otherMarkets[popularIndex].markets, (pm, index) => {
                                    if (pm.bettingType == intranet.common.enums.BettingType.ODDS || pm.bettingType == intranet.common.enums.BettingType.BM) {
                                        this.$scope.fancyMarkets.push(pm);
                                        mIndex.push(index);
                                    }
                                });
                                angular.forEach(mIndex.reverse(), (m) => {
                                    this.$scope.otherMarkets[popularIndex].markets.splice(m, 1);
                                });
                                if (this.$scope.otherMarkets[popularIndex].markets.length <= 0) {
                                    this.$scope.otherMarkets.splice(popularIndex, 1);
                                }
                            }
                            if (this.$scope.otherMarkets.length > 0) {
                                this.$scope.selectedTab = 0;
                            }
                        }
                    }
                }).finally(() => {
                    this.$scope.isRequestProcessing = false;
                    if (this.$scope.otherMarkets.length > 0 || this.$scope.fancyMarkets.length > 0) {
                        this.subscribeOdds();
                    }
                    this.calculatePPL();
                });
            }
            selectedTabChanged(index) {
                if ((this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') && this.$scope.selectedTab == index) {
                    this.$scope.selectedTab = -1;
                }
                else {
                    this.$scope.selectedTab = index;
                }
                this.subscribeOdds();
            }
            openBFChart(market, r) {
                var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
                this.commonDataService.openBFChart(ids);
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.fullMarket && this.$scope.fullMarket.id) {
                    mids.push(this.$scope.fullMarket.id);
                }
                if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                    this.$scope.otherMarkets[this.$scope.selectedTab].markets.forEach((m) => {
                        if (m.marketStatus != intranet.common.enums.MarketStatus.CLOSED && m.temporaryStatus != intranet.common.enums.TemporaryStatus.SUSPEND) {
                            mids.push(m.id);
                        }
                    });
                }
                if (this.$scope.fancyMarkets.length > 0) {
                    this.$scope.fancyMarkets.forEach((f) => {
                        if (f.marketStatus != intranet.common.enums.MarketStatus.CLOSED && f.temporaryStatus != intranet.common.enums.TemporaryStatus.SUSPEND) {
                            mids.push(f.id);
                        }
                    });
                }
                this.WSSocketService.sendMessage({
                    Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            setMarketOdds(responseData) {
                responseData.forEach((data) => {
                    if (this.$scope.fullMarket && this.$scope.fullMarket.id == data.id) {
                        this.setOddsInMarket(this.$scope.fullMarket, data);
                        if (this.$scope.fullMarket.prepareRadarView) {
                            this.$scope.fullMarket.prepareRadarView();
                        }
                    }
                    if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                        this.$scope.otherMarkets[this.$scope.selectedTab].markets.forEach((m) => {
                            if (m.id == data.id) {
                                this.setOddsInMarket(m, data);
                            }
                        });
                    }
                    if (this.$scope.fancyMarkets.length > 0) {
                        this.$scope.fancyMarkets.forEach((f) => {
                            if (f.id == data.id) {
                                this.setOddsInMarket(f, data);
                                if (f.prepareRadarView) {
                                    f.prepareRadarView();
                                }
                            }
                        });
                    }
                });
            }
            readScoreFromBF() {
                if (this.$scope.fullMarket.inPlay) {
                    this.commonDataService.getEventTypes().then(() => {
                        var bfEventType = this.commonDataService.getBFEventTypeId(this.$scope.fullMarket.eventType.id);
                        if (bfEventType == this.settings.SoccerBfId
                            || bfEventType == this.settings.TennisBfId
                            || bfEventType == this.settings.CricketBfId) {
                            this.$timeout(() => { this.checkScoreSource(); }, 1000);
                        }
                    });
                }
            }
            checkScoreSource() {
                this.commentaryService.getCommentary(this.$scope.fullMarket.eventId)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.fullMarket.event.scoreSource = response.data.scoreSource;
                        if (response.data.scoreSource == intranet.common.enums.ScoreSource.Betfair) {
                            this.WSSocketService.sendMessage({
                                Scid: [this.$scope.fullMarket.event.sourceId], MessageType: intranet.common.enums.WSMessageType.Score
                            });
                        }
                        else {
                            if (response.data.commentary) {
                                this.$scope.fullMarket.commentary = JSON.parse(response.data.commentary);
                            }
                            ;
                        }
                    }
                });
            }
            getSoccerScore(response) {
                if (response) {
                    var score = response;
                    if (!!score.updateDetails) {
                        this.$scope.fullMarket.score = score;
                        this.$scope.fullMarket.isSoccer = true;
                        this.$scope.fullMarket.score.firstHalf = {};
                        this.$scope.fullMarket.score.secondHalf = {};
                        this.$scope.fullMarket.score.firstHalf.detail = [];
                        this.$scope.fullMarket.score.secondHalf.detail = [];
                        this.$scope.fullMarket.score.firstHalf.divideBy = (100 / 45);
                        this.$scope.fullMarket.score.secondHalf.divideBy = (100 / 45);
                        var isFirst = true;
                        var isSecond = false;
                        this.$scope.fullMarket.score.updateDetails.forEach((u) => {
                            if (isFirst) {
                                this.$scope.fullMarket.score.firstHalf.timeElapsed = this.$scope.fullMarket.score.timeElapsed;
                                this.$scope.fullMarket.score.firstHalf.detail.push(u);
                                if (u.type == 'SecondHalfKickOff') {
                                    this.$scope.fullMarket.score.firstHalf.timeElapsed = u.matchTime;
                                    this.$scope.fullMarket.score.firstHalf.divideBy = (100 / u.matchTime);
                                    isFirst = false;
                                    isSecond = true;
                                }
                            }
                            else if (isSecond) {
                                u.left = u.matchTime - 45;
                                this.$scope.fullMarket.score.secondHalf.timeElapsed = this.$scope.fullMarket.score.timeElapsed - 45;
                                this.$scope.fullMarket.score.secondHalf.detail.push(u);
                                if (u.elapsedAddedTime) {
                                    this.$scope.fullMarket.score.secondHalf.timeElapsed = u.left;
                                    this.$scope.fullMarket.score.secondHalf.divideBy = (100 / (this.$scope.fullMarket.score.secondHalf.timeElapsed));
                                }
                            }
                        });
                    }
                }
            }
            getTennisScore(score) {
                if (score) {
                    this.$scope.fullMarket.score = score;
                    this.$scope.fullMarket.isTennis = true;
                }
            }
            getCricketScore(cricket) {
                var commentary = {};
                if (cricket) {
                    if (cricket.score.home.name != 'HOME') {
                        commentary.homeTeam = cricket.score.home.name;
                    }
                    else {
                        commentary.homeTeam = this.$scope.fullMarket.marketRunner[0].runner.name;
                    }
                    if (cricket.score.away.name != 'AWAY') {
                        commentary.awayTeam = cricket.score.away.name;
                    }
                    else {
                        commentary.awayTeam = this.$scope.fullMarket.marketRunner[1].runner.name;
                    }
                    if (cricket.score.home.inning1) {
                        commentary.inning1HomeScore = cricket.score.home.inning1.runs;
                        commentary.inning1HomeScore += (isNaN(cricket.score.home.inning1.wickets * 1) ? '' : '/' + cricket.score.home.inning1.wickets);
                        commentary.inning1HomeScore += ' (' + cricket.score.home.inning1.overs + ')';
                    }
                    if (cricket.score.away.inning1) {
                        commentary.inning1AwayScore = cricket.score.away.inning1.runs;
                        commentary.inning1AwayScore += (isNaN(cricket.score.away.inning1.wickets * 1) ? '' : '/' + cricket.score.away.inning1.wickets);
                        commentary.inning1AwayScore += ' (' + cricket.score.away.inning1.overs + ')';
                    }
                    if (cricket.score.home.inning2) {
                        commentary.inning2InPlay = true;
                        commentary.inning2HomeScore = cricket.score.home.inning2.runs;
                        commentary.inning2HomeScore += (isNaN(cricket.score.home.inning2.wickets * 1) ? '' : '/' + cricket.score.home.inning2.wickets);
                        commentary.inning2HomeScore += ' (' + cricket.score.home.inning2.overs + ')';
                    }
                    if (cricket.score.away.inning2) {
                        commentary.inning2InPlay = true;
                        commentary.inning2AwayScore = cricket.score.away.inning2.runs;
                        commentary.inning2AwayScore += (isNaN(cricket.score.away.inning2.wickets * 1) ? '' : '/' + cricket.score.away.inning2.wickets);
                        commentary.inning2AwayScore += ' (' + cricket.score.away.inning2.overs + ')';
                    }
                    if (cricket.stateOfBall) {
                        commentary.stateOfBall = { batsmanName: cricket.stateOfBall.batsmanName, bowlerName: cricket.stateOfBall.bowlerName };
                    }
                    if (cricket.matchType == 'TEST') {
                        commentary.currentDay = cricket.currentDay;
                    }
                    this.$scope.fullMarket.commentary = commentary;
                }
            }
            placeBet(m, side, runnerId, price, runnerName, percentage = 100, tdId = 0) {
                var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage);
                if (m.marketRunner.length == tdId && tdId > 0) {
                    this.$scope.inlineElementId = math.multiply(tdId, -1);
                }
                else {
                    this.$scope.inlineElementId = tdId;
                }
                super.executeBet(model.model);
            }
            openBook(marketId, showMe = true) {
                this.commonDataService.openScorePosition(marketId, showMe);
            }
            betAll(m, side) {
                this.betOnAllRunner(m, side);
            }
            checkAllMarketStatus() {
                if (this.$scope.timer_market_status) {
                    this.$timeout.cancel(this.$scope.timer_market_status);
                }
                if (this.$scope.fullMarket) {
                    this.isSingleMarketClosed(this.$scope.fullMarket, this.$state);
                }
                if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab >= 0) {
                    var removeTab = this.isMultiMarketClosed(this.$scope.otherMarkets[this.$scope.selectedTab].markets);
                    if (removeTab) {
                        this.$scope.otherMarkets.splice(this.$scope.selectedTab, 1);
                        if (this.$scope.otherMarkets.length > 0) {
                            this.$scope.selectedTab = 0;
                        }
                    }
                }
                if (this.$scope.fancyMarkets.length > 0) {
                    this.isMultiMarketClosed(this.$scope.fancyMarkets);
                }
                if (!this.$scope.$$destroyed) {
                    this.$scope.timer_market_status = this.$timeout(() => {
                        this.checkAllMarketStatus();
                    }, 20000);
                }
            }
            getNewlyAddedMarkets(marketIds) {
                this.marketOddsService.getMultiMarkets(marketIds)
                    .success((response) => {
                    if (response && response.success) {
                        if (response.data.length > 0) {
                            angular.forEach(response.data, (m) => {
                                m.newitem = true;
                                if (m.group == intranet.common.enums.MarketGroup.Fancy) {
                                    this.$scope.fancyMarkets.forEach((x) => { if (marketIds.indexOf(x.id) < 0)
                                        x.newitem = false; });
                                    if (intranet.common.helpers.Utility.IndexOfObject(this.$scope.fancyMarkets, 'id', m.id) < 0)
                                        this.$scope.fancyMarkets.push(m);
                                }
                                else {
                                    var isFound = false;
                                    this.$scope.otherMarkets.forEach((om) => {
                                        if (om.group == m.group) {
                                            isFound = true;
                                            if (intranet.common.helpers.Utility.IndexOfObject(om.markets, 'id', m.id) < 0)
                                                om.markets.push(m);
                                        }
                                    });
                                    if (!isFound) {
                                        this.$scope.otherMarkets.push({ group: m.group, markets: [m] });
                                    }
                                }
                            });
                        }
                    }
                }).finally(() => { this.subscribeOdds(); });
            }
            checkNewMarket(eventId) {
                if (eventId == this.$stateParams.eventId) {
                    this.marketService.getMarketByEventId(eventId)
                        .success((response) => {
                        if (response.success && response.data) {
                            var myEvent = response.data;
                            if (myEvent.length > 0) {
                                var newIds = [];
                                myEvent.forEach((ms) => {
                                    if (ms.temporaryStatus != intranet.common.enums.TemporaryStatus.SUSPEND) {
                                        var isFound = false;
                                        var newid = ms.id;
                                        if (this.$scope.fullMarket.id == newid) {
                                            isFound = true;
                                        }
                                        if (!isFound) {
                                            this.$scope.fancyMarkets.forEach((m) => {
                                                if (m.id == newid) {
                                                    isFound = true;
                                                    m.marketStatus = ms.marketStatus;
                                                    m.temporaryStatus = ms.temporaryStatus;
                                                }
                                            });
                                        }
                                        if (!isFound) {
                                            this.$scope.otherMarkets.forEach((om) => {
                                                om.markets.forEach((m) => {
                                                    if (m.id == newid) {
                                                        isFound = true;
                                                        m.marketStatus = ms.marketStatus;
                                                        m.temporaryStatus = ms.temporaryStatus;
                                                    }
                                                });
                                            });
                                        }
                                        if (!isFound) {
                                            newIds.push(newid);
                                        }
                                    }
                                });
                                if (newIds.length > 0) {
                                    this.getNewlyAddedMarkets(newIds);
                                }
                            }
                        }
                    });
                }
            }
        }
        home.FullMarketCtrl = FullMarketCtrl;
        angular.module('intranet.home').controller('fullMarketCtrl', FullMarketCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FullMarketCtrl.js.map