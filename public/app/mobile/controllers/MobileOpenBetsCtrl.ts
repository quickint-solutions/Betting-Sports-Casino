module intranet.mobile {
    export interface IMobileOpenBetsScope extends intranet.common.IScopeBase {
        openBets: any[];
        marketList: any[];
        selectedMarketId: any;
        selectedMarket: any;
        editTracker: any[];

        isExpanded: boolean;
        hasUnmatched: boolean;
        hasMatched: boolean;
        showAverageOdds: boolean;
        showBetInfo: boolean;
        compareBetSize: any;

        openbet_loader: any;
        spinnerImg: any;
    }

    export class MobileOpenBetsCtrl extends intranet.common.ControllerBase<IMobileOpenBetsScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileOpenBetsScope,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private commonDataService: common.services.CommonDataService,
            private $timeout: ng.ITimeoutService,
            private exposureService: services.ExposureService,
            private promiseTracker: any,
            private settings: common.IBaseSettings,
            private $filter: any,
            private $state: any,
            protected $rootScope: any,
            private betService: services.BetService) {
            super($scope);

            var betSubmitted = this.$rootScope.$on('bet-submitted', (e, data) => {
                if (data.marketId) {
                    this.getOpenBets(false, data.marketId.toString());
                }
            });

            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    console.log('mobile openbet');
                    this.$rootScope.$emit("balance-changed");
                    this.getOpenBets(false);
                    this.getExposure();
                }
            });

            this.$scope.$on('$destroy', () => {
                betSubmitted();
                wsListner();
            });

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.spinnerImg = this.commonDataService.spinnerImg;
            this.$scope.openBets = [];
            this.$scope.marketList = [];
            this.$scope.messages = [];
            this.$scope.isExpanded = false;
            this.$scope.editTracker = [];
            this.$scope.showAverageOdds = false;
            this.$scope.showBetInfo = true;
            this.$scope.openbet_loader = this.promiseTracker({ activationDelay: 100, minDuration: 750 });
        }

        public loadInitialData(): void {
            this.getOpenBets();
            this.getExposure();
        }

        private getOpenBets(firstTime: boolean = true, marketid: any = null): void {
            var promise = this.betService.openBets()
            this.$scope.openbet_loader.addPromise(promise);
            this.commonDataService.addMobilePromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success && response.data) {
                    this.$scope.openBets = response.data;
                    this.commonDataService.setOpenBets(response.data);
                    this.$rootScope.$broadcast("openbets-updated");

                    if (this.settings.ThemeName != 'sports' && this.settings.ThemeName != 'lotus') {
                        if (this.$scope.openBets.length > 0) {
                            this.$scope.marketList = this.$scope.openBets.map((a) => { return { name: a.eventName + ' - ' + a.marketName, id: a.marketId }; });
                            if (firstTime) {
                                this.$scope.selectedMarketId = this.$scope.marketList[0].id.toString();
                                this.$scope.isExpanded = true;
                            }
                            else if (marketid) {
                                this.$scope.selectedMarketId = marketid;
                            } else if (this.$scope.selectedMarketId) {
                                var hasSelectedMarket = this.$scope.marketList.some((a: any) => { return a.id == this.$scope.selectedMarketId; });
                                if (!hasSelectedMarket) {
                                    this.$scope.selectedMarketId = this.$scope.marketList[0].id.toString();
                                }
                            }
                            this.selectedMarketChanged();
                        } else {
                            this.$scope.marketList.splice(0);
                            if (this.$scope.selectedMarket) this.$scope.selectedMarket.bets.splice(0);
                            this.$scope.hasUnmatched = false;
                            this.$scope.hasMatched = false;
                        }
                    } else {
                        this.$scope.hasUnmatched = false;
                        this.$scope.hasMatched = false;
                        this.$scope.openBets.forEach((a: any) => {
                            if (!this.$scope.hasUnmatched) {
                                this.$scope.hasUnmatched = a.bets.some((a: any) => { return a.sizeRemaining > 0 });
                            }
                            if (!this.$scope.hasMatched) {
                                this.$scope.hasMatched = a.bets.some((a: any) => { return a.sizeMatched > 0 });
                            }
                        });
                    }
                }
            }).finally(() => {
                if (firstTime) {
                    //this.checkNewBetSize();
                }
                //this.getExposure();
            });
        }

        private checkNewBetSize(): void {
            this.betService.getOpenBetSize()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        if (this.$scope.compareBetSize) {
                            if (this.$scope.compareBetSize.sizeMatched != response.data.sizeMatched ||
                                this.$scope.compareBetSize.sizeRemaining != response.data.sizeRemaining ||
                                this.$scope.compareBetSize.sizeCancelled != response.data.sizeCancelled) {

                                this.$scope.compareBetSize.sizeMatched = response.data.sizeMatched;
                                this.$scope.compareBetSize.sizeRemaining = response.data.sizeRemaining;
                                this.$scope.compareBetSize.sizeCancelled = response.data.sizeCancelled;

                                this.$rootScope.$emit("balance-changed");
                                this.getOpenBets(false);
                            }
                        } else {
                            this.$scope.compareBetSize = {};
                            this.$scope.compareBetSize.sizeMatched = response.data.sizeMatched;
                            this.$scope.compareBetSize.sizeRemaining = response.data.sizeRemaining;
                            this.$scope.compareBetSize.sizeCancelled = response.data.sizeCancelled;
                        }
                    }
                });
        }

        private getOpenBetsAndExposure(): void {
            this.getOpenBets(false);
            this.getExposure();
        }

        private getExposure(): void {
            this.exposureService.getExposure()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
        }

        private selectedMarketChanged(): void {
            var id = this.$scope.selectedMarketId;
            var filtered = this.$scope.openBets.filter((a: any) => { return a.marketId == id; });
            if (filtered.length > 0) {
                this.$scope.selectedMarket = filtered[0];
                this.$scope.hasUnmatched = this.$scope.selectedMarket.bets.some((a: any) => { return a.sizeRemaining > 0 });
                this.$scope.hasMatched = this.$scope.selectedMarket.bets.some((a: any) => { return a.sizeMatched > 0 });
            }
        }

        private updateBet(bet: any): void {
            var model = { betId: bet.id, price: bet.newPrice, marketName: bet.marketName, runnerName: bet.runnerName };
            var promise = this.betService.updateBet(model);
            this.$scope.openbet_loader.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    bet.edit = false;
                    var index = common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', bet.id);
                    if (index > -1) { this.$scope.editTracker.splice(index, 1); }
                    if (response.data) {
                        var r = response.data;
                        if (r.orderStatus) {
                            if (r.sizeRemaining > 0) {
                                var matched = this.$filter('toRate')(r.sizeMatched);
                                var remaining = this.$filter('toRate')(r.sizeRemaining);
                                var msg = this.$filter('translate')('bet.unmatched.message');
                                msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), r.bet.runnerName, matched, r.avgPrice, remaining, r.bet.price);
                                this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg, 5000);
                            }
                            else {
                                var matched = this.$filter('toRate')(r.sizeMatched);
                                var placed = this.$filter('toRate')(r.bet.size);
                                var msg = this.$filter('translate')('bet.matched.message');
                                msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), r.bet.runnerName, placed, r.bet.price, matched, r.avgPrice);
                                this.toasterService.showToastMessage(common.helpers.ToastType.Success, msg, 5000);
                            }
                        }
                        else {
                            var msg = r.message.format(r.bet.marketName, r.bet.runnerName);
                            this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg);
                        }
                    }
                }
                if (response.messages) {
                    this.toasterService.showMessages(response.messages, 3000);
                }
            });
        }

        private cancelBet(bet: any): void {
            var promise = this.betService.cancelBet(bet.id);
            this.$scope.openbet_loader.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    if (this.$scope.selectedMarket) {
                        var index = common.helpers.Utility.IndexOfObject(this.$scope.selectedMarket.bets, 'id', bet.id);
                        if (index > -1) {
                            this.$scope.selectedMarket.bets.splice(index, 1);
                        }
                    } else {
                        this.getOpenBets(false);
                    }
                }
                if (response.messages) {
                    this.toasterService.showMessages(response.messages, 3000);
                }
            });
        }

        private cancelAllBets(): void {
            var ids: any[] = [];
            if (this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus') {
                this.$scope.openBets.forEach((o: any) => {
                    var id: any[] = o.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
                    if (id.length > 0) {
                        ids = ids.concat(id);
                    }
                });
            } else {
                ids = this.$scope.selectedMarket.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
            }
            if (ids.length > 0) {
                this.modalService.showDeleteConfirmation().then((result: any) => {
                    if (result == common.services.ModalResult.OK) {
                        var promise = this.betService.cancelAllBets(ids);
                        this.$scope.openbet_loader.addPromise(promise);
                        promise.success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.getOpenBets(false);
                            }
                            if (response.messages) {
                                this.toasterService.showMessages(response.messages, 3000);
                            }
                        });
                    }
                });
            }
        }

        private startEdit(b: any): void {
            b.edit = true;
            this.$scope.editTracker.push({ id: b.id, price: b.price });
        }

        private cancelEdit(b: any): void {
            b.edit = false;
            b.newPrice = b.price;
            var index = common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', b.id);
            if (index > -1) { this.$scope.editTracker.splice(index, 1); }
        }

        private isInEdit(b: any): void {
            var index = common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', b.id);
            if (index > -1) {
                b.edit = true;
                b.newPrice = this.$scope.editTracker[index].price;
            }
            else {
                b.newPrice = b.price;
                b.edit = false;
            }
        }

        private oddsChanged(id: any, newvalue: any): void {
            var index = common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', id);
            if (index > -1) { this.$scope.editTracker[index].price = newvalue; }
        }

        private updateThisBet(detail: any, bet: any): void {
            this.commonDataService.setBetModelForUpdate(detail, bet);
            if (detail.eventTypeId == this.settings.HorseRacingId || detail.eventTypeId == this.settings.GreyhoundId) {
                this.$state.go("mobile.seven.base.racemarket", { eventtype: detail.eventTypeId, marketid: bet.marketId, betid: bet.id });
            }
            else if (detail.eventTypeId == this.settings.LiveGamesId) {
                this.$state.go("mobile.seven.base.livegamesmarket", { eventid: detail.eventId, betid: bet.id });
            }
            else {
                this.$state.go("mobile.seven.base.market", { eventId: detail.eventId, betid: bet.id });
            }
        }
    }
    angular.module('intranet.mobile').controller('mobileOpenBetsCtrl', MobileOpenBetsCtrl);
}