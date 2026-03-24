module intranet.home {
    export interface IOpenBetsByEventScope extends intranet.common.IScopeBase {
        allOpenBets: any[];
        openBets: any[];
        eventList: any[];
        selectedEventId: any;
        selectedEvent: any;
        editTracker: any[];
        $parent: any;

        totalBetsCount: any;
        isExpanded: boolean;
        countUnmatched: any;
        countMatched: any;

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

    export class OpenBetsByEventCtrl extends intranet.common.ControllerBase<IOpenBetsByEventScope>
        implements intranet.common.init.IInit {
        constructor($scope: IOpenBetsByEventScope,
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
            this.$scope.eventList = [];
            this.$scope.messages = [];
            this.$scope.isExpanded = false;
            this.$scope.editTracker = [];
            this.$scope.showAverageOdds = false;
            this.$scope.showBetInfo = false;
            this.$scope.showByDate = true;
            this.$scope.isEventView = false;
            this.$scope.thisEventId = undefined;
            this.$scope.countMatched = 0;
            this.$scope.countUnmatched = 0;
            this.$scope.openbet_loader = this.promiseTracker({ activationDelay: 100, minDuration: 750 });

        }

        public loadInitialData(): void {
            this.getOpenBets();
            this.getExposure();
        }

        private getOpenBets(firstTime: boolean = true, marketid: any = null): void {
            var promise = this.betService.getOpenBetByEvent();
            this.$scope.openbet_loader.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success && response.data) {
                    this.$scope.allOpenBets = response.data;
                    this.$scope.openBets = [];

                    angular.forEach(response.data, (eb: any) => {
                        eb.count = 0;
                        angular.forEach(eb.openBets, (ob: any) => {
                            ob.eventId = eb.eventId;
                            this.$scope.openBets.push(ob);
                            eb.count = math.add(eb.count, ob.bets.length);
                        });
                    });

                    this.commonDataService.setOpenBets(this.$scope.openBets);
                    this.$rootScope.$broadcast("openbets-updated");
                    if (this.$scope.openBets.length > 0) {
                        this.$scope.eventList = this.$scope.allOpenBets.map((a: any) => { return { name: a.eventName, id: a.eventId, count: a.count }; });
                        if (firstTime) {
                            this.$scope.selectedEventId = this.$scope.eventList[0].id.toString();
                        }
                        else if (marketid) {
                            var f = this.$scope.openBets.filter((b: any) => { return b.marketId == marketid; }) || [];
                            if (f.length > 0) {
                                this.$scope.selectedEventId = f[0].eventId.toString();
                            }
                        }
                        else if (this.$scope.selectedEventId) {
                            var hasSelectedMarket = this.$scope.eventList.some((a: any) => { return a.id == this.$scope.selectedEventId; });
                            if (!hasSelectedMarket) {
                                this.$scope.selectedEventId = this.$scope.eventList[0].id.toString();
                            }
                        }
                        this.selectedMarketChanged();
                        this.countMatchedUnmatched();
                    } else {
                        this.$scope.eventList.splice(0);
                        if (this.$scope.selectedEvent) this.$scope.selectedEvent.bets.splice(0);
                        this.$scope.countMatched = 0;
                        this.$scope.countUnmatched = 0;
                    }
                }
            }).finally(() => {
                this.stateChanged(this.$state.current, this.$state.params);
            });
        }

        private countMatchedUnmatched(filterByEventId: any = undefined, filterByMarketid: any = undefined): void {
            this.$scope.totalBetsCount = 0;
            this.$scope.countUnmatched = 0;
            this.$scope.countMatched = 0;
            if (filterByEventId != undefined) {
                this.$scope.openBets = this.$scope.openBets.filter((e: any) => { return e.eventId == filterByEventId });
            }
            if (filterByMarketid != undefined) {
                this.$scope.openBets = this.$scope.openBets.filter((e: any) => { return e.marketId == filterByMarketid });
            }
            this.$scope.openBets.forEach((a: any) => {
                var unmatched = a.bets.filter((a: any) => { return a.sizeRemaining > 0 }).length;
                var matched = a.bets.filter((a: any) => { return a.sizeMatched > 0 }).length;

                this.$scope.countUnmatched = math.add(this.$scope.countUnmatched, unmatched);
                this.$scope.countMatched = math.add(this.$scope.countMatched, matched);
                this.$scope.totalBetsCount = math.add(this.$scope.totalBetsCount, a.bets.length);
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


        private selectedMarketChanged(eid: any = null): void {
            if (eid) { this.$scope.selectedEventId = eid; }
            var id = this.$scope.selectedEventId;
            var filtered = this.$scope.allOpenBets.filter((a: any) => { return a.eventId == id; });
            if (filtered.length > 0) {
                this.$scope.selectedEvent = filtered[0];
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

        private cancelBet(bet: any): void {
            var promise = this.betService.cancelBet(bet.id);
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

        private cancelAllBets(): void {
            var ids: any[] = [];
            this.$scope.openBets.forEach((o: any) => {
                var id: any[] = o.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
                if (id.length > 0) {
                    ids = ids.concat(id);
                }
            });
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
                this.modalService.showDeleteConfirmation().then((result: any) => {
                    if (result == common.services.ModalResult.OK) {
                        cancelAll();
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
    }
    angular.module('intranet.home').controller('openBetsByEventCtrl', OpenBetsByEventCtrl);
}