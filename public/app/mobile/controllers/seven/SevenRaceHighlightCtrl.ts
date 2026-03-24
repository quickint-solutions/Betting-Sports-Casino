module intranet.mobile {
    export interface ISevenRaceHighlightScope extends intranet.common.IBetScopeBase {
        sportTreeList: any[];
        otherMarkets: any[];
        selectedTab: any;
        placeBetData: any;
        currentInlineBet: any;
        isRequestProcessing: boolean;
    }

    export class SevenRaceHighlightCtrl extends intranet.common.BetControllerBase<ISevenRaceHighlightScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISevenRaceHighlightScope,
            private $stateParams: any,
            private $state: any,
            private $filter: any,
            public $timeout: any,
            public toasterService: intranet.common.services.ToasterService,
            public $rootScope: any,
            private $q: ng.IQService,
            public $compile: any,
            public WSSocketService: any,
            public placeBetDataService: common.services.PlaceBetDataService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public commonDataService: common.services.CommonDataService,
            public settings: common.IBaseSettings,
            private competitionService: services.CompetitionService,
            private marketOddsService: services.MarketOddsService,
            public betService: services.BetService,
            private eventService: services.EventService,
            private marketService: services.MarketService) {
            super($scope);

            var listenPPL = this.$rootScope.$on("catch-for-ppl", () => {
                this.calculatePPL(false);
            });

            var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
            var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });

            var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                if (response.success) {
                    this.setMarketOdds(response.data);
                }
            });

            this.$scope.$on('$destroy', () => {
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
            this.$scope.otherMarkets.forEach((m: any) => {
                if (m.id == marketid) { m.betInProcess = true; }
            });
        }

        private betProcessComplete(marketid: any): void {
            this.$scope.otherMarkets.forEach((m: any) => {
                if (m.id == marketid) { m.betInProcess = false; }
            });
        }

        private calculatePPL(singlemarket: boolean = true): void {
            this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
            if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                if (this.$scope.otherMarkets) {
                    this.$scope.otherMarkets.forEach((m: any) => {
                        var bets = this.$scope.placeBetData.bets.filter((b: any) => { return b.marketId == m.id; });
                        intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                    });
                }
            } else {
                if (this.$scope.otherMarkets) {
                    this.$scope.otherMarkets.forEach((m: any) => {
                        m.marketRunner.forEach((mr: any) => { mr.pPL = 0; });
                    });
                }
            }
        }

        public initScopeValues() {
            this.$scope.sportTreeList = [];
            this.$scope.otherMarkets = [];
            this.$scope.isRequestProcessing = true;
        }

        public loadInitialData() {
            this.loadAllHorseMarkets();
        }


        public gotoFullMarket(marketid: any): void {
            this.$state.go("mobile.seven.base.racemarket", { eventtype: this.$stateParams.id, marketid: marketid });
        }

        private loadAllHorseMarkets(): void {
            this.$scope.isRequestProcessing = true;
            var promise: any;
            promise = this.marketOddsService.getRaceMarketList(this.$stateParams.id);
            this.commonDataService.addMobilePromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success && response.data.length > 0) {
                    this.$scope.sportTreeList = response.data;
                    this.getOtherMarkets(this.$scope.sportTreeList.map((s: any) => { return s.id; }))
                } else { this.$scope.isRequestProcessing = false;}
            }).error(() => { this.subscribeOdds(); this.$scope.isRequestProcessing = false;});
        }

        private getOtherMarkets(marketIds: any[]): void {
            var promise = this.marketOddsService.getMultiMarkets(marketIds.slice(0, 10));
            this.commonDataService.addMobilePromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.otherMarkets = this.$filter('orderBy')(response.data, 'startTime');
                        if (this.$scope.otherMarkets.length > 0) {
                            this.$scope.otherMarkets.forEach((m: any) => {
                                if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                                this.commonDataService.setHorseMetadata(m);
                            });
                            this.$scope.selectedTab = 0;
                        }
                    }
                }).finally(() => {
                    this.subscribeOdds();
                    this.calculatePPL();
                    this.$scope.isRequestProcessing = false;
                });
        }

        private selectedTabChanged(index: number): void {
            if ((this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus') && this.$scope.selectedTab == index) {
                this.$scope.selectedTab = -1;
            } else {
                this.$scope.selectedTab = index;
            }
            this.subscribeOdds();
        }


        public subscribeOdds(): void {
            var mids: any[] = [];

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
                if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                    if (this.$scope.otherMarkets[this.$scope.selectedTab].id == data.id) {
                        this.setOddsInMarket(this.$scope.otherMarkets[this.$scope.selectedTab], data);
                    }
                }
            });
        }


        public placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string, eventName: string): void {
            var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, true, eventName, 100, true);

            super.executeBet(model.model, true);
        }

    }

    angular.module('intranet.mobile').controller('sevenRaceHighlightCtrl', SevenRaceHighlightCtrl);
}