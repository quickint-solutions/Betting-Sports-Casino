var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class ChangePasswordModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.userId = this.modalOptions.data.userId;
                    this.$scope.fromMember = this.modalOptions.data.fromMember;
                }
                this.$scope.modalOptions.ok = result => {
                    this.changePassword();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            validate() {
                if (!this.commonDataService.validatePassword(this.$scope.newPassword)) {
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, 'Password must be 6 character long, must contain alphabetics and numbers', null));
                    return false;
                }
                if (this.$scope.newPassword !== this.$scope.confirmPassword) {
                    var msg = this.$filter('translate')('profile.password.confirm.invalid');
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                return true;
            }
            changePassword() {
                if (this.validate()) {
                    var model = {
                        currentPassword: this.$scope.currentPassword,
                        newPassword: this.$scope.newPassword,
                        userId: this.$scope.userId
                    };
                    var promise;
                    if (this.$scope.fromMember) {
                        promise = this.userService.changePasswordById(model);
                    }
                    else {
                        promise = this.userService.changePassword(model);
                    }
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                            if (!this.$scope.fromMember) {
                                this.commonDataService.logout(5);
                            }
                        }
                        else {
                            this.$scope.messages = response.messages;
                        }
                    });
                }
            }
        }
        home.ChangePasswordModalCtrl = ChangePasswordModalCtrl;
        angular.module('intranet.home').controller('changePasswordModalCtrl', ChangePasswordModalCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ChangePasswordModalCtrl.js.map