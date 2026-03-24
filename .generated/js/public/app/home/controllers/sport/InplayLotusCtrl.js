var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class InplayLotusCtrl extends intranet.common.BetControllerBase {
            constructor($scope, marketOddsService, $timeout, $rootScope, $q, $state, $compile, WSSocketService, placeBetDataService, localStorageHelper, toasterService, commentaryService, videoService, eventService, commonDataService, settings, betService) {
                super($scope);
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.$rootScope = $rootScope;
                this.$q = $q;
                this.$state = $state;
                this.$compile = $compile;
                this.WSSocketService = WSSocketService;
                this.placeBetDataService = placeBetDataService;
                this.localStorageHelper = localStorageHelper;
                this.toasterService = toasterService;
                this.commentaryService = commentaryService;
                this.videoService = videoService;
                this.eventService = eventService;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.betService = betService;
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
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
                this.$scope.liveGamesHighlight.forEach((event) => {
                    if (event.market.id == marketid) {
                        event.market.betInProcess = true;
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
                this.$scope.liveGamesHighlight.forEach((event) => {
                    if (event.market.id == marketid) {
                        event.market.betInProcess = false;
                    }
                });
            }
            initScopeValues() {
                this.$scope.inPlayMarkets = [];
                this.$scope.popularMarkets = [];
                this.$scope.liveGamesHighlight = [];
                this.$scope.liveGamesMarkets = [];
                this.$scope.filters = [];
                this.$scope.totalBets = 0;
                this.$scope.allVideos = [];
                this.$scope.isRequestProcessing = false;
                this.$scope.pinnedMarkets = [];
                this.$scope.selectedEventTypeName = '!alleventypes';
                this.$scope.cricketId = this.settings.CricketId;
                this.$scope.soccerId = this.settings.SoccerId;
                this.$scope.tennisId = this.settings.TennisId;
                this.$scope.horseId = this.settings.HorseRacingId;
                this.$scope.greyHoundId = this.settings.GreyhoundId;
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.loadInPlayMarkets();
                this.loadEventTypes();
                this.loadLiveGamesMarkets();
                if (this.settings.ThemeName == 'bking') {
                    this.startBkingSlick();
                }
                else {
                    this.setSlick();
                }
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
            setSlick() {
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
                this.marketOddsService.getInPlayMarkets()
                    .success((response) => {
                    if (response.success) {
                        var eventTypes = response.data;
                        eventTypes.forEach((e, index) => {
                            e.markets.forEach((m, mindex) => {
                                if (this.commonDataService.BetInProcess(m.id)) {
                                    m.betInProcess = true;
                                }
                                m.eventTypeSourceId = e.sourceId;
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
                });
                ;
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
            loadPopularMarkets(marketCount) {
                var model = { top: marketCount, eventTypeIds: [] };
                this.$scope.filters.forEach((a) => { if (a.checked) {
                    model.eventTypeIds.push(a.id);
                } });
                this.marketOddsService.getPopularMarkets(model)
                    .success((response) => {
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
                }).finally(() => { this.subscribeOdds(); });
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
                                                if (this.commonDataService.BetInProcess(fullMarket.id)) {
                                                    fullMarket.betInProcess = true;
                                                }
                                                event.market = this.setFixOddRunner(fullMarket);
                                            }
                                            this.$scope.liveGamesHighlight.push(event);
                                        });
                                    }
                                }).finally(() => {
                                    this.subscribeOdds();
                                });
                            }
                        });
                    }
                });
            }
            loadLiveGamesMarkets() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        this.$scope.hasCasino = data.hasCasino;
                        if (data.hasCasino) {
                            this.$scope.liveGamesMarkets = intranet.common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
                        }
                    }
                });
            }
            openFDGame(lg) {
                this.commonDataService.setGameId(lg.tableId);
                this.$state.go('base.livegames');
            }
            openCasino(gameId) {
                this.commonDataService.setGameId(gameId);
                this.$state.go('base.livegames');
            }
            loadAllVideos() {
                var defer = this.$q.defer();
                this.videoService.getAllVideosDetail()
                    .success((response) => {
                    if (response.success && response.data) {
                        response.data.forEach((r) => { r.video.forEach((v) => { this.$scope.allVideos.push(v); }); });
                    }
                }).finally(() => { defer.resolve(); });
                return defer.promise;
            }
            placeBet(h, side, runnerId, price, runnerName) {
                var model = new intranet.common.helpers.BetModal(h, side, runnerId, price, runnerName);
                this.$scope.stopPPL = true;
                this.$scope.inlineOnMarketOnly = true;
                super.executeBet(model.model);
            }
            treeClick1(nodetype, id, name) {
                this.$rootScope.$emit('on-sporttree-click-outside', { nodetype: nodetype, id: id, name: name });
            }
        }
        home.InplayLotusCtrl = InplayLotusCtrl;
        angular.module('intranet.home').controller('inplayLotusCtrl', InplayLotusCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=InplayLotusCtrl.js.map