module intranet.admin {

    export interface ISABankingScope extends intranet.common.IScopeBase {
        balance: any;
    }

    export class SABankingCtrl extends intranet.common.ControllerBase<ISABankingScope>
        implements common.init.IInit {
        constructor($scope: ISABankingScope,
            private commonDataService: common.services.CommonDataService,
            private settings: common.IBaseSettings,
            private accountService: services.AccountService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
        }

        public loadInitialData(): void {
            this.getBalance();
        }

        private getBalance(): void {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                this.accountService.getMasterBalanceDetail(result.id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.balance = response.data;
                        }
                    });
            }
        }
    }

    angular.module('intranet.admin').controller('sABankingCtrl', SABankingCtrl);
}