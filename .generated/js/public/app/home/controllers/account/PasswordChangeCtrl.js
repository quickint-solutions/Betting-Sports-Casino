var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class PasswordChangeCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, settings, userService, commonDataService, $filter) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                super.init(this);
            }
            initScopeValues() { this.$scope.messages = []; }
            loadInitialData() {
                this.getUserData();
            }
            getUserData() {
                this.$scope.user = this.commonDataService.getLoggedInUserData();
            }
            changePassword() {
                if (this.validate()) {
                    var model = {
                        currentPassword: this.$scope.currentPassword,
                        newPassword: this.$scope.newPassword,
                        userId: this.$scope.user.id
                    };
                    this.userService.changePassword(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.currentPassword = '';
                            this.$scope.newPassword = '';
                            this.$scope.confirmPassword = '';
                        }
                        this.$scope.messages = response.messages;
                    });
                }
            }
            validate() {
                if (!this.commonDataService.validatePassword(this.$scope.newPassword)) {
                    var msg = 'Password must be 6 character long, must contain alphabetics and numbers';
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                else if (this.$scope.newPassword !== this.$scope.confirmPassword) {
                    var msg = this.$filter('translate')('profile.password.confirm.invalid');
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                return true;
            }
        }
        home.PasswordChangeCtrl = PasswordChangeCtrl;
        angular.module('intranet.home').controller('passwordChangeCtrl', PasswordChangeCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PasswordChangeCtrl.js.map