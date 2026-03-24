module intranet.mobile {

    export interface IMobileHorseMarketScope extends intranet.common.IBetScopeBase {
        timer_market_status

        fullMarket: any;
        otherMarkets: any[];
        selectedTab: any;

        placeBetData: any;
        currentInlineBet: any;
        pinnedMarkets: any[];

        raceType: string;
        timer_date_diff: any;

        isRequestProcessing: any;

        openBets: any[];
        countBets: any;
    }


    export class MobileHorseMarketCtrl extends intranet.common.BetControllerBase<IMobileHorseMarketScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileHorseMarketScope,
            private $stateParams: any,
            public $rootScope: any,
            public $compile: any,
            private $filter: any,
            private $state: any,
            public WSSocketService: any,
            private marketOddsService: services.MarketOddsService,
            public placeBetDataService: common.services.PlaceBetDataService,
            public $timeout: ng.ITimeoutService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public toasterService: intranet.common.services.ToasterService,
            public commonDataService: common.services.CommonDataService,
            public settings: common.IBaseSettings,
            public modalService: common.services.ModalService,
            private exposureService: services.ExposureService,
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
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
                wsListnerMarketOdds();
                wsListner();
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
            this.$rootScope.displayOneClick = true;

            this.commonDataService.getEventTypes().then(() => {
                this.$scope.raceType = this.commonDataService.getEventTypeName(this.$stateParams.eventtype);
            });
        }

        public loadInitialData() {
            this.loadPinnedMarkets();
            this.getTopHorseMarkets();
        }

        private countDateDiff() {
            this.$scope.fullMarket.datediff = this.$filter('dateDiffTime2')(this.$scope.fullMarket.startTime);
            this.$scope.timer_date_diff = this.$timeout(() => { this.countDateDiff(); }, 1000);
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
        private getTopHorseMarkets(): void {
            this.$scope.isRequestProcessing = true;
            var promise: any;
            promise = this.marketOddsService.getTopRace(this.$stateParams.eventtype);
            this.commonDataService.addMobilePromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.data && response.data.length > 0) {
                    var index = common.helpers.Utility.IndexOfObject(response.data, 'id', this.$stateParams.marketid);
                    index = index < 0 ? 0 : index;
                    this.setFullmarket(response.data[index]);
                    response.data.splice(index, 1);
                    if (response.data.length > 0) {
                        this.setOtherMarkets(response.data);
                    }
                }
            }).finally(() => {
                this.subscribeOdds(); this.calculatePPL();
                if (this.settings.ThemeName == 'sports') { this.countDateDiff(); }
                this.$scope.isRequestProcessing = false;
                if (this.settings.ThemeName == 'dimd2') { this.getOpenBets(); }
            });
        }

        public setFullmarket(data: any): void {
            this.$scope.fullMarket = data;
            if (this.$scope.fullMarket.event) {
                this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                this.commonDataService.setHorseMetadata(this.$scope.fullMarket);
            }
        }

        private selectedTabChanged(index: number): void {
            if (this.$scope.selectedTab == index) {
                this.$scope.selectedTab = -1;
            } else {
                this.$scope.selectedTab = index;
            }
            this.subscribeOdds();
        }

        private changeRaceMarket(marketid: any): void {
            this.$state.go("mobile.base.horsemarket", { eventtype: this.$stateParams.eventtype, marketid: marketid });
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
            var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, true, eventName, 100, true);
            super.executeBet(model.model, true);
        }

        private modalPlaceBet(h: any, side: any, runnerId: any, price: any, runnerName: string, percentage: any = 100): void {
            var model = new common.helpers.BetModal(h, side, runnerId, price, runnerName, false, '', percentage);
            this.$scope.stopPPL = true;
            this.$scope.inlineOnMarketOnly = true;
            super.executeBet(model.model, false, true);
        }


        // check markets status
        public checkAllMarketStatus(): void {
            if (this.$scope.timer_market_status) { this.$timeout.cancel(this.$scope.timer_market_status); }

            // redirect to home if market closed
            if (this.$scope.fullMarket) {
                if (this.$scope.otherMarkets.length > 0) {
                    if (this.$scope.fullMarket.marketStatus == common.enums.MarketStatus.CLOSED) {
                        this.changeRaceMarket(this.$scope.otherMarkets[0].id);
                    }
                } else {
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

        // dimd2
        private openBetsModal() {
            var modal = new common.helpers.CreateModal();
            modal.header = 'My Bets';

            modal.data = {
                bets: this.$scope.openBets,
                eventName: this.$scope.fullMarket.event.name
            }

            modal.bodyUrl = this.settings.ThemeName + '/mobile/open-bets-modal.html';
            modal.controller = 'openBetsModalCtrl';
            modal.options.actionButton = '';
            modal.options.closeButton = '';
            modal.options.showFooter = false;
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private getOpenBets(): void {
            var promise = this.betService.openBetsEvent(this.$scope.fullMarket.eventId);
            promise.success((response: common.messaging.IResponse<any>) => {
                this.$scope.countBets = 0;
                if (response.success && response.data) {
                    this.$scope.openBets = response.data;
                    this.commonDataService.setOpenBets(response.data);

                    this.$scope.openBets.forEach((a: any) => {
                        this.$scope.countBets = this.$scope.countBets + a.bets.length;
                    });
                }
            })
        }

        private getExposure(): void {
            this.exposureService.getExposure()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
        }
    }
    angular.module('intranet.mobile').controller('mobileHorseMarketCtrl', MobileHorseMarketCtrl);
}