var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAStatementsCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService, $q, commonDataService, settings) {
                super($scope);
                this.accountService = accountService;
                this.$q = $q;
                this.commonDataService = commonDataService;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                };
                this.$scope.canILoad = false;
            }
            loadInitialData() {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.userid = result.id;
                }
                this.setDates(-7, 'd');
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.refreshGrid();
            }
            refreshGrid() {
                this.$scope.canILoad = true;
                this.$scope.$broadcast('refreshGridWithoutSorting');
            }
            getPLStatement(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                var defer = this.$q.defer();
                this.accountService.getPLStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid })
                    .success((response) => {
                    if (response.success) {
                        this.$scope.totalPL = response.data.totalPnl;
                        defer.resolve(response.data);
                    }
                }).error(() => { defer.reject(); });
                return defer.promise;
            }
            getCreditStatement(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                };
                return this.accountService.getCreditStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
            getTransferStatement(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
        }
        admin.SAStatementsCtrl = SAStatementsCtrl;
        angular.module('intranet.admin').controller('sAStatementsCtrl', SAStatementsCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAStatementsCtrl.js.map