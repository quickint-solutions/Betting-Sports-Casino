var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAB2CTransactionCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService, localStorageHelper, $stateParams) {
                super($scope);
                this.accountService = accountService;
                this.localStorageHelper = localStorageHelper;
                this.$stateParams = $stateParams;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.canILoad = false;
                this.$scope.reportType = this.$stateParams.reporttype > 0 ? this.$stateParams.reporttype : 1;
                var model = this.localStorageHelper.get('b2c_search_' + this.$stateParams.searchId);
                if (model.userId) {
                    this.$scope.search = model;
                    this.$scope.canILoad = true;
                }
            }
            loadInitialData() {
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            getB2CSummary(params) {
                return this.accountService.getB2CTransactions({ searchQuery: this.$scope.search, params: params });
            }
            getBonusTransactions(params) {
                return this.accountService.getBonusTransaction({ searchQuery: this.$scope.search, params: params });
            }
        }
        admin.SAB2CTransactionCtrl = SAB2CTransactionCtrl;
        angular.module('intranet.admin').controller('sAB2CTransactionCtrl', SAB2CTransactionCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAB2CTransactionsCtrl.js.map