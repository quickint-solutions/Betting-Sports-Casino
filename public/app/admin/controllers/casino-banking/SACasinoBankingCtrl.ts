module intranet.admin {

    export interface ISACasinoBankingScope extends intranet.common.IScopeBase {
        balance: any;
    }

    export class SACasinoBankingCtrl extends intranet.common.ControllerBase<ISACasinoBankingScope>
        implements common.init.IInit {
        constructor($scope: ISACasinoBankingScope,
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
            this.accountService.getCasinoMasterBalanceDetail()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.balance = response.data;
                    }
                });
        }

    }

    angular.module('intranet.admin').controller('sACasinoBankingCtrl', SACasinoBankingCtrl);
}