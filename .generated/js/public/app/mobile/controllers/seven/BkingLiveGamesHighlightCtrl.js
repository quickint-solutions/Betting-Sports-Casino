var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class BkingLiveGamesHighlightCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, marketOddsService, $timeout, $rootScope, $compile, WSSocketService, placeBetDataService, localStorageHelper, toasterService, commonDataService, settings, betService, eventService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.$rootScope = $rootScope;
                this.$compile = $compile;
                this.WSSocketService = WSSocketService;
                this.placeBetDataService = placeBetDataService;
                this.localStorageHelper = localStorageHelper;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.betService = betService;
                this.eventService = eventService;
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_nextmarket);
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListnerMarketOdds();
                });
                super.init(this);
            }
            betProcessStarted(marketid) {
                this.$scope.highlights.forEach((m) => {
                    if (m.market.id == marketid) {
                        m.market.betInProcess = true;
                    }
                });
            }
            betProcessComplete(marketid) {
                this.$scope.highlights.forEach((m) => {
                    if (m.market.id == marketid) {
                        m.market.betInProcess = false;
                    }
                });
            }
            initScopeValues() {
                this.$scope.hasAnyDrawMarket = false;
                this.$scope.pinnedMarkets = [];
                this.$scope.highlights = [];
                this.$scope.generalLoader = this.commonDataService.mobilePromisetracker;
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.loadLiveGamesMarkets();
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
            loadLiveGamesMarkets() {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    if (value.length > 0) {
                        angular.forEach(value, (v) => {
                            if (v.id == this.$stateParams.eventTypeId) {
                                this.$scope.currentEventName = v.name;
                                var promise = this.marketOddsService.getGameHighlightByEventTypeId(this.$stateParams.eventTypeId);
                                this.commonDataService.addMobilePromise(promise);
                                promise.success((response) => {
                                    if (response.success) {
                                        angular.forEach(response.data, (data) => {
                                            var event = { id: data.id, name: data.name };
                                            if (data.markets.length > 0) {
                                                var fullMarket = data.markets[0];
                                                if (this.commonDataService.BetInProcess(fullMarket.id)) {
                                                    fullMarket.betInProcess = true;
                                                }
                                                if (fullMarket.marketRunner.length > 2) {
                                                    this.$scope.hasAnyDrawMarket = true;
                                                }
                                                event.market = this.setFixOddRunner(fullMarket);
                                            }
                                            this.$scope.highlights.push(event);
                                        });
                                    }
                                }).finally(() => { this.subscribeOdds(); });
                            }
                        });
                    }
                });
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.highlights.length > 0) {
                    this.$scope.highlights.forEach((m) => {
                        if (m.market.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                            mids.push(m.market.id);
                        }
                    });
                }
                this.WSSocketService.sendMessage({
                    Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            setMarketOdds(responseData) {
                responseData.forEach((data) => {
                    if (this.$scope.highlights && this.$scope.highlights.length > 0) {
                        this.$scope.highlights.forEach((f) => {
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
                    else if (fullMarket.gameType == intranet.common.enums.GameType.DragonTiger ||
                        fullMarket.gameType == intranet.common.enums.GameType.Up7Down ||
                        fullMarket.gameType == intranet.common.enums.GameType.ClashOfKings) {
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
                this.marketOddsService.getGameByEventId(eventId)
                    .success((response) => {
                    if (response.success && response.data && response.data.id) {
                        if (response.data.id != lastMarketId) {
                            market = this.setFixOddRunner(response.data);
                            angular.forEach(this.$scope.highlights, (h) => {
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
            placeBet(m, side, runnerId, price, runnerName, percentage = 100, sectionId) {
                var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName);
                model.model.sectionId = sectionId;
                model.model.isMobile = true;
                this.$scope.stopPPL = true;
                if (this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'bking') {
                    this.$scope.inlineOnMarketOnly = true;
                }
                super.executeBet(model.model, true);
            }
        }
        mobile.BkingLiveGamesHighlightCtrl = BkingLiveGamesHighlightCtrl;
        angular.module('intranet.mobile').controller('bkingLiveGamesHighlightCtrl', BkingLiveGamesHighlightCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BkingLiveGamesHighlightCtrl.js.map