module intranet.master {

    export interface IB2CTransactionsScope extends intranet.common.IScopeBase {
        search: any;
        canILoad: boolean;
        reportType: any;
    }

    export class B2CTransactionCtrl extends intranet.common.ControllerBase<IB2CTransactionsScope>
        implements common.init.IInit {
        constructor($scope: IB2CTransactionsScope,
            private accountService: services.AccountService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private $stateParams: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.canILoad = false;
            this.$scope.reportType = this.$stateParams.reporttype > 0 ? this.$stateParams.reporttype : 1;
            var model = this.localStorageHelper.get('b2c_search_' + this.$stateParams.searchId);
            if (model.userId) {
                this.$scope.search = model;
                this.$scope.canILoad = true;
            }
        }

        public loadInitialData(): void {
        }


        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }


        private getB2CSummary(params: any): any {
            return this.accountService.getB2CTransactions({ searchQuery: this.$scope.search, params: params });
        }

        private getBonusTransactions(params: any): any {
            return this.accountService.getBonusTransaction({ searchQuery: this.$scope.search, params: params });
        }

    }
    angular.module('intranet.master').controller('b2CTransactionCtrl', B2CTransactionCtrl);
}