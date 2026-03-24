var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class SevenHomeCtrl extends intranet.common.BetControllerBase {
            constructor($scope, marketOddsService, $timeout, $state, $rootScope, $compile, $q, commentaryService, $filter, WSSocketService, videoService, eventService, placeBetDataService, localStorageHelper, toasterService, commonDataService, settings, betService) {
                super($scope);
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.$state = $state;
                this.$rootScope = $rootScope;
                this.$compile = $compile;
                this.$q = $q;
                this.commentaryService = commentaryService;
                this.$filter = $filter;
                this.WSSocketService = WSSocketService;
                this.videoService = videoService;
                this.eventService = eventService;
                this.placeBetDataService = placeBetDataService;
                this.localStorageHelper = localStorageHelper;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.betService = betService;
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        this.getOpenBets();
                    }
                });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                var wsListnerScore = this.$rootScope.$on("ws-score-changed", (event, response) => {
                    if (response.success) {
                        this.getScore(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListnerScore();
                    wsListner();
                    wsListnerMarketOdds();
                    this.$timeout.cancel(this.$scope.timer_nextmarket);
                });
                super.init(this);
            }
            betProcessStarted(marketid) {
                this.$scope.inPlayMarkets.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = true;
                    }
                });
                this.$scope.popularMarkets.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = true;
                    }
                });
            }
            betProcessComplete(marketid) {
                this.$scope.inPlayMarkets.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = false;
                    }
                });
                this.$scope.popularMarkets.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = false;
                    }
                });
            }
            registerScrollEvent() {
                jQuery('.markets-odd').each(function (i, d) {
                    jQuery(d).on('mousedown', function (event) {
                        jQuery('.markets-odd').each(function (index, el) {
                            jQuery(el).attr('user', 1);
                        });
                    });
                });
                jQuery('.markets-odd').each(function (i, d) {
                    jQuery(d).on('touchstart', function (event) {
                        jQuery('.markets-odd').each(function (index, el) {
                            jQuery(el).attr('user', 1);
                        });
                    });
                });
                jQuery('.markets-odd').attr('sleft', 1);
                jQuery('.markets-odd').on('scroll', function (e) {
                    scrollSame(this.scrollLeft);
                    setTimeout(function () { scrollAll(); }, 500);
                });
                var scrollSame = ((svalue) => {
                    jQuery('.markets-odd').each(function (index, div) {
                        jQuery(div).scrollLeft(svalue);
                    });
                });
                var scrollAll = (() => {
                    jQuery('.markets-odd').each(function (index, div) {
                        var oldcount = jQuery(div).attr('sleft');
                        var isuser = jQuery(div).attr('user');
                        if (isuser == 1) {
                            if (oldcount % 2 == 0) {
                                jQuery(div).animate({ scrollLeft: '-=500' }, 1000, 'swing');
                                jQuery(div).attr('sleft', 1);
                                jQuery(div).attr('user', 0);
                            }
                            else {
                                jQuery(div).animate({ scrollLeft: '+=500' }, 1000, 'swing');
                                jQuery(div).attr('sleft', 2);
                                jQuery(div).attr('user', 0);
                            }
                        }
                    });
                });
            }
            initScopeValues() {
                this.$scope.inPlayMarkets = [];
                this.$scope.popularMarkets = [];
                this.$scope.liveGamesHighlight = [];
                this.$scope.liveGamesMarkets = [];
                this.$scope.filters = [];
                this.$scope.isRequestProcessing = false;
                this.$scope.loadderTemplate = this.commonDataService.mobile_highlight_loader_template;
                this.$scope.totalBets = 0;
                this.$scope.currentWebApp = this.settings.WebApp;
                this.$scope.cricketId = this.settings.CricketId;
                this.$scope.soccerId = this.settings.SoccerId;
                this.$scope.tennisId = this.settings.TennisId;
                this.$scope.horseId = this.settings.HorseRacingId;
                this.$scope.greyhoundId = this.settings.GreyhoundId;
                this.$scope.openBets = [];
                this.$scope.imagePath = this.settings.ImagePath + 'images/cover-image/';
                this.$scope.pinnedMarkets = [];
                this.$scope.generalLoader = this.commonDataService.mobilePromisetracker;
                this.$scope.selectedEventTypeName = '!alleventypes';
            }
            loadInitialData() {
                if (this.settings.ThemeName == 'bking') {
                    this.startBkingSlick();
                }
                else {
                    this.$timeout(() => {
                        jQuery('.top-banner').slick({
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            autoplay: true,
                            autoplaySpeed: 2000,
                            arrows: false,
                            infinite: true,
                            variableWidth: true,
                            swipeToSlide: true
                        });
                        jQuery('.exchangeGames-content').slick({
                            slidesToShow: 1,
                            slidesToScroll: 3,
                            autoplay: false,
                            autoplaySpeed: 2000,
                            arrows: false,
                            infinite: true,
                            variableWidth: true,
                            swipeToSlide: true
                        });
                        jQuery('.popularGames-content').slick({
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            autoplay: false,
                            autoplaySpeed: 2000,
                            arrows: false,
                            infinite: true,
                            variableWidth: true,
                            swipeToSlide: true
                        });
                    }, 1000);
                }
                this.loadPinnedMarkets();
                this.loadInPlayMarkets();
                this.loadEventTypes();
                this.loadLiveGamesMarkets();
                this.getOpenBets();
            }
            startBkingSlick() {
                this.$timeout(() => {
                    jQuery('.my-slick-wrapper').slick({
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 2000,
                        arrows: false,
                        infinite: true,
                        variableWidth: false
                    });
                }, 1000);
            }
            openCasino(gameId) {
                this.commonDataService.setGameId(gameId);
                if (this.settings.ThemeName == 'bking') {
                    this.$state.go('mobile.base.fdlivegames');
                }
                else {
                    this.$state.go('mobile.seven.base.fdlivegames');
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
            loadInPlayMarkets() {
                this.$scope.isRequestProcessing = true;
                var promise = this.marketOddsService.getInPlayMarkets();
                this.commonDataService.addMobilePromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        var eventTypes = response.data;
                        eventTypes.forEach((e, index) => {
                            e.markets.forEach((m, mindex) => {
                                if (this.commonDataService.BetInProcess(m.id)) {
                                    m.betInProcess = true;
                                }
                                m.eventTypeSourceId = e.sourceId;
                                m.open = false;
                                this.$scope.inPlayMarkets.push(m);
                                m.eventTypeName = e.name;
                                m.hasVideo = m.event.videoId ? true : false;
                                m.hasFancy = m.event.hasFancy ? true : false;
                            });
                        });
                    }
                }).finally(() => {
                    this.$scope.isRequestProcessing = false;
                    this.subscribeOdds();
                    if (this.settings.ThemeName == 'lotus') {
                        if (this.$scope.inPlayMarkets.length > 0) {
                            var eventids = this.$scope.inPlayMarkets.filter((m) => {
                                return m.marketStatus != intranet.common.enums.MarketStatus.CLOSED
                                    && m.event.sourceId;
                            }).map((m) => { return m.event.sourceId; });
                            this.WSSocketService.sendMessage({
                                Scid: eventids, MessageType: intranet.common.enums.WSMessageType.Score
                            });
                        }
                        this.countBets();
                    }
                });
                ;
            }
            getScore(dataarray) {
                angular.forEach(dataarray, (data) => {
                    angular.forEach(this.$scope.inPlayMarkets, (m) => {
                        if (data.eventId == m.event.sourceId) {
                            if (data.eventTypeId == this.settings.SoccerBfId) {
                                m.score = data;
                                m.isSoccer = true;
                            }
                            else if (data.eventTypeId == this.settings.TennisBfId) {
                                m.score = data;
                                m.isTennis = true;
                            }
                            else if (data.eventTypeId == this.settings.CricketBfId) {
                                m.isCricket = true;
                                m.score = {};
                                var score = data;
                                if (score && score.score) {
                                    if (score.score.home.highlight) {
                                        m.score.inplayIndex = 0;
                                        if (score.score.home.inning1) {
                                            m.score.runs = score.score.home.inning1.runs + '/' + score.score.home.inning1.wickets;
                                            m.score.overs = score.score.home.inning1.overs;
                                        }
                                        if (score.score.home.inning2) {
                                            m.score.runs = score.score.home.inning2.runs + '/' + score.score.home.inning2.wickets;
                                            m.score.overs = score.score.home.inning2.overs;
                                        }
                                    }
                                    else if (score.score.away.highlight) {
                                        m.score.inplayIndex = 1;
                                        if (score.score.away.inning1) {
                                            m.score.runs = score.score.away.inning1.runs + '/' + score.score.away.inning1.wickets;
                                            m.score.overs = score.score.away.inning1.overs;
                                        }
                                        if (score.score.away.inning2) {
                                            m.score.runs = score.score.away.inning2.runs + '/' + score.score.away.inning2.wickets;
                                            m.score.overs = score.score.away.inning2.overs;
                                        }
                                    }
                                    if (score.matchType != 'TEST') {
                                        if (!score.score.away.highlight) {
                                            if (score.score.away.inning1 && score.score.away.inning1.runs.length > 0) {
                                                m.score.taget = (score.score.away.inning1.runs * 1) + 1;
                                            }
                                            if (score.score.away.inning2 && score.score.away.inning2.runs.length > 0) {
                                                m.score.taget = (score.score.away.inning2.runs * 1) + 1;
                                            }
                                        }
                                        else if (!score.score.home.highlight) {
                                            if (score.score.home.inning1 && score.score.home.inning1.runs.length > 0) {
                                                m.score.taget = (score.score.home.inning1.runs * 1) + 1;
                                            }
                                            if (score.score.home.inning2 && score.score.home.inning2.runs.length > 0) {
                                                m.score.taget = (score.score.home.inning2.runs * 1) + 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                });
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.inPlayMarkets.length > 0) {
                    this.$scope.inPlayMarkets.forEach((f) => {
                        if (f.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                            mids.push(f.id);
                        }
                    });
                }
                if (this.$scope.popularMarkets.length > 0) {
                    this.$scope.popularMarkets.forEach((f) => {
                        if (f.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                            mids.push(f.id);
                        }
                    });
                }
                if (this.$scope.liveGamesHighlight.length > 0) {
                    this.$scope.liveGamesHighlight.forEach((f) => {
                        if (f.market.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                            mids.push(f.market.id);
                        }
                    });
                }
                this.WSSocketService.sendMessage({
                    Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            setMarketOdds(responseData) {
                responseData.forEach((data) => {
                    if (this.$scope.inPlayMarkets.length > 0) {
                        this.$scope.inPlayMarkets.forEach((f) => {
                            if (f.id == data.id) {
                                this.setOddsInMarket(f, data);
                            }
                        });
                    }
                    if (this.$scope.popularMarkets.length > 0) {
                        this.$scope.popularMarkets.forEach((f) => {
                            if (f.id == data.id) {
                                this.setOddsInMarket(f, data);
                            }
                        });
                    }
                    if (this.$scope.liveGamesHighlight.length > 0) {
                        this.$scope.liveGamesHighlight.forEach((f) => {
                            if (f.market.id == data.id) {
                                if (f.market.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                                    this.setOddsInMarket(f.market, data);
                                    if (f.market.marketStatus == intranet.common.enums.MarketStatus.CLOSED) {
                                        this.$timeout(() => { this.getNextMarket(f.market, f.id); }, 3000);
                                    }
                                }
                            }
                        });
                    }
                });
            }
            loadEventTypes() {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    this.$scope.filters = value;
                    if (this.$scope.filters.length > 0) {
                        this.$scope.filters = this.$scope.filters.filter((a) => { return a.id != this.settings.HorseRacingId && a.id != this.settings.GreyhoundId; });
                        this.$scope.filters.forEach((a) => { a.checked = true; });
                        this.loadPopularMarkets(10);
                    }
                });
            }
            loadLiveGamesMarkets() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        if (data.hasCasino) {
                            this.$scope.liveGamesMarkets = intranet.common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
                        }
                    }
                });
            }
            openFDGame(lg) {
                this.commonDataService.setGameId(lg.tableId);
                this.$state.go('mobile.seven.base.fdlivegames');
            }
            loadLiveGameHighlights() {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    if (value.length > 0) {
                        angular.forEach(value, (v) => {
                            if (v.id == this.settings.LiveGamesId) {
                                this.$scope.liveGameEventName = v.name;
                                this.marketOddsService.getGameHighlightByEventTypeId(this.settings.LiveGamesId)
                                    .success((response) => {
                                    if (response.success) {
                                        angular.forEach(response.data, (data) => {
                                            var event = { id: data.id, name: data.name, eventTypeName: this.commonDataService.getEventTypeName(this.settings.LiveGamesId) };
                                            if (data.markets.length > 0) {
                                                var fullMarket = data.markets[0];
                                                event.market = this.setFixOddRunner(fullMarket);
                                            }
                                            this.$scope.liveGamesHighlight.push(event);
                                        });
                                    }
                                }).finally(() => {
                                    this.subscribeOdds();
                                    this.$timeout(() => { this.registerScrollEvent(); this.countBets(); }, 500);
                                });
                            }
                        });
                    }
                });
            }
            setFixOddRunner(fullMarket) {
                fullMarket.betInProcess = this.commonDataService.BetInProcess(fullMarket.id);
                if (fullMarket.bettingType == intranet.common.enums.BettingType.FIXED_ODDS) {
                    if (fullMarket.gameType == intranet.common.enums.GameType.Patti2) {
                        var metadata = JSON.parse(fullMarket.marketRunner[0].runner.runnerMetadata);
                        fullMarket.pattiRunner = metadata.patti2;
                    }
                    if (fullMarket.gameType == intranet.common.enums.GameType.PokerT20) {
                        var metadata = JSON.parse(fullMarket.marketRunner[0].runner.runnerMetadata);
                        fullMarket.pattiRunner = metadata.pokert20;
                    }
                    else if (fullMarket.gameType == intranet.common.enums.GameType.Patti3) {
                        var metadata = JSON.parse(fullMarket.marketRunner[0].runner.runnerMetadata);
                        fullMarket.pattiRunner = metadata.patti3;
                    }
                    else if (fullMarket.gameType == intranet.common.enums.GameType.Up7Down) {
                        fullMarket.marketRunner.forEach((mr) => {
                            mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                            mr.runnerGroup = mr.metadata.runnerGroup;
                        });
                    }
                    else if (fullMarket.gameType == intranet.common.enums.GameType.DragonTiger) {
                        fullMarket.marketRunner.forEach((mr) => {
                            if (mr.runner.runnerMetadata) {
                                mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                mr.runnerGroup = mr.metadata.runnerGroup;
                            }
                        });
                    }
                }
                return fullMarket;
            }
            getNextMarket(market, eventId) {
                var lastMarketId = market.id;
                console.log('current id ' + lastMarketId + ' ' + market.event.name);
                this.marketOddsService.getGameByEventId(eventId)
                    .success((response) => {
                    if (response.success && response.data && response.data.id) {
                        if (response.data.id != lastMarketId) {
                            console.log('new id ' + response.data.id + ' ' + market.event.name);
                            market = this.setFixOddRunner(response.data);
                            angular.forEach(this.$scope.liveGamesHighlight, (h) => {
                                if (h.id == market.event.id) {
                                    h.market = market;
                                }
                            });
                            this.subscribeOdds();
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed && lastMarketId == market.id) {
                        this.$scope.timer_nextmarket = this.$timeout(() => {
                            this.getNextMarket(market, eventId);
                        }, 3000);
                    }
                });
            }
            loadPopularMarkets(marketCount) {
                var model = { top: marketCount, eventTypeIds: [] };
                this.$scope.filters.forEach((a) => { if (a.checked) {
                    model.eventTypeIds.push(a.id);
                } });
                var promise = this.marketOddsService.getPopularMarkets(model);
                this.commonDataService.addMobilePromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        if (response.data && response.data.length > 0) {
                            response.data.forEach((mr) => {
                                mr.eventTypeName = this.commonDataService.getEventTypeName(mr.event.eventType.id);
                                mr.hasVideo = mr.event.videoId ? true : false;
                                mr.hasFancy = mr.event.hasFancy ? true : false;
                            });
                            this.$scope.popularMarkets = response.data;
                        }
                    }
                }).finally(() => { this.subscribeOdds(); this.$timeout(() => { this.registerScrollEvent(); this.countBets(); }, 500); });
            }
            placeBet(h, side, runnerId, price, runnerName, sectionId) {
                var model = new intranet.common.helpers.BetModal(h, side, runnerId, price, runnerName);
                model.model.sectionId = sectionId;
                model.model.isMobile = true;
                this.$scope.stopPPL = true;
                if (this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'bking') {
                    this.$scope.inlineOnMarketOnly = true;
                }
                super.executeBet(model.model, true);
            }
            getOpenBets() {
                var promise = this.betService.openBets();
                promise.success((response) => {
                    if (response.success) {
                        this.$scope.totalBets = 0;
                        if (response.data && response.data.length > 0) {
                            this.$scope.openBets = response.data;
                            response.data.forEach((a) => {
                                this.$scope.totalBets = this.$scope.totalBets + a.bets.length;
                            });
                        }
                    }
                }).finally(() => { this.countBets(); });
            }
            countBets() {
                this.$scope.totalInplayBets = 0;
                this.$scope.totalPopularBets = 0;
                if (this.$scope.openBets.length > 0 && this.settings.ThemeName == 'lotus') {
                    var inplayIds = [];
                    if (this.$scope.inPlayMarkets.length > 0) {
                        inplayIds = this.$scope.inPlayMarkets.map((p) => { return p.eventId; });
                    }
                    if (this.$scope.liveGamesHighlight.length > 0) {
                        this.$scope.liveGamesHighlight.forEach((p) => { inplayIds.push(p.id); });
                    }
                    var popularIds = [];
                    if (this.$scope.popularMarkets.length > 0) {
                        popularIds = this.$scope.popularMarkets.map((p) => { return p.eventId; });
                    }
                    angular.forEach(this.$scope.openBets, (op) => {
                        if (inplayIds.indexOf(op.eventId) > -1) {
                            this.$scope.totalInplayBets += op.bets.length;
                        }
                        else if (popularIds.indexOf(op.eventId) > -1) {
                            this.$scope.totalPopularBets += op.bets.length;
                        }
                    });
                }
            }
            openFullMarket(eventId) {
                this.$state.go('mobile.seven.base.market', { eventId: eventId });
            }
            openGameFullMarket(eventId) {
                this.$state.go('mobile.seven.base.livegamesmarket', { eventid: eventId });
            }
        }
        mobile.SevenHomeCtrl = SevenHomeCtrl;
        angular.module('intranet.mobile').controller('sevenHomeCtrl', SevenHomeCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SevenHomeCtrl.js.map