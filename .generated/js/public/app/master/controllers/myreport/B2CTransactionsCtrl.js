var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class B2CTransactionCtrl extends intranet.common.ControllerBase {
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
        master.B2CTransactionCtrl = B2CTransactionCtrl;
        angular.module('intranet.master').controller('b2CTransactionCtrl', B2CTransactionCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=B2CTransactionsCtrl.js.map