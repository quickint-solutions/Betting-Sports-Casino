var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class SevenRaceHighlightCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, $state, $filter, $timeout, toasterService, $rootScope, $q, $compile, WSSocketService, placeBetDataService, localStorageHelper, commonDataService, settings, competitionService, marketOddsService, betService, eventService, marketService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.$filter = $filter;
                this.$timeout = $timeout;
                this.toasterService = toasterService;
                this.$rootScope = $rootScope;
                this.$q = $q;
                this.$compile = $compile;
                this.WSSocketService = WSSocketService;
                this.placeBetDataService = placeBetDataService;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.competitionService = competitionService;
                this.marketOddsService = marketOddsService;
                this.betService = betService;
                this.eventService = eventService;
                this.marketService = marketService;
                var listenPPL = this.$rootScope.$on("catch-for-ppl", () => {
                    this.calculatePPL(false);
                });
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    listenPPL();
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
                this.$scope.otherMarkets.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = true;
                    }
                });
            }
            betProcessComplete(marketid) {
                this.$scope.otherMarkets.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = false;
                    }
                });
            }
            calculatePPL(singlemarket = true) {
                this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
                if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                    if (this.$scope.otherMarkets) {
                        this.$scope.otherMarkets.forEach((m) => {
                            var bets = this.$scope.placeBetData.bets.filter((b) => { return b.marketId == m.id; });
                            intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                        });
                    }
                }
                else {
                    if (this.$scope.otherMarkets) {
                        this.$scope.otherMarkets.forEach((m) => {
                            m.marketRunner.forEach((mr) => { mr.pPL = 0; });
                        });
                    }
                }
            }
            initScopeValues() {
                this.$scope.sportTreeList = [];
                this.$scope.otherMarkets = [];
                this.$scope.isRequestProcessing = true;
            }
            loadInitialData() {
                this.loadAllHorseMarkets();
            }
            gotoFullMarket(marketid) {
                this.$state.go("mobile.seven.base.racemarket", { eventtype: this.$stateParams.id, marketid: marketid });
            }
            loadAllHorseMarkets() {
                this.$scope.isRequestProcessing = true;
                var promise;
                promise = this.marketOddsService.getRaceMarketList(this.$stateParams.id);
                this.commonDataService.addMobilePromise(promise);
                promise.success((response) => {
                    if (response.success && response.data.length > 0) {
                        this.$scope.sportTreeList = response.data;
                        this.getOtherMarkets(this.$scope.sportTreeList.map((s) => { return s.id; }));
                    }
                    else {
                        this.$scope.isRequestProcessing = false;
                    }
                }).error(() => { this.subscribeOdds(); this.$scope.isRequestProcessing = false; });
            }
            getOtherMarkets(marketIds) {
                var promise = this.marketOddsService.getMultiMarkets(marketIds.slice(0, 10));
                this.commonDataService.addMobilePromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.$scope.otherMarkets = this.$filter('orderBy')(response.data, 'startTime');
                        if (this.$scope.otherMarkets.length > 0) {
                            this.$scope.otherMarkets.forEach((m) => {
                                if (this.commonDataService.BetInProcess(m.id)) {
                                    m.betInProcess = true;
                                }
                                this.commonDataService.setHorseMetadata(m);
                            });
                            this.$scope.selectedTab = 0;
                        }
                    }
                }).finally(() => {
                    this.subscribeOdds();
                    this.calculatePPL();
                    this.$scope.isRequestProcessing = false;
                });
            }
            selectedTabChanged(index) {
                if ((this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus') && this.$scope.selectedTab == index) {
                    this.$scope.selectedTab = -1;
                }
                else {
                    this.$scope.selectedTab = index;
                }
                this.subscribeOdds();
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                    if (this.$scope.otherMarkets[this.$scope.selectedTab].marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                        mids.push(this.$scope.otherMarkets[this.$scope.selectedTab].id);
                    }
                }
                this.WSSocketService.sendMessage({
                    Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            setMarketOdds(responseData) {
                responseData.forEach((data) => {
                    if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                        if (this.$scope.otherMarkets[this.$scope.selectedTab].id == data.id) {
                            this.setOddsInMarket(this.$scope.otherMarkets[this.$scope.selectedTab], data);
                        }
                    }
                });
            }
            placeBet(m, side, runnerId, price, runnerName, eventName) {
                var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName, true, eventName, 100, true);
                super.executeBet(model.model, true);
            }
        }
        mobile.SevenRaceHighlightCtrl = SevenRaceHighlightCtrl;
        angular.module('intranet.mobile').controller('sevenRaceHighlightCtrl', SevenRaceHighlightCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SevenRaceHighlightCtrl.js.map