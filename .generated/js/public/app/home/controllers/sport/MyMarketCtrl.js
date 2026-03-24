var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MyMarketCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $rootScope, $q, $compile, $filter, WSSocketService, marketOddsService, placeBetDataService, $timeout, localStorageHelper, toasterService, commonDataService, settings, betService) {
                super($scope);
                this.$rootScope = $rootScope;
                this.$q = $q;
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
                this.$scope.markets.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = true;
                    }
                });
            }
            betProcessComplete(marketid) {
                this.$scope.markets.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = false;
                    }
                });
            }
            calculatePPL() {
                this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
                if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                    this.$scope.markets.forEach((m) => {
                        var bets = this.$scope.placeBetData.bets.filter((b) => { return b.marketId == m.id; });
                        intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                    });
                }
                else {
                    if (this.$scope.markets) {
                        this.$scope.markets.forEach((m) => {
                            m.marketRunner.forEach((mr) => { mr.pPL = 0; });
                        });
                    }
                }
            }
            initScopeValues() {
                this.$scope.markets = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.isRequestProcessing = false;
                this.$scope.loadderTemplate = this.commonDataService.market_loader_template;
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.loadMyMarkets();
            }
            loadMyMarkets() {
                this.marketOddsService.getMyMarkets()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.markets = this.$filter('orderBy')(response.data, 'event.openDate');
                        this.$scope.markets = this.$scope.markets.filter((a) => { return !a.gameType; });
                        this.$scope.markets.forEach((m) => {
                            m.pin = this.isMarketPinned(m.id);
                            if (this.commonDataService.BetInProcess(m.id)) {
                                m.betInProcess = true;
                            }
                        });
                    }
                }).finally(() => {
                    this.subscribeOdds();
                    this.calculatePPL();
                });
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.markets.length > 0) {
                    this.$scope.markets.forEach((f) => {
                        if (f.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
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
                    if (this.$scope.markets.length > 0) {
                        this.$scope.markets.forEach((f) => {
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
            betAll(m, side) {
                this.betOnAllRunner(m, side);
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
            openBook(marketId, showMe = true) {
                this.commonDataService.openScorePosition(marketId, showMe);
            }
            openBFChart(market, r) {
                var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
                this.commonDataService.openBFChart(ids);
            }
            checkAllMarketStatus() {
                if (this.$scope.timer_market_status) {
                    this.$timeout.cancel(this.$scope.timer_market_status);
                }
                if (this.$scope.markets.length > 0) {
                    this.isMultiMarketClosed(this.$scope.markets);
                }
                if (!this.$scope.$$destroyed) {
                    this.$scope.timer_market_status = this.$timeout(() => {
                        this.checkAllMarketStatus();
                    }, 5000);
                }
            }
        }
        home.MyMarketCtrl = MyMarketCtrl;
        angular.module('intranet.home').controller('myMarketCtrl', MyMarketCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MyMarketCtrl.js.map