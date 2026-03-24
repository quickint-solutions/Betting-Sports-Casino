var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class BinaryMarketCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, marketOddsService, $timeout, toasterService, $rootScope, $state, $q, $compile, $filter, WSSocketService, marketService, commentaryService, placeBetDataService, localStorageHelper, commonDataService, localCacheHelper, settings, betService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.toasterService = toasterService;
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$q = $q;
                this.$compile = $compile;
                this.$filter = $filter;
                this.WSSocketService = WSSocketService;
                this.marketService = marketService;
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
                    listenPPL();
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListnerMarketCount();
                    wsListnerMarketOdds();
                });
                super.init(this);
            }
            betProcessStarted(marketid) {
                this.$scope.fancyMarkets.forEach((o) => {
                    if (o.id == marketid) {
                        o.betInProcess = true;
                    }
                });
            }
            betProcessComplete(marketid) {
                this.$scope.fancyMarkets.forEach((o) => {
                    if (o.id == marketid) {
                        o.betInProcess = false;
                    }
                });
            }
            calculatePPL(singlemarket = true) {
                this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
                if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                    if (this.$scope.fancyMarkets) {
                        this.$scope.fancyMarkets.forEach((m) => {
                            var bets = this.$scope.placeBetData.bets.filter((b) => { return b.marketId == m.id; });
                            intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                        });
                    }
                }
                else {
                    if (this.$scope.fancyMarkets) {
                        this.$scope.fancyMarkets.forEach((m) => {
                            m.marketRunner.forEach((mr) => { mr.pPL = 0; });
                        });
                    }
                }
            }
            initScopeValues() {
                this.$scope.fancyMarkets = [];
                this.$scope.isRequestProcessing = false;
                this.$scope.loadderTemplate = this.commonDataService.market_loader_template;
            }
            loadInitialData() {
                this.getOtherMarkets();
                this.handleEventChange();
            }
            handleEventChange() {
                this.localCacheHelper.put('eventid', '');
                this.$scope.$emit('event-changed', '');
            }
            getOtherMarkets() {
                this.$scope.isRequestProcessing = true;
                this.marketOddsService.getMarketByEventTypeId(this.$stateParams.eventTypeId)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.fancyMarkets = response.data;
                        if (this.$scope.fancyMarkets.length > 0) {
                            this.$scope.fancyMarkets.forEach((m) => {
                                if (this.commonDataService.BetInProcess(m.id)) {
                                    m.betInProcess = true;
                                }
                            });
                        }
                    }
                }).finally(() => {
                    this.$scope.isRequestProcessing = false;
                    if (this.$scope.fancyMarkets.length > 0) {
                        this.subscribeOdds();
                    }
                    this.calculatePPL();
                });
            }
            subscribeOdds() {
                var mids = [];
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
                    if (this.$scope.fancyMarkets.length > 0) {
                        this.$scope.fancyMarkets.forEach((f) => {
                            if (f.id == data.id) {
                                this.setOddsInMarket(f, data);
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
                if (this.$scope.fancyMarkets.length > 0) {
                    this.isMultiMarketClosed(this.$scope.fancyMarkets);
                }
                if (!this.$scope.$$destroyed) {
                    this.$scope.timer_market_status = this.$timeout(() => {
                        this.checkAllMarketStatus();
                    }, 5000);
                }
            }
            checkNewMarket(eventId) {
                if (this.$scope.fancyMarkets && this.$scope.fancyMarkets.length > 0) {
                    if (eventId == this.$scope.fancyMarkets[0].event.id) {
                        this.marketService.getMarketByEventId(eventId)
                            .success((response) => {
                            if (response.success && response.data) {
                                var myEvent = response.data;
                                if (myEvent.length > 0) {
                                    var notFounded = 0;
                                    myEvent.forEach((ms, index) => {
                                        var isFound = false;
                                        var newid = ms.id;
                                        this.$scope.fancyMarkets.forEach((m) => {
                                            if (m.id == newid && m.temporaryStatus == ms.temporaryStatus) {
                                                isFound = true;
                                            }
                                        });
                                        if (!isFound) {
                                            notFounded = 1;
                                        }
                                    });
                                    if (notFounded > 0) {
                                        this.getOtherMarkets();
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
        home.BinaryMarketCtrl = BinaryMarketCtrl;
        angular.module('intranet.home').controller('binaryMarketCtrl', BinaryMarketCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BinaryMarketCtrl.js.map