var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class OpenBetsCtrl extends intranet.common.ControllerBase {
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
            loadInitialData() {
                this.getOpenBets();
                this.getExposure();
            }
            getOpenBets(firstTime = true, marketid = null) {
                var promise = this.betService.openBets();
                this.$scope.openbet_loader.addPromise(promise);
                promise.success((response) => {
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
                                }
                                else if (this.$scope.selectedMarketId) {
                                    var hasSelectedMarket = this.$scope.marketList.some((a) => { return a.id == this.$scope.selectedMarketId; });
                                    if (!hasSelectedMarket) {
                                        this.$scope.selectedMarketId = this.$scope.marketList[0].id.toString();
                                    }
                                }
                                this.selectedMarketChanged();
                            }
                            else {
                                this.$scope.marketList.splice(0);
                                if (this.$scope.selectedMarket)
                                    this.$scope.selectedMarket.bets.splice(0);
                                this.$scope.hasUnmatched = false;
                                this.$scope.hasMatched = false;
                            }
                        }
                        else {
                            this.countMatchedUnmatched();
                        }
                    }
                }).finally(() => {
                    this.stateChanged(this.$state.current, this.$state.params);
                });
            }
            countMatchedUnmatched(filterByEventId = undefined, filterByMarketid = undefined) {
                this.$scope.$parent.totalBetsCount = 0;
                this.$scope.hasUnmatched = false;
                this.$scope.hasMatched = false;
                this.$scope.openBets = this.$scope.allOpenBets;
                if (filterByEventId != undefined) {
                    this.$scope.openBets = this.$scope.openBets.filter((e) => { return e.eventId == filterByEventId; });
                }
                if (filterByMarketid != undefined) {
                    this.$scope.openBets = this.$scope.openBets.filter((e) => { return e.marketId == filterByMarketid; });
                }
                this.$scope.openBets.forEach((a) => {
                    this.$scope.$parent.totalBetsCount = math.add(this.$scope.$parent.totalBetsCount, a.bets.length);
                    if (!this.$scope.hasUnmatched) {
                        this.$scope.hasUnmatched = a.bets.some((a) => { return a.sizeRemaining > 0; });
                    }
                    if (!this.$scope.hasMatched) {
                        this.$scope.hasMatched = a.bets.some((a) => { return a.sizeMatched > 0; });
                    }
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
            selectedMarketChanged(mid = null) {
                if (mid) {
                    this.$scope.selectedMarketId = mid;
                }
                var id = this.$scope.selectedMarketId;
                var filtered = this.$scope.openBets.filter((a) => { return a.marketId == id; });
                if (filtered.length > 0) {
                    this.$scope.selectedMarket = filtered[0];
                    this.$scope.hasUnmatched = this.$scope.selectedMarket.bets.some((a) => { return a.sizeRemaining > 0; });
                    this.$scope.hasMatched = this.$scope.selectedMarket.bets.some((a) => { return a.sizeMatched > 0; });
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
            updateAllBets() {
                var unmatchedBets = this.$scope.selectedMarket.bets.filter((a) => { return a.sizeRemaining > 0; });
                if (unmatchedBets.length > 0) {
                    var betModel = unmatchedBets.map((u) => { return { betId: u.id, price: u.newPrice, marketName: u.marketName, runnerName: u.runnerName }; });
                    this.editAllBets(false);
                    var promise = this.betService.updateAllBet(betModel);
                    this.$scope.openbet_loader.addPromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            response.data.forEach((r) => {
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
            cancelBet(bet) {
                var promise = this.betService.cancelBet(bet.id);
                this.$scope.openbet_loader.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        if (this.$scope.selectedMarket) {
                            var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.selectedMarket.bets, 'id', bet.id);
                            if (index > -1) {
                                this.$scope.selectedMarket.bets.splice(index, 1);
                            }
                        }
                        else {
                            this.getOpenBets(false);
                        }
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
            }
            cancelAllBets() {
                var ids = [];
                if (this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus') {
                    this.$scope.openBets.forEach((o) => {
                        var id = o.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
                        if (id.length > 0) {
                            ids = ids.concat(id);
                        }
                    });
                }
                else {
                    ids = this.$scope.selectedMarket.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
                }
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
                    if (this.settings.WebApp == 'sports' || this.settings.WebApp == 'sports999') {
                        cancelAll();
                    }
                    else {
                        this.modalService.showDeleteConfirmation().then((result) => {
                            if (result == intranet.common.services.ModalResult.OK) {
                                cancelAll();
                            }
                        });
                    }
                }
            }
            startEdit(b) {
                b.edit = true;
                this.$scope.editTracker.push({ id: b.id, price: b.price });
            }
            editAllBets(bool = true) {
                var editBets = this.$scope.selectedMarket.bets.filter((a) => { return a.sizeRemaining > 0; });
                if (editBets.length > 0) {
                    editBets.forEach((b) => {
                        b.edit = bool;
                        if (bool) {
                            this.$scope.editTracker.push({ id: b.id, price: b.price });
                        }
                        else {
                            var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', b.id);
                            if (index > -1) {
                                this.$scope.editTracker.splice(index, 1);
                            }
                        }
                    });
                }
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
        home.OpenBetsCtrl = OpenBetsCtrl;
        angular.module('intranet.home').controller('openBetsCtrl', OpenBetsCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=OpenBetsCtrl.js.map