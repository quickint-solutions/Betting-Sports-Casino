var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SACasinoBankingCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService) {
                super($scope);
                this.accountService = accountService;
                super.init(this);
            }
            initScopeValues() {
            }
            loadInitialData() {
                this.getBalance();
            }
            getBalance() {
                this.accountService.getCasinoMasterBalanceDetail()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.balance = response.data;
                    }
                });
            }
        }
        admin.SACasinoBankingCtrl = SACasinoBankingCtrl;
        angular.module('intranet.admin').controller('sACasinoBankingCtrl', SACasinoBankingCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SACasinoBankingCtrl.js.map