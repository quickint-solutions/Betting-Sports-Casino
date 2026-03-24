var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class HorseMarketCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, $state, $rootScope, $compile, $filter, WSSocketService, marketOddsService, placeBetDataService, $timeout, localStorageHelper, toasterService, commonDataService, settings, betService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.$rootScope = $rootScope;
                this.$compile = $compile;
                this.$filter = $filter;
                this.WSSocketService = WSSocketService;
                this.marketOddsService = marketOddsService;
                this.placeBetDataService = placeBetDataService;
                this.$timeout = $timeout;
                this.localStorageHelper = localStorageHelper;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.betService = betService;
                var listenPPL = this.$rootScope.$on("catch-for-ppl", () => {
                    this.calculatePPL();
                });
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_market_status);
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
                if (this.$scope.fullMarket.id == marketid) {
                    this.$scope.fullMarket.betInProcess = true;
                }
                else {
                    this.$scope.otherMarkets.forEach((m) => {
                        if (m.id == marketid) {
                            m.betInProcess = true;
                        }
                    });
                }
            }
            betProcessComplete(marketid) {
                if (this.$scope.fullMarket.id == marketid) {
                    this.$scope.fullMarket.betInProcess = false;
                }
                else {
                    this.$scope.otherMarkets.forEach((m) => {
                        if (m.id == marketid) {
                            m.betInProcess = false;
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
                            this.$scope.otherMarkets.forEach((m) => {
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
                        this.$scope.otherMarkets.forEach((m) => {
                            m.marketRunner.forEach((mr) => { mr.pPL = 0; });
                        });
                    }
                }
            }
            initScopeValues() {
                this.$scope.otherMarkets = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.loadderTemplate = this.commonDataService.highlight_loader_template;
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.getFullmarket();
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
            openBFChart(market, r) {
                var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
                this.commonDataService.openBFChart(ids);
            }
            getFullmarket() {
                this.marketOddsService.getRaceMarketById(this.$stateParams.marketid)
                    .success((response) => {
                    if (response.success && response.data) {
                        this.$scope.fullMarket = response.data;
                        this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                        this.$scope.fullMarket.pin = this.isMarketPinned(this.$scope.fullMarket.id);
                        this.getTopRaces(this.$scope.fullMarket.eventType.id);
                    }
                }).finally(() => {
                    this.subscribeOdds();
                    this.calculatePPL();
                });
            }
            getTopRaces(eventtypeid) {
                this.marketOddsService.getTopRace(eventtypeid)
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            if (this.$stateParams.marketid) {
                                var index = intranet.common.helpers.Utility.IndexOfObject(response.data, 'id', this.$stateParams.marketid);
                                if (index > -1) {
                                    response.data.splice(index, 1);
                                    if (response.data.length > 0) {
                                        this.getOtherMarkets(response.data.map((r) => { return r.id; }));
                                    }
                                }
                                else {
                                    this.getOtherMarkets(response.data.map((r) => { return r.id; }));
                                }
                            }
                        }
                    }
                });
            }
            changeHorseMarket(marketid) {
                this.$state.go("base.home.sport.fullracemarket", { nodetype: this.$stateParams.nodetype, id: this.$stateParams.id, marketid: marketid });
            }
            getOtherMarkets(marketIds) {
                this.marketOddsService.getMultiMarkets(marketIds)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.otherMarkets = this.$filter('orderBy')(response.data, 'startTime');
                        if (this.$scope.otherMarkets.length > 0) {
                            this.$scope.otherMarkets.forEach((m) => {
                                if (this.commonDataService.BetInProcess(m.id)) {
                                    m.betInProcess = true;
                                }
                            });
                        }
                    }
                }).finally(() => { this.subscribeOdds(); this.calculatePPL(); });
            }
            selectedTabChanged(index) {
                if (this.$scope.selectedTab == index) {
                    this.$scope.selectedTab = -1;
                }
                else {
                    this.$scope.selectedTab = index;
                }
                this.subscribeOdds();
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.fullMarket && this.$scope.fullMarket.id) {
                    mids.push(this.$scope.fullMarket.id);
                }
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
                    if (this.$scope.fullMarket && this.$scope.fullMarket.id == data.id) {
                        this.setOddsInMarket(this.$scope.fullMarket, data);
                    }
                    if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                        if (this.$scope.otherMarkets[this.$scope.selectedTab].id == data.id) {
                            this.setOddsInMarket(this.$scope.otherMarkets[this.$scope.selectedTab], data);
                        }
                    }
                });
            }
            placeBet(m, side, eventName, runnerId, price, runnerName) {
                var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName, true, eventName);
                super.executeBet(model.model);
            }
            betAll(m, side) {
                this.betOnAllRunner(m, side, true);
            }
            checkAllMarketStatus() {
                if (this.$scope.timer_market_status) {
                    this.$timeout.cancel(this.$scope.timer_market_status);
                }
                if (this.$scope.fullMarket) {
                    if (this.$scope.otherMarkets.length > 0) {
                        if (this.$scope.fullMarket.marketStatus == intranet.common.enums.MarketStatus.CLOSED) {
                            this.changeHorseMarket(this.$scope.otherMarkets[0].id);
                        }
                    }
                    else {
                        this.isSingleMarketClosed(this.$scope.fullMarket, this.$state);
                    }
                }
                if (this.$scope.otherMarkets.length > 0) {
                    this.isMultiMarketClosed(this.$scope.otherMarkets);
                }
                if (!this.$scope.$$destroyed) {
                    this.$scope.timer_market_status = this.$timeout(() => {
                        this.checkAllMarketStatus();
                    }, 5000);
                }
            }
        }
        home.HorseMarketCtrl = HorseMarketCtrl;
        angular.module('intranet.home').controller('horseMarketCtrl', HorseMarketCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=HorseMarketCtrl.js.map