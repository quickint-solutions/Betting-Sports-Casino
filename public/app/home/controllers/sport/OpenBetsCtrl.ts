module intranet.home {
    export interface IOpenBetsScope extends intranet.common.IScopeBase {
        allOpenBets: any[];
        openBets: any[];
        marketList: any[];
        selectedMarketId: any;
        selectedMarket: any;
        editTracker: any[];
        $parent: any;
        totalBetsCount: any;

        isExpanded: boolean;
        hasUnmatched: boolean;
        hasMatched: boolean;
        showAverageOdds: boolean;
        showBetInfo: boolean;
        compareBetSize: any;

        openbet_loader: any;
        spinnerImg: string;

        isEventView: boolean;
        thisEventId: any;
        thisMarketId: any;
        filterThisEventBets: any;

        showByDate: boolean;
    }

    export class OpenBetsCtrl extends intranet.common.ControllerBase<IOpenBetsScope>
        implements intranet.common.init.IInit {
        constructor($scope: IOpenBetsScope,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private modalService: common.services.ModalService,
            private exposureService: services.ExposureService,
            private settings: common.IBaseSettings,
            private $filter: any,
            private $state: any,
            private $q: ng.IQService,
            private promiseTracker: any,
            protected $rootScope: any,
            private $timeout: ng.ITimeoutService,
            private betService: services.BetService) {
            super($scope);

            var betSubmitted = this.$rootScope.$on('bet-submitted', (e, data) => {
                if (data.marketId) {
                    this.$scope.$parent.selectedBetTab = 1;
                    this.getOpenBets(false, data.marketId.toString());
                }
            });

            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    this.$rootScope.$emit("balance-changed");
                    this.getOpenBets(false);
                    this.getExposure();
                }
            });


            var stateWatch = this.$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
                this.stateChanged(toState, toParams);
            });

            this.$scope.$on('$destroy', () => {
                betSubmitted();
                wsListner();
                stateWatch();
            });

            super.init(this);
        }

        private stateChanged(toState: any, toParams: any): void {
            if (toState.name == 'base.home.sport.fullmarket') {
                this.$scope.isEventView = true;
                this.$scope.thisEventId = toParams.eventId;
            }
            else if (toState.name == 'base.home.sport.upcomingrace') {
                if (toParams.marketid) {
                    this.$scope.isEventView = true;
                    this.$scope.thisMarketId = toParams.marketid;
                }
            }
            else {
                this.$scope.isEventView = false;
                this.$scope.thisEventId = undefined;
                this.$scope.thisMarketId = undefined;
                this.$scope.filterThisEventBets = false;
                this.countMatchedUnmatched();
            }
        }

        private showBetsThisEvent(): void {
            if (this.$scope.filterThisEventBets) {
                this.countMatchedUnmatched(this.$scope.thisEventId, this.$scope.thisMarketId);
            } else { this.countMatchedUnmatched(); }
        }

        public initScopeValues(): void {
            this.$scope.spinnerImg = this.commonDataService.spinnerImg;
            this.$scope.openBets = [];
            this.$scope.marketList = [];
            this.$scope.messages = [];
            this.$scope.isExpanded = false;
            this.$scope.editTracker = [];
            this.$scope.showAverageOdds = false;
            this.$scope.showBetInfo = false;
            this.$scope.showByDate = true;
            this.$scope.isEventView = false;
            this.$scope.thisEventId = undefined;

            this.$scope.openbet_loader = this.promiseTracker({ activationDelay: 100, minDuration: 750 });

        }

        public loadInitialData(): void {
            this.getOpenBets();
            this.getExposure();
        }

        private getOpenBets(firstTime: boolean = true, marketid: any = null): void {
            var promise = this.betService.openBets()
            this.$scope.openbet_loader.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success && response.data) {
                    this.$scope.allOpenBets = response.data;
                    this.$scope.openBets = this.$scope.allOpenBets;

                    this.commonDataService.setOpenBets(response.data);
                    this.$rootScope.$broadcast("openbets-updated");

                    if (this.settings.ThemeName != 'lotus' && this.settings.ThemeName != 'dimd' && this.settings.ThemeName != 'dimd2') {
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
                        this.countMatchedUnmatched();
                    }
                }
            }).finally(() => {
                this.stateChanged(this.$state.current, this.$state.params);
            });
        }

        private countMatchedUnmatched(filterByEventId: any = undefined, filterByMarketid: any = undefined): void {
            this.$scope.$parent.totalBetsCount = 0;
            this.$scope.hasUnmatched = false;
            this.$scope.hasMatched = false;
            this.$scope.openBets = this.$scope.allOpenBets;
            if (filterByEventId != undefined) {
                this.$scope.openBets = this.$scope.openBets.filter((e: any) => { return e.eventId == filterByEventId });
            }
            if (filterByMarketid != undefined) {
                this.$scope.openBets = this.$scope.openBets.filter((e: any) => { return e.marketId == filterByMarketid });
            }
            this.$scope.openBets.forEach((a: any) => {

                this.$scope.$parent.totalBetsCount = math.add(this.$scope.$parent.totalBetsCount, a.bets.length);
                if (!this.$scope.hasUnmatched) {
                    this.$scope.hasUnmatched = a.bets.some((a: any) => { return a.sizeRemaining > 0 });
                }
                if (!this.$scope.hasMatched) {
                    this.$scope.hasMatched = a.bets.some((a: any) => { return a.sizeMatched > 0 });
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

        private matchedBetFilter(bets: any[]): any {
            bets = this.$filter('betFilter')(bets, 'sizeMatched');
            bets = this.$filter('orderBy')(bets, 'createdOn', this.$scope.showByDate ? true : false);
            return bets;
        }


        private selectedMarketChanged(mid: any = null): void {
            if (mid) { this.$scope.selectedMarketId = mid; }
            var id = this.$scope.selectedMarketId;
            var filtered = this.$scope.openBets.filter((a: any) => { return a.marketId == id; });
            if (filtered.length > 0) {
                this.$scope.selectedMarket = filtered[0];
                this.$scope.hasUnmatched = this.$scope.selectedMarket.bets.some((a: any) => { return a.sizeRemaining > 0 });
                this.$scope.hasMatched = this.$scope.selectedMarket.bets.some((a: any) => { return a.sizeMatched > 0 });
            }
        }

        private updateBet(bet: any): void {
            if (this.settings.ThemeName == 'lotus') {
                var defer = this.$q.defer();
                this.$scope.openbet_loader.addPromise(defer.promise);
                this.$timeout(() => {
                    this.cancelEdit(bet);
                    defer.resolve();
                }, 3000);
            }
            else {
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
        }

        private updateAllBets(): void {
            var unmatchedBets: any[] = this.$scope.selectedMarket.bets.filter((a: any) => { return a.sizeRemaining > 0 });
            if (unmatchedBets.length > 0) {
                var betModel = unmatchedBets.map((u: any) => { return { betId: u.id, price: u.newPrice, marketName: u.marketName, runnerName: u.runnerName }; });
                this.editAllBets(false);
                var promise = this.betService.updateAllBet(betModel);
                this.$scope.openbet_loader.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        response.data.forEach((r: any) => {
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

                        });
                    }
                    else {
                        if (response.messages) {
                            this.toasterService.showMessages(response.messages, 3000);
                        }
                    }
                });
            }
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

                var cancelAll = (() => {
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
                });

                if (this.settings.WebApp == 'sports' || this.settings.WebApp == 'sports999' ) {
                    cancelAll();
                } else {
                    this.modalService.showDeleteConfirmation().then((result: any) => {
                        if (result == common.services.ModalResult.OK) {
                            cancelAll();
                        }
                    });
                }
            }
        }

        private startEdit(b: any): void {
            b.edit = true;
            this.$scope.editTracker.push({ id: b.id, price: b.price });
        }

        private editAllBets(bool: Boolean = true): void {
            var editBets: any[] = this.$scope.selectedMarket.bets.filter((a: any) => { return a.sizeRemaining > 0 });
            if (editBets.length > 0) {
                editBets.forEach((b: any) => {
                    b.edit = bool;
                    if (bool) {
                        this.$scope.editTracker.push({ id: b.id, price: b.price })
                    } else {
                        var index = common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', b.id);
                        if (index > -1) { this.$scope.editTracker.splice(index, 1); }
                    }
                });
            }
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
    }
    angular.module('intranet.home').controller('openBetsCtrl', OpenBetsCtrl);
}