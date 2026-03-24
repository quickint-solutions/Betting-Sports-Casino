var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class SevenRaceMarketCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, marketOddsService, $timeout, toasterService, $rootScope, $state, $compile, $q, $filter, WSSocketService, marketService, placeBetDataService, localStorageHelper, commonDataService, localCacheHelper, exposureService, settings, modalService, betService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.toasterService = toasterService;
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$compile = $compile;
                this.$q = $q;
                this.$filter = $filter;
                this.WSSocketService = WSSocketService;
                this.marketService = marketService;
                this.placeBetDataService = placeBetDataService;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.localCacheHelper = localCacheHelper;
                this.exposureService = exposureService;
                this.settings = settings;
                this.modalService = modalService;
                this.betService = betService;
                var listenPPL = this.$rootScope.$on("catch-for-ppl", () => {
                    this.calculatePPL();
                    this.calculatePPL(false);
                });
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        if (this.$scope.fullMarket != undefined && data.MarketId == this.$scope.fullMarket.id) {
                            console.log('seven race');
                            this.$rootScope.$emit("balance-changed");
                            this.getOpenBets();
                            this.getExposure();
                        }
                    }
                });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_market_status);
                    this.$timeout.cancel(this.$scope.timer_openbet);
                    listenPPL();
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListner();
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
                this.$scope.isRequestProcessing = false;
                this.$scope.loadderTemplate = this.commonDataService.mobile_market_loader_template;
                this.$scope.selectedTopTab = 0;
                this.$scope.raceType = this.commonDataService.getEventTypeName(this.$stateParams.eventtype);
            }
            loadInitialData() {
                this.getTopHorseMarkets();
            }
            changeRaceMarket(marketid) {
                if (this.settings.ThemeName == 'dimd') {
                    this.$state.go("mobile.base.horsemarket", { eventtype: this.$stateParams.eventtype, marketid: marketid });
                }
                else {
                    this.$state.go("mobile.seven.base.racemarket", { eventtype: this.$stateParams.eventtype, marketid: marketid });
                }
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
                    this.$scope.isRequestProcessing = false;
                    this.subscribeOdds();
                    this.getOpenBets();
                    this.getExposure();
                    this.calculatePPL();
                    this.$timeout(() => { this.openInlineToUpdateBet(); }, 500);
                });
            }
            setFullmarket(data) {
                this.$scope.fullMarket = data;
                if (this.$scope.fullMarket.event) {
                    this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                    this.commonDataService.setHorseMetadata(this.$scope.fullMarket);
                }
            }
            getTabName(group) {
                var name = intranet.common.enums.MarketGroup[group];
                return name.replaceAll('_', ' ');
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
            selectedTabChanged(index) {
                if ((this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') && this.$scope.selectedTab == index) {
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
            placeBet(m, side, runnerId, price, runnerName) {
                var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName, true, '', 100, true);
                super.executeBet(model.model, true);
            }
            openBook(marketId, showMe = true) {
                this.commonDataService.openScorePosition(marketId, showMe);
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
            tabChanged(index) {
                this.$scope.selectedTopTab = index;
            }
            getOpenBets() {
                var promise = this.betService.openBetsEvent(this.$scope.fullMarket.eventId);
                promise.success((response) => {
                    if (response.success && response.data) {
                        this.$scope.openBets = response.data;
                        this.$scope.hasUnmatched = false;
                        this.$scope.hasMatched = false;
                        this.$scope.countBets = 0;
                        this.$scope.openBets.forEach((a) => {
                            this.$scope.countBets = this.$scope.countBets + a.bets.length;
                            if (!this.$scope.hasUnmatched) {
                                this.$scope.hasUnmatched = a.bets.some((a) => { return a.sizeRemaining > 0; });
                            }
                            if (!this.$scope.hasMatched) {
                                this.$scope.hasMatched = a.bets.some((a) => { return a.sizeMatched > 0; });
                            }
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
            cancelBet(bet) {
                this.betService.cancelBet(bet.id)
                    .success((response) => {
                    if (response.success) {
                        this.getOpenBets();
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
            }
            cancelAllBets() {
                var ids = [];
                this.$scope.openBets.forEach((o) => {
                    var id = o.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
                    if (id.length > 0) {
                        ids = ids.concat(id);
                    }
                });
                if (ids.length > 0) {
                    this.modalService.showDeleteConfirmation().then((result) => {
                        if (result == intranet.common.services.ModalResult.OK) {
                            this.betService.cancelAllBets(ids)
                                .success((response) => {
                                if (response.success) {
                                    this.getOpenBets();
                                }
                                if (response.messages) {
                                    this.toasterService.showMessages(response.messages, 3000);
                                }
                            });
                        }
                    });
                }
            }
            updateThisBet(detail, bet) {
                this.commonDataService.setBetModelForUpdate(detail, bet);
                this.tabChanged(0);
                super.updateBet(this.commonDataService.updateBetModel);
            }
            openInlineToUpdateBet() {
                if (this.$stateParams.betid && this.commonDataService.updateBetModel) {
                    super.updateBet(this.commonDataService.updateBetModel);
                }
            }
        }
        mobile.SevenRaceMarketCtrl = SevenRaceMarketCtrl;
        angular.module('intranet.mobile').controller('sevenRaceMarketCtrl', SevenRaceMarketCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SevenRaceMarketCtrl.js.map