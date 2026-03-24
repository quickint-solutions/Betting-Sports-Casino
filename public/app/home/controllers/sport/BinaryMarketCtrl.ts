module intranet.home {

    export interface IBinaryMarketScope extends intranet.common.IBetScopeBase {
        timer_market_status: any;

        fancyMarkets: any[];

        placeBetData: any;
        currentInlineBet: any;

        loadderTemplate: string;
        isRequestProcessing: boolean;
    }

    export class BinaryMarketCtrl extends intranet.common.BetControllerBase<IBinaryMarketScope>
        implements intranet.common.init.IInit {
        constructor($scope: IBinaryMarketScope,
            private $stateParams: any,
            private marketOddsService: services.MarketOddsService,
            public $timeout: ng.ITimeoutService,
            public toasterService: intranet.common.services.ToasterService,
            public $rootScope: any,
            private $state: any,
            private $q: ng.IQService,
            public $compile: any,
            private $filter: any,
            public WSSocketService: any,
            private marketService: services.MarketService,
            private commentaryService: services.CommentaryService,
            public placeBetDataService: common.services.PlaceBetDataService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public commonDataService: common.services.CommonDataService,
            private localCacheHelper: common.helpers.LocalCacheHelper,
            public settings: common.IBaseSettings,
            public betService: services.BetService) {
            super($scope);

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
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
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
            this.$scope.fancyMarkets = [];
            this.$scope.isRequestProcessing = false;
            this.$scope.loadderTemplate = this.commonDataService.market_loader_template;
        }

        public loadInitialData() {
            this.getOtherMarkets();
            this.handleEventChange();
        }

        private handleEventChange(): void {
            this.localCacheHelper.put('eventid', '');
            this.$scope.$emit('event-changed', '');
        }


        private getOtherMarkets(): void {
            this.$scope.isRequestProcessing = true;
            this.marketOddsService.getMarketByEventTypeId(this.$stateParams.eventTypeId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.fancyMarkets = response.data;
                        if (this.$scope.fancyMarkets.length > 0) {
                            this.$scope.fancyMarkets.forEach((m: any) => {
                                if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
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
        public placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string, percentage: any = 100, tdId: number = 0): void {
            var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage);

            if (m.marketRunner.length == tdId && tdId > 0) {
                this.$scope.inlineElementId = math.multiply(tdId, -1);
            } else {
                this.$scope.inlineElementId = tdId;
            }

            super.executeBet(model.model);
        }

        public openBook(marketId: any, showMe: boolean = true): void {
            this.commonDataService.openScorePosition(marketId, showMe);
        }

        public betAll(m: any, side: any) {
            this.betOnAllRunner(m, side);
        }

        // check markets status
        public checkAllMarketStatus(): void {
            if (this.$scope.timer_market_status) { this.$timeout.cancel(this.$scope.timer_market_status); }


            // check fancy market status
            if (this.$scope.fancyMarkets.length > 0) {
                this.isMultiMarketClosed(this.$scope.fancyMarkets);
            }

            // check that is any new market added
            //this.checkNewMarket();

            if (!this.$scope.$$destroyed) {
                this.$scope.timer_market_status = this.$timeout(() => {
                    this.checkAllMarketStatus();
                }, 5000);
            }
        }

        public checkNewMarket(eventId: any): void {
            if (this.$scope.fancyMarkets && this.$scope.fancyMarkets.length > 0) {
                if (eventId == this.$scope.fancyMarkets[0].event.id) { 
                this.marketService.getMarketByEventId(eventId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success && response.data) {
                            var myEvent: any[] = response.data;
                            if (myEvent.length > 0) {
                                var notFounded = 0;
                                myEvent.forEach((ms: any, index: any) => {
                                    var isFound = false;
                                    var newid = ms.id;
                                    this.$scope.fancyMarkets.forEach((m: any) => {
                                        if (m.id == newid && m.temporaryStatus == ms.temporaryStatus) { isFound = true; }
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
    angular.module('intranet.home').controller('binaryMarketCtrl', BinaryMarketCtrl);
}