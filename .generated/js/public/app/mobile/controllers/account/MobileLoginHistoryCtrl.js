var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        var account;
        (function (account) {
            class MobileLoginHistoryCtrl extends intranet.common.ControllerBase {
                constructor($scope, tokenService) {
                    super($scope);
                    this.tokenService = tokenService;
                    super.init(this);
                }
                loadInitialData() {
                    this.getLoginHistory();
                }
                getLoginHistory() {
                    var promise;
                    promise = this.tokenService.getLoginHistory();
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.loginHistory = response.data;
                        }
                    });
                }
            }
            account.MobileLoginHistoryCtrl = MobileLoginHistoryCtrl;
            angular.module('intranet.mobile.account').controller('mobileLoginHistoryCtrl', MobileLoginHistoryCtrl);
        })(account = mobile.account || (mobile.account = {}));
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileLoginHistoryCtrl.js.map