module intranet.mobile {
    export interface IMobileMultiMarketScope extends intranet.common.IBetScopeBase {
        pinnedMarkets: any[];
        markets: any[];

        timer_market_status

        placeBetData: any;
        currentInlineBet: any;

    }

    export class MobileMultiMarketCtrl extends intranet.common.BetControllerBase<IMobileMultiMarketScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileMultiMarketScope,
            public $rootScope: any,
            public $compile: any,
            private $filter: any,
            public WSSocketService: any,
            private marketOddsService: services.MarketOddsService,
            public placeBetDataService: common.services.PlaceBetDataService,
            public $timeout: ng.ITimeoutService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public toasterService: intranet.common.services.ToasterService,
            public commonDataService: common.services.CommonDataService,
            public settings: common.IBaseSettings,
            public betService: services.BetService) {
            super($scope);

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
                this.$rootScope.displayOneClick = false;
                this.$timeout.cancel(this.$scope.timer_market_status);
                listenPPL();
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
                wsListnerMarketOdds();
            });
            super.init(this);
        }

        // bet process related
        private betProcessStarted(marketid: any): void {
            this.$scope.markets.forEach((m: any) => {
                if (m.id == marketid) { m.betInProcess = true; }
            });
        }

        private betProcessComplete(marketid: any): void {
            this.$scope.markets.forEach((m: any) => {
                if (m.id == marketid) { m.betInProcess = false; }
            });
        }

        private calculatePPL(): void {
            this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
            if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                this.$scope.markets.forEach((m: any) => {
                    var bets = this.$scope.placeBetData.bets.filter((b: any) => { return b.marketId == m.id; });
                    intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                });

            } else {
                if (this.$scope.markets) {
                    this.$scope.markets.forEach((m: any) => {
                        m.marketRunner.forEach((mr: any) => { mr.pPL = 0; });
                    });
                }
            }
        }

        public initScopeValues(): void {
            this.$scope.pinnedMarkets = [];
            this.$rootScope.displayOneClick = true;
        }

        public loadInitialData(): void {
            this.loadPinnedMarkets();
            this.loadMarkets();
        }

        private openBFChart(market: any, r: any): void {
            var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
            this.commonDataService.openBFChart(ids);
        }

        // load already pinned market from storage
        private loadPinnedMarkets(): void {
            var pinned = this.localStorageHelper.get(this.settings.MultiMarketPin);
            if (pinned) {
                this.$scope.pinnedMarkets = pinned;
            }
        }

        private loadMarkets(): void {
            if (this.$scope.pinnedMarkets.length > 0) {
                var promise: any;
                promise = this.marketOddsService.getMultiMarkets(this.$scope.pinnedMarkets);
                this.commonDataService.addMobilePromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.markets = this.$filter('orderBy')(response.data, 'event.openDate');
                            this.$scope.markets.forEach((m: any) => {
                                if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                            });
                        }
                    }).finally(() => { this.calculatePPL(); this.subscribeOdds(); });
            }
        }

        public subscribeOdds(): void {
            var mids: any[] = [];
            if (this.$scope.markets.length > 0) {
                this.$scope.markets.forEach((f: any) => {
                    if (f.marketStatus != common.enums.MarketStatus.CLOSED) {
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
                if (this.$scope.markets.length > 0) {
                    this.$scope.markets.forEach((f: any) => {
                        if (f.id == data.id) {
                            this.setOddsInMarket(f, data);
                            if (f.prepareRadarView) { f.prepareRadarView(); }
                        }
                    });
                }
            });
        }


        private placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string, percentage: any = 100, tdId: number = 0, trId: number = 0): void {
            var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage, true);

            if (m.marketRunner.length == tdId && tdId > 0) {
                this.$scope.inlineElementId = math.multiply(tdId, -1);
            } else {
                this.$scope.inlineElementId = tdId;
            }
            this.$scope.inlineTRElementId = 0;
            if (trId != 0) {
                this.$scope.inlineTRElementId = trId;
            }
            super.executeBet(model.model, true);
        }

        private unPinMe(marketid: any): void {
            var index = this.$scope.pinnedMarkets.indexOf(marketid);
            if (index > -1) {
                this.$scope.pinnedMarkets.splice(index, 1);
                this.localStorageHelper.removeFromArray(this.settings.MultiMarketPin, marketid);
                var mindex = common.helpers.Utility.IndexOfObject(this.$scope.markets, "id", marketid);
                if (mindex > -1) {
                    this.$scope.markets.splice(mindex, 1);
                }
            }
        }

        public openBook(marketId: any, showMe: boolean = true): void {
            this.commonDataService.openScorePosition(marketId, showMe);
        }


        // check markets status
        public checkAllMarketStatus(): void {
            if (this.$scope.markets) {
                if (this.$scope.timer_market_status) { this.$timeout.cancel(this.$scope.timer_market_status); }


                // check market status
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
    }

    angular.module('intranet.mobile').controller('mobileMultiMarketCtrl', MobileMultiMarketCtrl);

}