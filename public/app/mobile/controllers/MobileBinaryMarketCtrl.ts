module intranet.mobile {

    export interface IMobileBinaryMarketScope extends intranet.common.IBetScopeBase {
        timer_market_status: any;

        fancyMarkets: any[];
        eventId: any;

        placeBetData: any;
        currentInlineBet: any;

        selectedTopTab: any;
        parent: any;

        //open bets
        openBets: any[];
        countBets: any;
        hasUnmatched: boolean;
        hasMatched: boolean;
        editTracker: any[]

        openbet_loader: any;
        spinnerImg: any;

        iframeHeight: any;
    }

    export class MobileBinaryMarketCtrl extends intranet.common.BetControllerBase<IMobileBinaryMarketScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileBinaryMarketScope,
            private $stateParams: any,
            public $rootScope: any,
            private $state: any,
            public $compile: any,
            private $q: ng.IQService,
            private $filter: any,
            public WSSocketService: any,
            private marketService: services.MarketService,
            private commentaryService: services.CommentaryService,
            private marketOddsService: services.MarketOddsService,
            public placeBetDataService: common.services.PlaceBetDataService,
            public $timeout: ng.ITimeoutService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public toasterService: intranet.common.services.ToasterService,
            public commonDataService: common.services.CommonDataService,
            private localCacheHelper: common.helpers.LocalCacheHelper,
            public modalService: common.services.ModalService,
            private exposureService: services.ExposureService,
            private promiseTracker: any,
            public settings: common.IBaseSettings,
            public betService: services.BetService) {
            super($scope);

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
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
                wsListner();
                wsListnerMarketCount();
                wsListnerMarketOdds();
            });
            super.init(this);
        }

        // bet process related
        private betProcessStarted(marketid: any): void {
            this.$scope.fancyMarkets.forEach((o: any) => {
                if (o.id == marketid) { o.betInProcess = true; }
            });
        }

        private betProcessComplete(marketid: any): void {
            this.$scope.fancyMarkets.forEach((o: any) => {
                if (o.id == marketid) { o.betInProcess = false; }
            });
        }

        private calculatePPL(singlemarket: boolean = true): void {
            this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
            if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                if (this.$scope.fancyMarkets) {
                    this.$scope.fancyMarkets.forEach((m: any) => {
                        var bets = this.$scope.placeBetData.bets.filter((b: any) => { return b.marketId == m.id; });
                        intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                    });
                }
            } else {
                if (this.$scope.fancyMarkets) {
                    this.$scope.fancyMarkets.forEach((m: any) => {
                        m.marketRunner.forEach((mr: any) => { mr.pPL = 0; });
                    });
                }
            }
        }

        public initScopeValues() {
            this.$scope.spinnerImg = this.commonDataService.spinnerImg;
            this.$scope.fancyMarkets = [];
            this.$rootScope.displayOneClick = true;
            this.$scope.parent = this.$scope.$parent;
            this.$scope.openBets = [];
            this.$scope.editTracker = [];
            this.$scope.openbet_loader = this.promiseTracker({ activationDelay: 100, minDuration: 750 });
        }

        public loadInitialData() {
            this.getOtherMarkets();
        }

        private handleEventChange(eventid: any, bfEventId: any, eventType: any): void {
            var data = { eventId: eventid, bfEventId: bfEventId, eventType: eventType };
            this.$scope.$emit('event-changed', data);
        }

        private getOtherMarkets(): void {
            this.marketOddsService.getMarketByEventTypeId(this.$stateParams.eventTypeId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.fancyMarkets = response.data;
                        if (this.$scope.fancyMarkets.length > 0) {
                            this.$scope.fancyMarkets.forEach((m: any) => {
                                if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
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



        public subscribeOdds(): void {
            var mids: any[] = [];

            if (this.$scope.fancyMarkets.length > 0) {
                this.$scope.fancyMarkets.forEach((f: any) => {
                    if (f.marketStatus != common.enums.MarketStatus.CLOSED && f.temporaryStatus != common.enums.TemporaryStatus.SUSPEND) {
                        mids.push(f.id);
                    }
                });
            }

            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });
        }

        private setMarketOdds(responseData: any[]): void {
            responseData.forEach((data: any) => {
                if (this.$scope.fancyMarkets.length > 0) {
                    this.$scope.fancyMarkets.forEach((f: any) => {
                        if (f.id == data.id) {
                            this.setOddsInMarket(f, data);
                        }
                    });
                }
            });
        }

        // Place bet
        private placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string, percentage: any = 100, tdId: number = 0): void {
            var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage, true);

            if (m.marketRunner.length == tdId && tdId > 0) {
                this.$scope.inlineElementId = math.multiply(tdId, -1);
            } else {
                this.$scope.inlineElementId = tdId;
            }

            super.executeBet(model.model, true);
        }

        public openBook(marketId: any, showMe: boolean = true): void {
            this.commonDataService.openScorePosition(marketId, showMe);
        }


        // check markets status
        public checkAllMarketStatus(): void {
            if (this.$scope.timer_market_status) { this.$timeout.cancel(this.$scope.timer_market_status); }

            // check fancy market status
            if (this.$scope.fancyMarkets.length > 0) {
                this.isMultiMarketClosed(this.$scope.fancyMarkets);
            }

            // check that any new market added
            //this.checkNewMarket();

            if (!this.$scope.$$destroyed) {
                this.$scope.timer_market_status = this.$timeout(() => {
                    this.checkAllMarketStatus();
                }, 5000);
            }
        }

        public checkNewMarket(data: any[]): void {
            if (this.$scope.fancyMarkets && this.$scope.fancyMarkets.length > 0) {
                var myEvent = data.filter((a: any) => { return a.eventId == this.$scope.eventId; }) || [];
                if (myEvent.length > 0) {
                    var notFouned = 0;
                    myEvent.forEach((ms: any, index: any) => {
                        var isFound = false;
                        var newid = ms.id;

                        if (ms.group == common.enums.MarketGroup.Fancy) {
                            this.$scope.fancyMarkets.forEach((m: any) => {
                                if (m.id == newid && m.temporaryStatus == ms.temporaryStatus) { isFound = true; }
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

        // top tab management
        private tabChanged(index: any): void {
            this.$scope.selectedTopTab = index;
            if (this.settings.ThemeName == 'lotus') {
                if (index == 2 || index == 5 || index == 6) {
                    if (index == 2) this.$scope.selectedTopTab = 5;
                    this.$scope.parent.ctrl.getVideoOptions();
                }
            }
            else {
                if (index == 2) {
                    this.$scope.parent.ctrl.loadVideo(true);
                } else {
                    this.$scope.parent.ctrl.loadVideo(false);
                }
            }

        }

        // open bets
        private getOpenBets(): void {
            var promise = this.betService.openBetsEvent(this.$scope.eventId);
            this.$scope.openbet_loader.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success && response.data) {
                    this.$scope.openBets = response.data;
                    this.commonDataService.setOpenBets(response.data);
                    this.$rootScope.$broadcast("openbets-updated");

                    this.$scope.hasUnmatched = false;
                    this.$scope.hasMatched = false;
                    this.$scope.countBets = 0;
                    this.$scope.openBets.forEach((a: any) => {
                        this.$scope.countBets = this.$scope.countBets + a.bets.length;
                        if (!this.$scope.hasUnmatched) {
                            this.$scope.hasUnmatched = a.bets.some((a: any) => { return a.sizeRemaining > 0 });
                        }
                        if (!this.$scope.hasMatched) {
                            this.$scope.hasMatched = a.bets.some((a: any) => { return a.sizeMatched > 0 });
                        }
                    });
                }
            });
        }


        private cancelBet(bet: any): void {
            this.betService.cancelBet(bet.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.getOpenBets();
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
        }

        private cancelAllBets(): void {
            var ids: any[] = [];
            this.$scope.openBets.forEach((o: any) => {
                var id: any[] = o.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
                if (id.length > 0) {
                    ids = ids.concat(id);
                }
            });
            if (ids.length > 0) {
                this.modalService.showDeleteConfirmation().then((result: any) => {
                    if (result == common.services.ModalResult.OK) {
                        this.betService.cancelAllBets(ids)
                            .success((response: common.messaging.IResponse<any>) => {
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

        private getExposure(): void {
            this.exposureService.getExposure()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
        }


        // update bet
        private updateThisBet(detail: any, bet: any): void {
            this.commonDataService.setBetModelForUpdate(detail, bet);
            this.startInlineBet();
            this.tabChanged(0);
        }

        private openInlineToUpdateBet(): void {
            if (this.$stateParams.betid && this.commonDataService.updateBetModel) {
                this.startInlineBet();
            }
        }

        private startInlineBet(): void {
            var market = this.findMarket(this.commonDataService.updateBetModel.marketId);
            if (market.id) {
                super.updateBet(this.commonDataService.updateBetModel);
            }
        }

        private findMarket(marketid: any): any {
            var market = {};
            var isFound = false;
            this.$scope.fancyMarkets.forEach((m: any) => {
                if (m.id == marketid) { isFound = true; market = m; }
            });
            return market;
        }
    }
    angular.module('intranet.mobile').controller('mobileBinaryMarketCtrl', MobileBinaryMarketCtrl);
}