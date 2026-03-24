var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class FullPositionCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, $stateParams, settings, commentaryService, commonDataService, betService, userService, marketOddsService, $timeout, WSSocketService, $state, $window, $sce, toasterService, eventService, marketService, $base64, $rootScope, positionService) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.$stateParams = $stateParams;
                this.settings = settings;
                this.commentaryService = commentaryService;
                this.commonDataService = commonDataService;
                this.betService = betService;
                this.userService = userService;
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.WSSocketService = WSSocketService;
                this.$state = $state;
                this.$window = $window;
                this.$sce = $sce;
                this.toasterService = toasterService;
                this.eventService = eventService;
                this.marketService = marketService;
                this.$base64 = $base64;
                this.$rootScope = $rootScope;
                this.positionService = positionService;
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        console.log(response);
                        var data = JSON.parse(response.data);
                        if (data.EventId == this.$stateParams.eventid) {
                            this.$scope.newBetMarketIds.push(data.MarketId);
                            this.$scope.isBetCountChanged = true;
                        }
                    }
                });
                var wsListnerScore = this.$rootScope.$on("ws-score-changed", (event, response) => {
                    if (response.success) {
                        if (response.data.scoreSource) {
                            var data = response.data;
                            this.$scope.market.event.scoreSource = data.scoreSource;
                            if (data.commentary) {
                                this.$scope.market.commentary = JSON.parse(data.commentary);
                            }
                            if (data.audioConfig) {
                                this.$scope.market.audioConfig = JSON.parse(data.audioConfig);
                            }
                        }
                        else {
                            angular.forEach(response.data, (data) => {
                                if (this.$scope.market && data.eventId == this.$scope.market.event.sourceId) {
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
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                var wsListnerMarketCount = this.$rootScope.$on("ws-marketcount-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        this.checkNewMarket(data.eventId);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_market_score);
                    this.$timeout.cancel(this.$scope.timer_position);
                    this.$timeout.cancel(this.$scope.timer_market_status);
                    wsListner();
                    wsListnerScore();
                    wsListnerMarketOdds();
                    wsListnerMarketCount();
                    this.unsubscribeOdds();
                });
                this.WSSocketService.setController(this);
                super.init(this);
            }
            initScopeValues() {
                this.$scope.betStatus = [];
                this.$scope.betSides = [];
                this.$scope.isBetCountChanged = false;
                this.$scope.anyUserList = [];
                this.$scope.search = {
                    status: '2',
                    betside: '-1'
                };
                this.$scope.newBetMarketIds = [];
                this.$scope.marketList = [];
                this.$scope.bettingTypeList = [];
                this.$scope.includePT = false;
            }
            loadInitialData() {
                this.$scope.bettingTypeList.push({ id: intranet.common.enums.BettingType.SESSION, name: 'Fancy' });
                this.$scope.bettingTypeList.push({ id: intranet.common.enums.BettingType.LINE, name: 'Line' });
                this.$scope.bettingTypeList.push({ id: intranet.common.enums.BettingType.FIXED_ODDS, name: 'Winning' });
                this.$scope.bettingTypeList.push({ id: intranet.common.enums.BettingType.SCORE_RANGE, name: 'Khado' });
                this.getLoggedInUser();
                this.getMarketpositionbyMarketId(this.$stateParams.marketid);
                this.getMarketpositionbyEventId();
                this.fillBetSide();
                this.fillBetStatus();
                this.getMarketStatusByEventId();
                this.$timeout(() => { this.checkOtherMarketStatus(); }, 20000);
            }
            getMarketpositionbyMarketId(marketid) {
                this.positionService.getMarketpositionbyMarketId(marketid)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.market = response.data;
                        this.$scope.marketList.push({ id: this.$scope.market.id, name: this.$scope.market.name });
                        if (this.$scope.market.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.market.bettingType == intranet.common.enums.BettingType.LINE
                            || this.$scope.market.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                            this.getSessionPosition(this.$scope.market);
                        }
                        else {
                            this.getUserPosition(this.$scope.market);
                        }
                        this.readScoreFromBF();
                    }
                }).finally(() => { this.subscribeOdds(); this.startTimer(); });
            }
            getMarketStatusByEventId() {
                this.eventService.GetMarketPtStatusByEventId(this.$stateParams.eventid)
                    .success((response) => {
                    if (response.success) {
                        if (response.data) {
                            this.$scope.bettingLocked = response.data.isLock;
                        }
                    }
                });
            }
            getTabName(group) {
                return this.$scope.bettingTypeList[group].name;
            }
            getMarketpositionbyEventId() {
                this.$scope.otherMarkets = [];
                this.marketOddsService.getOtherMarketsById(this.$stateParams.eventid, this.$stateParams.marketid)
                    .success((response) => {
                    if (response.success) {
                        var others = response.data;
                        var userIds = [];
                        var sessionIds = [];
                        others.forEach((om) => {
                            angular.forEach(om.markets, (m) => {
                                this.$scope.marketList.push({ id: m.id, name: m.name });
                                if (m.bettingType == intranet.common.enums.BettingType.SESSION || m.bettingType == intranet.common.enums.BettingType.LINE
                                    || m.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                                    sessionIds.push(m.id);
                                }
                                else {
                                    userIds.push(m.id);
                                }
                                this.$scope.otherMarkets.push(m);
                            });
                        });
                        if (userIds.length > 0) {
                            this.getUserPositionByIds(userIds);
                        }
                        if (sessionIds.length > 0) {
                            this.getSessionPositionByIds(sessionIds);
                        }
                    }
                }).finally(() => { this.subscribeOdds(); });
            }
            bettingLockStatusChanged() {
                var model = {};
                model.nodeId = this.$scope.market.eventId;
                model.isLock = this.$scope.bettingLocked;
                model.nodeType = 4;
                this.eventService.UpdateMarketPtStatus(model)
                    .success((response) => {
                    this.toasterService.showMessages(response.messages);
                });
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.market && this.$scope.market.id) {
                    mids.push(this.$scope.market.id);
                }
                if (this.$scope.otherMarkets && this.$scope.otherMarkets.length > 0) {
                    this.$scope.otherMarkets.forEach((f) => {
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
                responseData.forEach((r) => {
                    if (this.$scope.market && this.$scope.market.id == r.id) {
                        super.setOddsInMarket(this.$scope.market, r, false);
                    }
                    angular.forEach((this.$scope.otherMarkets), (m) => {
                        if (m.id == r.id) {
                            this.setOddsInMarket(m, r, false);
                        }
                    });
                });
            }
            unsubscribeOdds() {
                this.WSSocketService.sendMessage({
                    Mids: [], MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            wssReconnected() {
                this.subscribeOdds();
            }
            getUserPosition(market) {
                var model = { MarketId: market.id, isPT: this.$scope.includePT };
                this.positionService.getUserPositionPost(model)
                    .success((response) => {
                    if (response.success && response.data) {
                        market.loginUserPosition = response.data;
                    }
                }).finally(() => {
                    if (market.loginUserPosition && market.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(market.marketRunner, (mr) => {
                            angular.forEach(market.loginUserPosition.marketRunners, (m) => {
                                if (mr.runner.id == m.runner.id) {
                                    mr.pl = m.pl;
                                    if (m.pl < pl) {
                                        pl = m.pl;
                                    }
                                }
                            });
                        });
                        market.pl = pl;
                    }
                });
            }
            getUserPositionByIds(ids) {
                var model = { marketIds: ids, isPT: this.$scope.includePT };
                var resp = [];
                this.positionService.getExposurebyMarketIds(model)
                    .success((response) => {
                    if (response.success && response.data) {
                        resp = response.data;
                    }
                }).finally(() => {
                    if (resp && resp.length > 0) {
                        angular.forEach(this.$scope.otherMarkets, (market) => {
                            var pl = 0;
                            angular.forEach(market.marketRunner, (mr) => {
                                var r = resp.filter((res) => { return res.marketId == market.id && res.runnerId == mr.runner.id; }) || [];
                                if (r && r.length > 0) {
                                    mr.pl = r[0].pl;
                                    if (mr.pl < pl) {
                                        pl = r[0].pl;
                                    }
                                }
                            });
                            market.pl = pl;
                        });
                    }
                });
            }
            getSessionPosition(market) {
                var model = { MarketId: market.id, isPT: this.$scope.includePT };
                this.positionService.getFancyUserPosition(model)
                    .success((response) => {
                    if (response.success && response.data) {
                        market.pl = response.data.pl;
                    }
                });
            }
            getSessionPositionByIds(ids) {
                var model = { MarketIds: ids, isPT: this.$scope.includePT };
                var resp = [];
                this.positionService.getFancyExposurebyMarketIds(model)
                    .success((response) => {
                    if (response.success && response.data) {
                        resp = response.data;
                    }
                }).finally(() => {
                    if (resp && resp.length > 0) {
                        angular.forEach(this.$scope.otherMarkets, (market) => {
                            var r = resp.filter((res) => { return res.marketId == market.id; }) || [];
                            if (r && r.length > 0) {
                                market.pl = r[0].pl;
                            }
                        });
                    }
                });
            }
            includePTChanged() {
                if (this.$scope.market.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.market.bettingType == intranet.common.enums.BettingType.LINE
                    || this.$scope.market.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                    this.getSessionPosition(this.$scope.market);
                }
                else {
                    this.getUserPosition(this.$scope.market);
                }
                var userIds = [];
                var sessionIds = [];
                this.$scope.otherMarkets.forEach((m) => {
                    if (m.bettingType == intranet.common.enums.BettingType.SESSION || m.bettingType == intranet.common.enums.BettingType.LINE
                        || m.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                        sessionIds.push(m.id);
                    }
                    else {
                        userIds.push(m.id);
                    }
                });
                if (userIds.length > 0) {
                    this.getUserPositionByIds(userIds);
                }
                if (sessionIds.length > 0) {
                    this.getSessionPositionByIds(sessionIds);
                }
            }
            readScoreFromBF() {
                this.commonDataService.getEventTypes().then(() => {
                    var bfEventType = this.commonDataService.getBFEventTypeId(this.$scope.market.eventType.id);
                    if (bfEventType == this.settings.SoccerBfId
                        || bfEventType == this.settings.TennisBfId
                        || bfEventType == this.settings.CricketBfId) {
                        this.$timeout(() => { this.checkScoreSource(); }, 1000);
                    }
                });
            }
            checkScoreSource() {
                this.commentaryService.getCommentary(this.$scope.market.eventId)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.market.event.scoreSource = response.data.scoreSource;
                        if (response.data.scoreSource == intranet.common.enums.ScoreSource.Betfair) {
                            this.WSSocketService.sendMessage({
                                Scid: [this.$scope.market.event.sourceId], MessageType: intranet.common.enums.WSMessageType.Score
                            });
                        }
                        else {
                            if (response.data.commentary) {
                                this.$scope.market.commentary = JSON.parse(response.data.commentary);
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
                        this.$scope.market.score = score;
                        this.$scope.market.isSoccer = true;
                        this.$scope.market.score.firstHalf = {};
                        this.$scope.market.score.secondHalf = {};
                        this.$scope.market.score.firstHalf.detail = [];
                        this.$scope.market.score.secondHalf.detail = [];
                        this.$scope.market.score.firstHalf.divideBy = (100 / 45);
                        this.$scope.market.score.secondHalf.divideBy = (100 / 45);
                        var isFirst = true;
                        var isSecond = false;
                        this.$scope.market.score.updateDetails.forEach((u) => {
                            if (isFirst) {
                                this.$scope.market.score.firstHalf.timeElapsed = this.$scope.market.score.timeElapsed;
                                this.$scope.market.score.firstHalf.detail.push(u);
                                if (u.type == 'SecondHalfKickOff') {
                                    this.$scope.market.score.firstHalf.timeElapsed = u.matchTime;
                                    this.$scope.market.score.firstHalf.divideBy = (100 / u.matchTime);
                                    isFirst = false;
                                    isSecond = true;
                                }
                            }
                            else if (isSecond) {
                                u.left = u.matchTime - 45;
                                this.$scope.market.score.secondHalf.timeElapsed = this.$scope.market.score.timeElapsed - 45;
                                this.$scope.market.score.secondHalf.detail.push(u);
                                if (u.elapsedAddedTime) {
                                    this.$scope.market.score.secondHalf.timeElapsed = u.left;
                                    this.$scope.market.score.secondHalf.divideBy = (100 / (this.$scope.market.score.secondHalf.timeElapsed));
                                }
                            }
                        });
                    }
                }
            }
            getTennisScore(score) {
                if (score) {
                    this.$scope.market.score = score;
                    this.$scope.market.isTennis = true;
                }
            }
            getCricketScore(cricket) {
                var commentary = {};
                if (cricket) {
                    if (cricket.score.home.name != 'HOME') {
                        commentary.homeTeam = cricket.score.home.name;
                    }
                    else {
                        commentary.homeTeam = this.$scope.market.marketRunner[0].runner.name;
                    }
                    if (cricket.score.away.name != 'AWAY') {
                        commentary.awayTeam = cricket.score.away.name;
                    }
                    else {
                        commentary.awayTeam = this.$scope.market.marketRunner[1].runner.name;
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
                    this.$scope.market.commentary = commentary;
                }
            }
            openBFChart(market, r) {
                var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
                this.commonDataService.openBFChart(ids);
            }
            fillBetSide() {
                this.$scope.betSides.push({ id: -1, name: 'All' });
                this.$scope.betSides.push({ id: 1, name: 'Back' });
                this.$scope.betSides.push({ id: 2, name: 'Lay' });
            }
            fillBetStatus() {
                this.$scope.betStatus.push({ id: -1, name: 'All' });
                this.$scope.betStatus.push({ id: 2, name: 'Matched' });
                this.$scope.betStatus.push({ id: 3, name: 'Unmatched' });
            }
            getLoggedInUser() {
                this.$scope.currentUser = this.commonDataService.getLoggedInUserData();
            }
            searchUser(search) {
                if (search && search.length >= 3) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.userService.findMembers(search);
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.anyUserList = response.data;
                            if (this.$scope.anyUserList && this.$scope.anyUserList.length > 0) {
                                this.$scope.anyUserList.forEach((u) => {
                                    u.extra = super.getUserTypesObj(u.userType);
                                });
                            }
                        });
                    }
                }
                else {
                    this.$scope.anyUserList.splice(0);
                }
            }
            getMatchedBets(params) {
                var searchQuery = {
                    status: 'matched',
                    side: this.$scope.search.betside,
                    eventId: this.$stateParams.eventid
                };
                if (this.$scope.search.selectedMarket) {
                    searchQuery.marketId = this.$scope.search.selectedMarket.id;
                }
                if (params && params.orderBy == '') {
                    params.orderBy = 'createdon';
                    params.orderByDesc = true;
                }
                var userId = '';
                if (this.$scope.search.selectedUser) {
                    userId = this.$scope.search.selectedUser.id;
                }
                return this.betService.getLiveBetsByEventId({ searchQuery: searchQuery, params: params, id: userId });
            }
            getUnmatchedBets(params) {
                var searchQuery = {
                    status: 'unmatched',
                    side: this.$scope.search.betside,
                    eventId: this.$stateParams.eventid
                };
                if (this.$scope.search.selectedMarket) {
                    searchQuery.marketId = this.$scope.search.selectedMarket.id;
                }
                if (params && params.orderBy == '') {
                    params.orderBy = 'createdon';
                    params.orderByDesc = true;
                }
                var userId = '';
                if (this.$scope.search.selectedUser) {
                    userId = this.$scope.search.selectedUser.id;
                }
                return this.betService.getLiveBetsByEventId({ searchQuery: searchQuery, params: params, id: userId });
            }
            fetchLiveBetsData() {
                if (this.$scope.search.status == 2 || this.$scope.search.status == -1) {
                    var refreshCMD = "refreshGrid";
                    refreshCMD = refreshCMD + "_kt-matchedlivebets-grid";
                    this.$scope.$broadcast(refreshCMD);
                }
                if (this.$scope.search.status == 3 || this.$scope.search.status == -1) {
                    var refreshCMD = "refreshGrid";
                    refreshCMD = refreshCMD + "_kt-unmatchedlivebets-grid";
                    this.$scope.$broadcast(refreshCMD);
                }
            }
            newBetReceived() {
                if (this.$scope.newBetMarketIds.length > 0) {
                    if (this.$scope.newBetMarketIds.indexOf(this.$scope.market.id) > -1) {
                        if (this.$scope.market.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.market.bettingType == intranet.common.enums.BettingType.LINE
                            || this.$scope.market.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                            this.getSessionPosition(this.$scope.market);
                        }
                        else {
                            this.getUserPosition(this.$scope.market);
                        }
                    }
                    var other = this.$scope.newBetMarketIds.filter((a) => { return a != this.$scope.market.id; }) || [];
                    if (other && other.length > 0) {
                        var userIds = [];
                        var sessionIds = [];
                        this.$scope.otherMarkets.forEach((m) => {
                            if (other.indexOf(m.id) > -1) {
                                if (m.bettingType == intranet.common.enums.BettingType.SESSION || m.bettingType == intranet.common.enums.BettingType.LINE
                                    || m.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                                    sessionIds.push(m.id);
                                }
                                else {
                                    userIds.push(m.id);
                                }
                            }
                        });
                        if (userIds.length > 0) {
                            this.getUserPositionByIds(userIds);
                        }
                        if (sessionIds.length > 0) {
                            this.getSessionPositionByIds(sessionIds);
                        }
                    }
                    this.fetchLiveBetsData();
                    this.startTimer();
                    this.playAudio();
                }
            }
            playAudio() {
                var audio = new Audio('audio/short_1.mp3');
                audio.play();
            }
            resetCriteria() {
                this.$scope.search.status = '2';
                this.$scope.search.betside = '-1';
                this.$scope.search.selectedUser = undefined;
                this.$scope.search.selectedMarket = undefined;
                this.fetchLiveBetsData();
            }
            startTimer(start = true) {
                if (!start) {
                    this.$timeout.cancel(this.$scope.timer_position);
                }
                else {
                    this.$timeout.cancel(this.$scope.timer_position);
                    this.$scope.selectedInterval = this.$scope.selectedInterval ? this.$scope.selectedInterval : 10;
                    var startdelay = (() => {
                        if (this.$scope.selectedInterval > 0) {
                            this.$scope.selectedInterval = this.$scope.selectedInterval - 1;
                            this.$scope.timer_position = this.$timeout(() => {
                                startdelay();
                            }, 1000);
                        }
                        else {
                            if (this.$scope.isBetCountChanged) {
                                this.$timeout.cancel(this.$scope.timer_position);
                                this.$scope.isBetCountChanged = false;
                                this.newBetReceived();
                            }
                            else {
                                this.startTimer();
                            }
                        }
                    });
                    this.$timeout(() => { startdelay(); }, 1000);
                }
            }
            openBook(event, market) {
                if (event) {
                    event.stopPropagation();
                }
                var run = market.marketRunner.map((m) => { return m.runner.name; }).join(',');
                var url = this.$state.href('positionviewer', { marketid: market.id, bettingtype: market.bettingType, runner: this.$base64.encode(run), name: this.$base64.encode(market.name) });
                this.$window.open(this.$sce.trustAsUrl(url), market.name, "width=700,height=250,left=400,top=50,location=no,right=50");
            }
            checkNewMarket(eventId) {
                if (eventId == this.$stateParams.eventid) {
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
                                        if (this.$scope.market.id == newid) {
                                            isFound = true;
                                        }
                                        if (!isFound) {
                                            this.$scope.otherMarkets.forEach((m) => {
                                                if (m.id == newid) {
                                                    isFound = true;
                                                    m.marketStatus = ms.marketStatus;
                                                    m.temporaryStatus = ms.temporaryStatus;
                                                }
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
            getNewlyAddedMarkets(marketIds) {
                this.marketOddsService.getMultiMarkets(marketIds)
                    .success((response) => {
                    if (response && response.success) {
                        if (response.data.length > 0) {
                            angular.forEach(response.data, (m) => {
                                m.newitem = true;
                                this.$scope.otherMarkets.forEach((x) => { if (marketIds.indexOf(x.id) < 0)
                                    x.newitem = false; });
                                if (intranet.common.helpers.Utility.IndexOfObject(this.$scope.otherMarkets, 'id', m.id) < 0) {
                                    this.$scope.otherMarkets.push(m);
                                }
                            });
                        }
                    }
                }).finally(() => { this.subscribeOdds(); });
            }
            checkOtherMarketStatus() {
                if (this.$scope.timer_market_status) {
                    this.$timeout.cancel(this.$scope.timer_market_status);
                }
                if (this.$scope.otherMarkets.length > 0) {
                    this.isMultiMarketClosed(this.$scope.otherMarkets);
                }
                if (!this.$scope.$$destroyed) {
                    this.$scope.timer_market_status = this.$timeout(() => {
                        this.checkOtherMarketStatus();
                    }, 20000);
                }
            }
            isMultiMarketClosed(markets = []) {
                var needsToChangeIndex = false;
                var removeIds = [];
                markets.forEach((m) => {
                    if (m.marketStatus == intranet.common.enums.MarketStatus.CLOSED) {
                        removeIds.push(m.id);
                    }
                });
                if (removeIds.length > 0) {
                    removeIds.forEach((id) => {
                        var index = intranet.common.helpers.Utility.IndexOfObject(markets, 'id', id);
                        if (index > -1) {
                            markets.splice(index, 1);
                        }
                    });
                    if (markets.length <= 0) {
                        needsToChangeIndex = true;
                    }
                }
                return needsToChangeIndex;
            }
        }
        master.FullPositionCtrl = FullPositionCtrl;
        angular.module('intranet.master').controller('fullPositionCtrl', FullPositionCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FullPositionCtrl.js.map