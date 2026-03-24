var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class MobileHorseMarketCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, $rootScope, $compile, $filter, $state, WSSocketService, marketOddsService, placeBetDataService, $timeout, localStorageHelper, toasterService, commonDataService, settings, modalService, exposureService, betService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$rootScope = $rootScope;
                this.$compile = $compile;
                this.$filter = $filter;
                this.$state = $state;
                this.WSSocketService = WSSocketService;
                this.marketOddsService = marketOddsService;
                this.placeBetDataService = placeBetDataService;
                this.$timeout = $timeout;
                this.localStorageHelper = localStorageHelper;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.modalService = modalService;
                this.exposureService = exposureService;
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
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        if (data.MarketId == this.$scope.fullMarket.id) {
                            this.getOpenBets();
                            this.getExposure();
                        }
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$rootScope.displayOneClick = false;
                    this.$timeout.cancel(this.$scope.timer_market_status);
                    this.$timeout.cancel(this.$scope.timer_date_diff);
                    listenPPL();
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListnerMarketOdds();
                    wsListner();
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
                this.$rootScope.displayOneClick = true;
                this.commonDataService.getEventTypes().then(() => {
                    this.$scope.raceType = this.commonDataService.getEventTypeName(this.$stateParams.eventtype);
                });
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.getTopHorseMarkets();
            }
            countDateDiff() {
                this.$scope.fullMarket.datediff = this.$filter('dateDiffTime2')(this.$scope.fullMarket.startTime);
                this.$scope.timer_date_diff = this.$timeout(() => { this.countDateDiff(); }, 1000);
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
            getTopHorseMarkets() {
                this.$scope.isRequestProcessing = true;
                var promise;
                promise = this.marketOddsService.getTopRace(this.$stateParams.eventtype);
                this.commonDataService.addMobilePromise(promise);
                promise.success((response) => {
                    if (response.data && response.data.length > 0) {
                        var index = intranet.common.helpers.Utility.IndexOfObject(response.data, 'id', this.$stateParams.marketid);
                        index = index < 0 ? 0 : index;
                        this.setFullmarket(response.data[index]);
                        response.data.splice(index, 1);
                        if (response.data.length > 0) {
                            this.setOtherMarkets(response.data);
                        }
                    }
                }).finally(() => {
                    this.subscribeOdds();
                    this.calculatePPL();
                    if (this.settings.ThemeName == 'sports') {
                        this.countDateDiff();
                    }
                    this.$scope.isRequestProcessing = false;
                    if (this.settings.ThemeName == 'dimd2') {
                        this.getOpenBets();
                    }
                });
            }
            setFullmarket(data) {
                this.$scope.fullMarket = data;
                if (this.$scope.fullMarket.event) {
                    this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                    this.commonDataService.setHorseMetadata(this.$scope.fullMarket);
                }
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
            changeRaceMarket(marketid) {
                this.$state.go("mobile.base.horsemarket", { eventtype: this.$stateParams.eventtype, marketid: marketid });
            }
            setOtherMarkets(data) {
                this.$scope.otherMarkets = this.$filter('orderBy')(data, 'startTime');
                if (this.$scope.otherMarkets.length > 0) {
                    this.$scope.otherMarkets.forEach((m) => {
                        if (this.commonDataService.BetInProcess(m.id)) {
                            m.betInProcess = true;
                        }
                        this.commonDataService.setHorseMetadata(m);
                    });
                }
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
                var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName, true, eventName, 100, true);
                super.executeBet(model.model, true);
            }
            modalPlaceBet(h, side, runnerId, price, runnerName, percentage = 100) {
                var model = new intranet.common.helpers.BetModal(h, side, runnerId, price, runnerName, false, '', percentage);
                this.$scope.stopPPL = true;
                this.$scope.inlineOnMarketOnly = true;
                super.executeBet(model.model, false, true);
            }
            checkAllMarketStatus() {
                if (this.$scope.timer_market_status) {
                    this.$timeout.cancel(this.$scope.timer_market_status);
                }
                if (this.$scope.fullMarket) {
                    if (this.$scope.otherMarkets.length > 0) {
                        if (this.$scope.fullMarket.marketStatus == intranet.common.enums.MarketStatus.CLOSED) {
                            this.changeRaceMarket(this.$scope.otherMarkets[0].id);
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
            openBetsModal() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'My Bets';
                modal.data = {
                    bets: this.$scope.openBets,
                    eventName: this.$scope.fullMarket.event.name
                };
                modal.bodyUrl = this.settings.ThemeName + '/mobile/open-bets-modal.html';
                modal.controller = 'openBetsModalCtrl';
                modal.options.actionButton = '';
                modal.options.closeButton = '';
                modal.options.showFooter = false;
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            getOpenBets() {
                var promise = this.betService.openBetsEvent(this.$scope.fullMarket.eventId);
                promise.success((response) => {
                    this.$scope.countBets = 0;
                    if (response.success && response.data) {
                        this.$scope.openBets = response.data;
                        this.commonDataService.setOpenBets(response.data);
                        this.$scope.openBets.forEach((a) => {
                            this.$scope.countBets = this.$scope.countBets + a.bets.length;
                        });
                    }
                });
            }
            getExposure() {
                this.exposureService.getExposure()
                    .success((response) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
            }
        }
        mobile.MobileHorseMarketCtrl = MobileHorseMarketCtrl;
        angular.module('intranet.mobile').controller('mobileHorseMarketCtrl', MobileHorseMarketCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileHorseMarket.js.map