var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class MobileBinaryMarketCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, $rootScope, $state, $compile, $q, $filter, WSSocketService, marketService, commentaryService, marketOddsService, placeBetDataService, $timeout, localStorageHelper, toasterService, commonDataService, localCacheHelper, modalService, exposureService, promiseTracker, settings, betService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$compile = $compile;
                this.$q = $q;
                this.$filter = $filter;
                this.WSSocketService = WSSocketService;
                this.marketService = marketService;
                this.commentaryService = commentaryService;
                this.marketOddsService = marketOddsService;
                this.placeBetDataService = placeBetDataService;
                this.$timeout = $timeout;
                this.localStorageHelper = localStorageHelper;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.localCacheHelper = localCacheHelper;
                this.modalService = modalService;
                this.exposureService = exposureService;
                this.promiseTracker = promiseTracker;
                this.settings = settings;
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
                        var mr = this.findMarket(data.MarketId);
                        if (mr && mr.id) {
                            console.log('seven market');
                            this.$rootScope.$emit("balance-changed");
                            this.getOpenBets();
                            this.getExposure();
                        }
                    }
                });
                var wsListnerMarketCount = this.$rootScope.$on("ws-marketcount-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        this.checkNewMarket(data);
                    }
                });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                var body = document.getElementsByTagName('body')[0];
                var smallValue = body.clientWidth > body.clientHeight ? body.clientHeight : body.clientWidth;
                var bigValue = body.clientWidth > body.clientHeight ? body.clientWidth : body.clientHeight;
                this.$scope.iframeHeight = (smallValue / bigValue) * body.clientWidth;
                this.$scope.$on('$destroy', () => {
                    this.$scope.parent.wcs_video = '';
                    this.$scope.parent.bf_video = undefined;
                    this.$rootScope.displayOneClick = false;
                    this.$timeout.cancel(this.$scope.timer_market_status);
                    listenPPL();
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListner();
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
                this.$scope.spinnerImg = this.commonDataService.spinnerImg;
                this.$scope.fancyMarkets = [];
                this.$rootScope.displayOneClick = true;
                this.$scope.parent = this.$scope.$parent;
                this.$scope.openBets = [];
                this.$scope.editTracker = [];
                this.$scope.openbet_loader = this.promiseTracker({ activationDelay: 100, minDuration: 750 });
            }
            loadInitialData() {
                this.getOtherMarkets();
            }
            handleEventChange(eventid, bfEventId, eventType) {
                var data = { eventId: eventid, bfEventId: bfEventId, eventType: eventType };
                this.$scope.$emit('event-changed', data);
            }
            getOtherMarkets() {
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
                            this.$scope.eventId = this.$scope.fancyMarkets[0].event.id;
                            this.handleEventChange(this.$scope.eventId, this.$scope.fancyMarkets[0].event.sourceId, this.$scope.fancyMarkets[0].eventType.id);
                        }
                    }
                }).finally(() => {
                    this.calculatePPL();
                    this.subscribeOdds();
                    this.getOpenBets();
                    this.getExposure();
                    this.$timeout(() => { this.openInlineToUpdateBet(); }, 500);
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
                var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage, true);
                if (m.marketRunner.length == tdId && tdId > 0) {
                    this.$scope.inlineElementId = math.multiply(tdId, -1);
                }
                else {
                    this.$scope.inlineElementId = tdId;
                }
                super.executeBet(model.model, true);
            }
            openBook(marketId, showMe = true) {
                this.commonDataService.openScorePosition(marketId, showMe);
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
            checkNewMarket(data) {
                if (this.$scope.fancyMarkets && this.$scope.fancyMarkets.length > 0) {
                    var myEvent = data.filter((a) => { return a.eventId == this.$scope.eventId; }) || [];
                    if (myEvent.length > 0) {
                        var notFouned = 0;
                        myEvent.forEach((ms, index) => {
                            var isFound = false;
                            var newid = ms.id;
                            if (ms.group == intranet.common.enums.MarketGroup.Fancy) {
                                this.$scope.fancyMarkets.forEach((m) => {
                                    if (m.id == newid && m.temporaryStatus == ms.temporaryStatus) {
                                        isFound = true;
                                    }
                                });
                            }
                            if (!isFound) {
                                notFouned = 1;
                            }
                        });
                        if (notFouned > 0) {
                            this.getOtherMarkets();
                        }
                    }
                }
            }
            tabChanged(index) {
                this.$scope.selectedTopTab = index;
                if (this.settings.ThemeName == 'lotus') {
                    if (index == 2 || index == 5 || index == 6) {
                        if (index == 2)
                            this.$scope.selectedTopTab = 5;
                        this.$scope.parent.ctrl.getVideoOptions();
                    }
                }
                else {
                    if (index == 2) {
                        this.$scope.parent.ctrl.loadVideo(true);
                    }
                    else {
                        this.$scope.parent.ctrl.loadVideo(false);
                    }
                }
            }
            getOpenBets() {
                var promise = this.betService.openBetsEvent(this.$scope.eventId);
                this.$scope.openbet_loader.addPromise(promise);
                promise.success((response) => {
                    if (response.success && response.data) {
                        this.$scope.openBets = response.data;
                        this.commonDataService.setOpenBets(response.data);
                        this.$rootScope.$broadcast("openbets-updated");
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
            getExposure() {
                this.exposureService.getExposure()
                    .success((response) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
            }
            updateThisBet(detail, bet) {
                this.commonDataService.setBetModelForUpdate(detail, bet);
                this.startInlineBet();
                this.tabChanged(0);
            }
            openInlineToUpdateBet() {
                if (this.$stateParams.betid && this.commonDataService.updateBetModel) {
                    this.startInlineBet();
                }
            }
            startInlineBet() {
                var market = this.findMarket(this.commonDataService.updateBetModel.marketId);
                if (market.id) {
                    super.updateBet(this.commonDataService.updateBetModel);
                }
            }
            findMarket(marketid) {
                var market = {};
                var isFound = false;
                this.$scope.fancyMarkets.forEach((m) => {
                    if (m.id == marketid) {
                        isFound = true;
                        market = m;
                    }
                });
                return market;
            }
        }
        mobile.MobileBinaryMarketCtrl = MobileBinaryMarketCtrl;
        angular.module('intranet.mobile').controller('mobileBinaryMarketCtrl', MobileBinaryMarketCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileBinaryMarketCtrl.js.map