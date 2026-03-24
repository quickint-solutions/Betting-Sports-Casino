module intranet.home {

    export interface IUpcomingRaceScope extends intranet.common.IBetScopeBase {
        timer_market_status: any;
        isRequestProcessing: any;

        fullMarket: any;
        otherMarkets: any[];
        selectedTab: any;

        pinnedMarkets: any[];
        placeBetData: any;
        currentInlineBet: any;

        raceType: string;
        anyMarketSelected: boolean;
        timer_date_diff: any;
    }

    export class UpcomingRaceCtrl extends intranet.common.BetControllerBase<IUpcomingRaceScope>
        implements intranet.common.init.IInit {
        constructor($scope: IUpcomingRaceScope,
            private $stateParams: any,
            private marketOddsService: services.MarketOddsService,
            public $timeout: ng.ITimeoutService,
            public toasterService: intranet.common.services.ToasterService,
            public $rootScope: any,
            private $state: any,
            public $compile: any,
            private $filter: any,
            private $q: ng.IQService,
            public WSSocketService: any,
            private marketService: services.MarketService,
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

            var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                if (response.success) {
                    this.setMarketOdds(response.data);
                }
            });

            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timer_market_status);
                this.$timeout.cancel(this.$scope.timer_date_diff);
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
            this.$scope.isRequestProcessing = true;
            this.$scope.otherMarkets = [];
            this.$scope.pinnedMarkets = [];
            this.$scope.anyMarketSelected = this.$stateParams.marketid ? true : false;

            this.commonDataService.getEventTypes().then(() => {
                this.$scope.raceType = this.commonDataService.getEventTypeName(this.$stateParams.id);
            });
        }

        public loadInitialData() {
            this.getTopHorseMarkets();
            this.loadPinnedMarkets();
        }

        private countDateDiff() {
            this.$scope.fullMarket.datediff = this.$filter('dateDiffTime2')(this.$scope.fullMarket.startTime);
            this.$scope.timer_date_diff = this.$timeout(() => { this.countDateDiff(); }, 1000);
        }

        private changeHorseMarket(marketid: any): void {
            this.$state.go("base.home.sport.upcomingrace", { nodetype: this.$stateParams.nodetype, id: this.$stateParams.id, marketid: marketid });
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


        // get main market data
        private getTopHorseMarkets(): void {
            this.marketOddsService.getTopRace(this.$stateParams.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            var index = common.helpers.Utility.IndexOfObject(response.data, 'id', this.$stateParams.marketid);
                            index = index < 0 ? 0 : index;
                            this.setFullmarket(response.data[index]);
                            response.data.splice(index, 1);
                            if (response.data.length > 0) {
                                this.setOtherMarkets(response.data);
                            }
                        }
                    }
                }).finally(() => {
                    this.subscribeOdds(); this.calculatePPL();
                    this.countStartTime();
                    this.$scope.isRequestProcessing = false;
                    if (this.settings.ThemeName == 'sports') { this.countDateDiff(); }
                });
        }

        public setFullmarket(data: any): void {
            if (this.$stateParams.marketid && this.$stateParams.marketid != data.id) {
                this.marketOddsService.getFullMarketById(this.$stateParams.marketid)
                    .success((response: common.messaging.IResponse<any>) => {
                        this.$scope.fullMarket = response.data;
                        if (this.$scope.fullMarket.event) {
                            this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                            this.$scope.fullMarket.pin = this.isMarketPinned(this.$scope.fullMarket.id);
                            this.commonDataService.setHorseMetadata(this.$scope.fullMarket);
                        }
                    }).finally(() => { this.subscribeOdds(); this.calculatePPL(); });
            }
            else {
                this.$scope.fullMarket = data;
                if (this.$scope.fullMarket.event) {
                    this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                    this.$scope.fullMarket.pin = this.isMarketPinned(this.$scope.fullMarket.id);
                    this.commonDataService.setHorseMetadata(this.$scope.fullMarket);
                    this.subscribeOdds(); this.calculatePPL();
                }

            }

        }

        private countStartTime(): void {
            if (this.$scope.fullMarket) {
                this.$scope.fullMarket.hh = moment().diff(this.$scope.fullMarket.startTime, 'hours') * -1;
                this.$scope.fullMarket.mm = math.round(moment().diff(this.$scope.fullMarket.startTime, 'minutes') * -1 / 60, 0);

                this.$filter('dateDiff')(this.$scope.fullMarket.startTime);
            }
        }

        // Other Markets
        private getTabName(group: any): any {
            var name = common.enums.MarketGroup[group];
            return name.replaceAll('_', ' ');
        }

        private setOtherMarkets(data: any[]): void {
            this.$scope.otherMarkets = this.$filter('orderBy')(data, 'startTime');
            if (this.$scope.otherMarkets.length > 0) {
                this.$scope.otherMarkets.forEach((m: any) => {
                    if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                    this.commonDataService.setHorseMetadata(m);
                });
            }
        }

        private selectedTabChanged(index: number): void {
            if ((this.settings.ThemeName == 'sports' || this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'dimd') && this.$scope.selectedTab == index) {
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

        // Place bet
        public placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string, eventName: string): void {
            var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, true, eventName);

            super.executeBet(model.model);
        }

        public openBook(marketId: any, showMe: boolean = true): void {
            this.commonDataService.openScorePosition(marketId, showMe);
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
    angular.module('intranet.home').controller('upcomingRaceCtrl', UpcomingRaceCtrl);
}