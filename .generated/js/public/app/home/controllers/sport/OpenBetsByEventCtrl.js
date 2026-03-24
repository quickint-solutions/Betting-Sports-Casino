var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class OpenBetsByEventCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, commonDataService, modalService, exposureService, settings, $filter, $state, $q, promiseTracker, $rootScope, $timeout, betService) {
                super($scope);
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.modalService = modalService;
                this.exposureService = exposureService;
                this.settings = settings;
                this.$filter = $filter;
                this.$state = $state;
                this.$q = $q;
                this.promiseTracker = promiseTracker;
                this.$rootScope = $rootScope;
                this.$timeout = $timeout;
                this.betService = betService;
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
            stateChanged(toState, toParams) {
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
            showBetsThisEvent() {
                if (this.$scope.filterThisEventBets) {
                    this.countMatchedUnmatched(this.$scope.thisEventId, this.$scope.thisMarketId);
                }
                else {
                    this.countMatchedUnmatched();
                }
            }
            initScopeValues() {
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
            loadInitialData() {
                this.getOpenBets();
                this.getExposure();
            }
            getOpenBets(firstTime = true, marketid = null) {
                var promise = this.betService.getOpenBetByEvent();
                this.$scope.openbet_loader.addPromise(promise);
                promise.success((response) => {
                    if (response.success && response.data) {
                        this.$scope.allOpenBets = response.data;
                        this.$scope.openBets = [];
                        angular.forEach(response.data, (eb) => {
                            eb.count = 0;
                            angular.forEach(eb.openBets, (ob) => {
                                ob.eventId = eb.eventId;
                                this.$scope.openBets.push(ob);
                                eb.count = math.add(eb.count, ob.bets.length);
                            });
                        });
                        this.commonDataService.setOpenBets(this.$scope.openBets);
                        this.$rootScope.$broadcast("openbets-updated");
                        if (this.$scope.openBets.length > 0) {
                            this.$scope.eventList = this.$scope.allOpenBets.map((a) => { return { name: a.eventName, id: a.eventId, count: a.count }; });
                            if (firstTime) {
                                this.$scope.selectedEventId = this.$scope.eventList[0].id.toString();
                            }
                            else if (marketid) {
                                var f = this.$scope.openBets.filter((b) => { return b.marketId == marketid; }) || [];
                                if (f.length > 0) {
                                    this.$scope.selectedEventId = f[0].eventId.toString();
                                }
                            }
                            else if (this.$scope.selectedEventId) {
                                var hasSelectedMarket = this.$scope.eventList.some((a) => { return a.id == this.$scope.selectedEventId; });
                                if (!hasSelectedMarket) {
                                    this.$scope.selectedEventId = this.$scope.eventList[0].id.toString();
                                }
                            }
                            this.selectedMarketChanged();
                            this.countMatchedUnmatched();
                        }
                        else {
                            this.$scope.eventList.splice(0);
                            if (this.$scope.selectedEvent)
                                this.$scope.selectedEvent.bets.splice(0);
                            this.$scope.countMatched = 0;
                            this.$scope.countUnmatched = 0;
                        }
                    }
                }).finally(() => {
                    this.stateChanged(this.$state.current, this.$state.params);
                });
            }
            countMatchedUnmatched(filterByEventId = undefined, filterByMarketid = undefined) {
                this.$scope.totalBetsCount = 0;
                this.$scope.countUnmatched = 0;
                this.$scope.countMatched = 0;
                if (filterByEventId != undefined) {
                    this.$scope.openBets = this.$scope.openBets.filter((e) => { return e.eventId == filterByEventId; });
                }
                if (filterByMarketid != undefined) {
                    this.$scope.openBets = this.$scope.openBets.filter((e) => { return e.marketId == filterByMarketid; });
                }
                this.$scope.openBets.forEach((a) => {
                    var unmatched = a.bets.filter((a) => { return a.sizeRemaining > 0; }).length;
                    var matched = a.bets.filter((a) => { return a.sizeMatched > 0; }).length;
                    this.$scope.countUnmatched = math.add(this.$scope.countUnmatched, unmatched);
                    this.$scope.countMatched = math.add(this.$scope.countMatched, matched);
                    this.$scope.totalBetsCount = math.add(this.$scope.totalBetsCount, a.bets.length);
                });
            }
            getOpenBetsAndExposure() {
                this.getOpenBets(false);
                this.getExposure();
            }
            getExposure() {
                this.exposureService.getExposure()
                    .success((response) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
            }
            matchedBetFilter(bets) {
                bets = this.$filter('betFilter')(bets, 'sizeMatched');
                bets = this.$filter('orderBy')(bets, 'createdOn', this.$scope.showByDate ? true : false);
                return bets;
            }
            selectedMarketChanged(eid = null) {
                if (eid) {
                    this.$scope.selectedEventId = eid;
                }
                var id = this.$scope.selectedEventId;
                var filtered = this.$scope.allOpenBets.filter((a) => { return a.eventId == id; });
                if (filtered.length > 0) {
                    this.$scope.selectedEvent = filtered[0];
                }
            }
            updateBet(bet) {
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
                    promise.success((response) => {
                        if (response.success) {
                            bet.edit = false;
                            var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', bet.id);
                            if (index > -1) {
                                this.$scope.editTracker.splice(index, 1);
                            }
                            if (response.data) {
                                var r = response.data;
                                if (r.orderStatus) {
                                    if (r.sizeRemaining > 0) {
                                        var matched = this.$filter('toRate')(r.sizeMatched);
                                        var remaining = this.$filter('toRate')(r.sizeRemaining);
                                        var msg = this.$filter('translate')('bet.unmatched.message');
                                        msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), r.bet.runnerName, matched, r.avgPrice, remaining, r.bet.price);
                                        this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Error, msg, 5000);
                                    }
                                    else {
                                        var matched = this.$filter('toRate')(r.sizeMatched);
                                        var placed = this.$filter('toRate')(r.bet.size);
                                        var msg = this.$filter('translate')('bet.matched.message');
                                        msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), r.bet.runnerName, placed, r.bet.price, matched, r.avgPrice);
                                        this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Success, msg, 5000);
                                    }
                                }
                                else {
                                    var msg = r.message.format(r.bet.marketName, r.bet.runnerName);
                                    this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Error, msg);
                                }
                            }
                        }
                        if (response.messages) {
                            this.toasterService.showMessages(response.messages, 3000);
                        }
                    });
                }
            }
            cancelBet(bet) {
                var promise = this.betService.cancelBet(bet.id);
                this.$scope.openbet_loader.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.getOpenBets(false);
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
            }
            cancelAllBets() {
                var ids = [];
                this.$scope.openBets.forEach((o) => {
                    var id = o.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
                    if (id.length > 0) {
                        ids = ids.concat(id);
                    }
                });
                if (ids.length > 0) {
                    var cancelAll = (() => {
                        var promise = this.betService.cancelAllBets(ids);
                        this.$scope.openbet_loader.addPromise(promise);
                        promise.success((response) => {
                            if (response.success) {
                                this.getOpenBets(false);
                            }
                            if (response.messages) {
                                this.toasterService.showMessages(response.messages, 3000);
                            }
                        });
                    });
                    this.modalService.showDeleteConfirmation().then((result) => {
                        if (result == intranet.common.services.ModalResult.OK) {
                            cancelAll();
                        }
                    });
                }
            }
            startEdit(b) {
                b.edit = true;
                this.$scope.editTracker.push({ id: b.id, price: b.price });
            }
            cancelEdit(b) {
                b.edit = false;
                b.newPrice = b.price;
                var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', b.id);
                if (index > -1) {
                    this.$scope.editTracker.splice(index, 1);
                }
            }
            isInEdit(b) {
                var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', b.id);
                if (index > -1) {
                    b.edit = true;
                    b.newPrice = this.$scope.editTracker[index].price;
                }
                else {
                    b.newPrice = b.price;
                    b.edit = false;
                }
            }
            oddsChanged(id, newvalue) {
                var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', id);
                if (index > -1) {
                    this.$scope.editTracker[index].price = newvalue;
                }
            }
        }
        home.OpenBetsByEventCtrl = OpenBetsByEventCtrl;
        angular.module('intranet.home').controller('openBetsByEventCtrl', OpenBetsByEventCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=OpenBetsByEventCtrl.js.map