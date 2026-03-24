module intranet.home {

    export interface IHorseMarketScope extends intranet.common.IBetScopeBase {
        timer_market_status: any;

        fullMarket: any;
        otherMarkets: any;
        selectedTab: any;

        placeBetData: any;
        currentInlineBet: any;
        pinnedMarkets: any[];

        loadderTemplate: string;
    }


    export class HorseMarketCtrl extends intranet.common.BetControllerBase<IHorseMarketScope>
        implements intranet.common.init.IInit {
        constructor($scope: IHorseMarketScope,
            private $stateParams: any,
            private $state: any,
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
            if (this.$scope.fullMarket.id == marketid) {
                this.$scope.fullMarket.betInProcess = true;
            } else {
                this.$scope.otherMarkets.forEach((m: any) => {
                    if (m.id == marketid) { m.betInProcess = true; }
                });
            }
        }

        private betProcessComplete(marketid: any): void {
            if (this.$scope.fullMarket.id == marketid) {
                this.$scope.fullMarket.betInProcess = false;
            } else {
                this.$scope.otherMarkets.forEach((m: any) => {
                    if (m.id == marketid) { m.betInProcess = false; }
                });
            }
        }

        private calculatePPL(singlemarket: boolean = true): void {
            this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
            if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                if (singlemarket && this.$scope.fullMarket) {
                    var bets = this.$scope.placeBetData.bets.filter((b: any) => { return b.marketId == this.$scope.fullMarket.id; });
                    intranet.common.helpers.PotentialPLCalc.calcPL(this.$scope.fullMarket, bets);
                }
                else {
                    if (this.$scope.otherMarkets) {
                        this.$scope.otherMarkets.forEach((m: any) => {
                            var bets = this.$scope.placeBetData.bets.filter((b: any) => { return b.marketId == m.id; });
                            intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                        });
                    }
                }
            } else {
                if (this.$scope.fullMarket) { this.$scope.fullMarket.marketRunner.forEach((mr: any) => { mr.pPL = 0; }); }

                if (this.$scope.otherMarkets) {
                    this.$scope.otherMarkets.forEach((m: any) => {
                        m.marketRunner.forEach((mr: any) => { mr.pPL = 0; });
                    });
                }
            }
        }

        public initScopeValues() {
            this.$scope.otherMarkets = [];
            this.$scope.pinnedMarkets = [];
            this.$scope.loadderTemplate = this.commonDataService.highlight_loader_template;
        }

        public loadInitialData() {
            this.loadPinnedMarkets();
            this.getFullmarket();
        }

        // pin/unpin market
        private loadPinnedMarkets(): void {
            var pinned = this.localStorageHelper.get(this.settings.MultiMarketPin);
            if (pinned) {
                this.$scope.pinnedMarkets = pinned;
            }
        }

        private isMarketPinned(marketid: any): any {
            return this.$scope.pinnedMarkets.some((m: any) => { return m == marketid; });
        }

        private pinMe(market: any): void {
            market.pin = !market.pin;
            if (market.pin) {
                this.localStorageHelper.setInArray(this.settings.MultiMarketPin, market.id);
                this.$scope.pinnedMarkets.push(market.id);
            }
            else {
                this.localStorageHelper.removeFromArray(this.settings.MultiMarketPin, market.id);
                var index = this.$scope.pinnedMarkets.indexOf(market.id);
                if (index > -1) { this.$scope.pinnedMarkets.splice(index, 1); }
            }
        }

        private openBFChart(market: any, r: any): void {
            var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
            this.commonDataService.openBFChart(ids);
        }

        // get main market data
        public getFullmarket(): void {
            this.marketOddsService.getRaceMarketById(this.$stateParams.marketid)
                .success((response: common.messaging.IResponse<any>) => {
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

        public getTopRaces(eventtypeid: any): void {
            this.marketOddsService.getTopRace(eventtypeid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            if (this.$stateParams.marketid) {
                                var index = common.helpers.Utility.IndexOfObject(response.data, 'id', this.$stateParams.marketid);
                                if (index > -1) {
                                    response.data.splice(index, 1);
                                    if (response.data.length > 0) {
                                        this.getOtherMarkets(response.data.map((r: any) => { return r.id; }));
                                    }
                                } else {
                                    this.getOtherMarkets(response.data.map((r: any) => { return r.id; }));
                                }
                            }
                        }
                    }
                });
        }

        private changeHorseMarket(marketid: any): void {
            this.$state.go("base.home.sport.fullracemarket", { nodetype: this.$stateParams.nodetype, id: this.$stateParams.id, marketid: marketid });
        }

        private getOtherMarkets(marketIds: any): void {
            this.marketOddsService.getMultiMarkets(marketIds)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.otherMarkets = this.$filter('orderBy')(response.data, 'startTime');
                        if (this.$scope.otherMarkets.length > 0) {
                            this.$scope.otherMarkets.forEach((m: any) => {
                                if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                            });
                        }
                    }
                }).finally(() => { this.subscribeOdds(); this.calculatePPL(); });
        }

        private selectedTabChanged(index: number): void {
            if (this.$scope.selectedTab == index) {
                this.$scope.selectedTab = -1;
            } else {
                this.$scope.selectedTab = index;
            }
            this.subscribeOdds();
        }

        public subscribeOdds(): void {
            var mids: any[] = [];

            if (this.$scope.fullMarket && this.$scope.fullMarket.id) {
                mids.push(this.$scope.fullMarket.id);
            }
            if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                if (this.$scope.otherMarkets[this.$scope.selectedTab].marketStatus != common.enums.MarketStatus.CLOSED) {
                    mids.push(this.$scope.otherMarkets[this.$scope.selectedTab].id);
                }
            }

            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });
        }

        private setMarketOdds(responseData: any[]): void {
            responseData.forEach((data: any) => {
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

        private placeBet(m: any, side: any, eventName: string, runnerId: any, price: any, runnerName: string): void {
            var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, true, eventName);
            super.executeBet(model.model);
        }

        public betAll(m: any, side: any) {
            this.betOnAllRunner(m, side, true);
        }

        // check markets status
        public checkAllMarketStatus(): void {
            if (this.$scope.timer_market_status) { this.$timeout.cancel(this.$scope.timer_market_status); }

            // redirect to home if market closed
            if (this.$scope.fullMarket) {
                if (this.$scope.otherMarkets.length > 0) {
                    if (this.$scope.fullMarket.marketStatus == common.enums.MarketStatus.CLOSED) {
                        this.changeHorseMarket(this.$scope.otherMarkets[0].id);
                    }
                } else {
                    this.isSingleMarketClosed(this.$scope.fullMarket, this.$state);
                }
            }

            // change selected tab from other market
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
    angular.module('intranet.home').controller('horseMarketCtrl', HorseMarketCtrl);
}