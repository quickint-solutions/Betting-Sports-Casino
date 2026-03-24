var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ImportMarketCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, runnerService, marketService, toasterService, settings) {
                super($scope);
                this.$stateParams = $stateParams;
                this.runnerService = runnerService;
                this.marketService = marketService;
                this.toasterService = toasterService;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {};
                this.$scope.allSelected = true;
                this.$scope.eventname = this.$stateParams.eventName;
            }
            loadInitialData() {
            }
            marketSelectionChanged(all = false) {
                if (all) {
                    this.$scope.markets.forEach((a) => {
                        a.selected = this.$scope.allSelected;
                        delete a.eventId;
                    });
                }
                else {
                    var result = this.$scope.markets.every((a) => { return a.selected == true; });
                    this.$scope.allSelected = result;
                }
            }
            getBettingType(t) {
                return intranet.common.enums.BettingType[t];
            }
            getPriceLadder(t) {
                return intranet.common.enums.PriceLadderType[t];
            }
            getGroup(t) {
                return intranet.common.enums.MarketGroup[t];
            }
            processFile() {
                var reader = new FileReader();
                var self = this;
                reader.onload = function () {
                    if (reader.result) {
                        self.$scope.markets = JSON.parse(reader.result);
                        self.marketSelectionChanged(true);
                        self.$scope.$apply();
                    }
                };
                reader.readAsText(this.$scope.ctrl.jsonDataFile);
            }
            reset() {
                this.$scope.markets = [];
            }
            searchRunner(search, m) {
                if (search) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.runnerService.searchRunner({ Name: search });
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            m.runnerList = response.data;
                            if (search) {
                                var existed = m.runnerList.some((a) => { return a.name.toLowerCase() == search.toLowerCase(); });
                                if (!existed) {
                                    m.runnerList.push({ name: search });
                                }
                            }
                            if (m.runnerList.length > 0) {
                                if (m.selectedRunner) {
                                    m.selectedRunner.forEach((sr) => {
                                        var index = intranet.common.helpers.Utility.IndexOfObject(m.runnerList, 'name', sr.name, true);
                                        if (index > -1) {
                                            m.runnerList.splice(index, 1);
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
                else {
                    m.runnerList = [];
                }
            }
            submitMarkets() {
                var selectedmr = this.$scope.markets.filter((a) => { return a.selected == true; });
                console.log("Total selected market is " + selectedmr.length);
                console.log(angular.toJson(selectedmr));
                if (this.$stateParams.eventId) {
                    angular.forEach(this.$scope.markets, (m) => {
                        if (m.selected == true) {
                            m.eventId = this.$stateParams.eventId;
                            m.marketRunner = [];
                            if (m.selectedRunner.length > 0) {
                                angular.forEach(m.selectedRunner, (value) => {
                                    var runner = { name: value.name, id: value.id };
                                    m.marketRunner.push({ runner: runner });
                                });
                                this.marketService.addMarket(m)
                                    .success((response) => {
                                    if (response.success) {
                                        this.toasterService.showToast(intranet.common.helpers.ToastType.Success, m.name, 3000);
                                        m.selected = false;
                                    }
                                    else {
                                        this.toasterService.showToast(intranet.common.helpers.ToastType.Success, m.name, 3000);
                                    }
                                });
                            }
                        }
                    });
                }
                else {
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Error, "Loda pela EVENT select kar ne", 3000);
                }
            }
            replaceTeamName() {
                if (this.$scope.search.teamA.length > 0 && this.$scope.search.teamB.length > 0) {
                    angular.forEach(this.$scope.markets, (m) => {
                        if (m.name.indexOf('{team-a}') > -1) {
                            m.name = m.name.replaceAll('{team-a}', this.$scope.search.teamA);
                        }
                        if (m.name.indexOf('{team-b}') > -1) {
                            m.name = m.name.replaceAll('{team-b}', this.$scope.search.teamB);
                        }
                    });
                }
            }
        }
        admin.ImportMarketCtrl = ImportMarketCtrl;
        angular.module('intranet.admin').controller('importMarketCtrl', ImportMarketCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ImportMarketCtrl.js.map