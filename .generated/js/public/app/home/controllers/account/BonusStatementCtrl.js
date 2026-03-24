var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class BonusStatementCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, commonDataService, accountService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.commonDataService = commonDataService;
                this.accountService = accountService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                };
                this.setDates(-3, 'M');
            }
            loadInitialData() {
                this.getUserId();
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.refreshGrid();
            }
            getUserId() {
                if (this.$stateParams.memberid) {
                    this.$scope.userid = this.$stateParams.memberid;
                }
                else {
                    var result = this.commonDataService.getLoggedInUserData();
                    if (result) {
                        this.$scope.userid = result.id;
                    }
                }
            }
            getBonusStatement(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                return this.accountService.getBonusStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
        }
        home.BonusStatementCtrl = BonusStatementCtrl;
        angular.module('intranet.home').controller('bonusStatementCtrl', BonusStatementCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BonusStatementCtrl.js.map