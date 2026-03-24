var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SABankingCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, settings, accountService) {
                super($scope);
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.accountService = accountService;
                super.init(this);
            }
            initScopeValues() {
            }
            loadInitialData() {
                this.getBalance();
            }
            getBalance() {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.accountService.getMasterBalanceDetail(result.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.balance = response.data;
                        }
                    });
                }
            }
        }
        admin.SABankingCtrl = SABankingCtrl;
        angular.module('intranet.admin').controller('sABankingCtrl', SABankingCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SABankingCtrl.js.map