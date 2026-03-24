module intranet.mobile {

    export interface ISevenRaceMarketScope extends intranet.common.IBetScopeBase {
        timer_market_status: any;

        fullMarket: any;
        otherMarkets: any[];
        selectedTab: any;

        placeBetData: any;
        currentInlineBet: any;

        selectedTopTab: any;

        //open bets
        openBets: any[];
        countBets: any;
        hasUnmatched: boolean;
        hasMatched: boolean;
        editTracker: any[]
        timer_openbet: any;

        raceType: any;
        loadderTemplate: string;
        isRequestProcessing: boolean;
    }

    export class SevenRaceMarketCtrl extends intranet.common.BetControllerBase<ISevenRaceMarketScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISevenRaceMarketScope,
            private $stateParams: any,
            private marketOddsService: services.MarketOddsService,
            public $timeout: ng.ITimeoutService,
            public toasterService: intranet.common.services.ToasterService,
            public $rootScope: any,
            private $state: any,
            public $compile: any,
            private $q: ng.IQService,
            private $filter: any,
            public WSSocketService: any,
            private marketService: services.MarketService,
            public placeBetDataService: common.services.PlaceBetDataService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public commonDataService: common.services.CommonDataService,
            private localCacheHelper: common.helpers.LocalCacheHelper,
            private exposureService: services.ExposureService,
            public settings: common.IBaseSettings,
            public modalService: common.services.ModalService,
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
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
                wsListner();
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
            this.$scope.isRequestProcessing = false;
            this.$scope.loadderTemplate = this.commonDataService.mobile_market_loader_template;
            this.$scope.selectedTopTab = 0;
            this.$scope.raceType = this.commonDataService.getEventTypeName(this.$stateParams.eventtype)
        }

        public loadInitialData() {
            this.getTopHorseMarkets();
        }

        private changeRaceMarket(marketid: any): void {
            if (this.settings.ThemeName == 'dimd') {
                this.$state.go("mobile.base.horsemarket", { eventtype: this.$stateParams.eventtype, marketid: marketid });
            }
            else {
                this.$state.go("mobile.seven.base.racemarket", { eventtype: this.$stateParams.eventtype, marketid: marketid });
            }
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
                this.$scope.isRequestProcessing = false;
                this.subscribeOdds();
                this.getOpenBets();
                this.getExposure();
                this.calculatePPL();
                this.$timeout(() => { this.openInlineToUpdateBet(); }, 500);
            });

        }


        public setFullmarket(data: any): void {
            this.$scope.fullMarket = data;
            if (this.$scope.fullMarket.event) {
                this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                this.commonDataService.setHorseMetadata(this.$scope.fullMarket);
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
            if ((this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') && this.$scope.selectedTab == index) {
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
        public placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string): void {
            var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, true, '', 100, true);

            super.executeBet(model.model, true);
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
                        this.changeRaceMarket(this.$scope.otherMarkets[0].id);
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

        // top tab management
        private tabChanged(index: any): void {
            this.$scope.selectedTopTab = index;
        }

        // open bets
        private getOpenBets(): void {
            var promise = this.betService.openBetsEvent(this.$scope.fullMarket.eventId)
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success && response.data) {
                    this.$scope.openBets = response.data;
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

        private getExposure(): void {
            this.exposureService.getExposure()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
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

        private updateThisBet(detail: any, bet: any): void {
            this.commonDataService.setBetModelForUpdate(detail, bet);
            this.tabChanged(0);
            super.updateBet(this.commonDataService.updateBetModel);
        }

        // update bet
        private openInlineToUpdateBet(): void {
            if (this.$stateParams.betid && this.commonDataService.updateBetModel) {
                super.updateBet(this.commonDataService.updateBetModel);
            }
        }

    }
    angular.module('intranet.mobile').controller('sevenRaceMarketCtrl', SevenRaceMarketCtrl);
}