var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class LoginHistoryCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, tokenService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.tokenService = tokenService;
                super.init(this);
            }
            loadInitialData() {
                this.getLoginHistory();
            }
            getLoginHistory() {
                var promise;
                if (this.$stateParams.memberid) {
                    this.$scope.fromMaster = true;
                    promise = this.tokenService.getLoginHistoryById(this.$stateParams.memberid);
                }
                else {
                    promise = this.tokenService.getLoginHistory();
                }
                promise.success((response) => {
                    if (response.success) {
                        this.$scope.loginHistory = response.data;
                    }
                });
            }
        }
        home.LoginHistoryCtrl = LoginHistoryCtrl;
        angular.module('intranet.home').controller('loginHistoryCtrl', LoginHistoryCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LoginHistoryCtrl.js.map