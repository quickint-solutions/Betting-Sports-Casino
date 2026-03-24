var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class BkingHighlightCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, marketOddsService, $timeout, $rootScope, $compile, WSSocketService, placeBetDataService, localStorageHelper, toasterService, commonDataService, settings, betService, eventService, $q) {
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
                this.$q = $q;
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
                });
                super.init(this);
            }
            betProcessStarted(marketid) {
                this.$scope.highlights.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = true;
                    }
                });
            }
            betProcessComplete(marketid) {
                this.$scope.highlights.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = false;
                    }
                });
            }
            initScopeValues() {
                this.$scope.hasAnyDrawMarket = false;
                this.$scope.eventTypes = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.highlights = [];
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.loadHighlightsBasedOnURL();
                if (this.$stateParams.eventTypeId) {
                    this.commonDataService.getEventTypes().then(() => {
                        this.$scope.eventTypeName = this.commonDataService.getEventTypeName(this.$stateParams.eventTypeId);
                    });
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
            loadHighlightsBySportNodeType(model) {
                var defer = this.$q.defer();
                var promise;
                if (model.nodeType == 1) {
                    promise = this.marketOddsService.getHighlightbyEventTypeId(model.id);
                }
                else if (model.nodeType == 2) {
                    promise = this.marketOddsService.getHighlightbyCompetitionId(this.$stateParams.eventTypeId, model.id);
                }
                else if (model.nodeType == 4) {
                    promise = this.marketOddsService.getHighlightbyEventId(model.id);
                }
                this.commonDataService.addMobilePromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.$scope.highlights = response.data;
                    }
                }).finally(() => { defer.resolve(); });
                defer.promise.finally(() => {
                    this.$scope.highlights.forEach((m) => {
                        if (this.commonDataService.BetInProcess(m.id)) {
                            m.betInProcess = true;
                        }
                        if (m.marketRunner.length > 2) {
                            this.$scope.hasAnyDrawMarket = true;
                        }
                    });
                    this.subscribeOdds();
                });
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.highlights.length > 0) {
                    this.$scope.highlights.forEach((m) => {
                        if (m.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                            mids.push(m.id);
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
                            if (f.id == data.id) {
                                this.setOddsInMarket(f, data);
                            }
                        });
                    }
                });
            }
            loadHighlightsBasedOnURL() {
                var model = { nodeType: null, id: null };
                if (this.$stateParams.nodetype && this.$stateParams.id) {
                    model.nodeType = this.$stateParams.nodetype;
                    model.id = this.$stateParams.id;
                }
                this.loadHighlightsBySportNodeType(model);
            }
            placeBet(h, side, runnerId, price, runnerName, sectionId = '') {
                var model = new intranet.common.helpers.BetModal(h, side, runnerId, price, runnerName);
                model.model.sectionId = sectionId;
                model.model.isMobile = true;
                this.$scope.stopPPL = true;
                if (this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'bking') {
                    this.$scope.inlineOnMarketOnly = true;
                }
                super.executeBet(model.model);
            }
        }
        mobile.BkingHighlightCtrl = BkingHighlightCtrl;
        angular.module('intranet.mobile').controller('bkingHighlightCtrl', BkingHighlightCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BkingHighlightCtrl.js.map