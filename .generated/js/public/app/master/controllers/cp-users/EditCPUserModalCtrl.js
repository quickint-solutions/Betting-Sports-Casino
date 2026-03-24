var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class EditCPUserModalCtrl extends intranet.common.ControllerBase {
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
                this.$scope.userStatus = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.user = this.modalOptions.data;
                    if (this.$scope.user && this.$scope.user.status) {
                        this.$scope.user.status = this.$scope.user.status.toString();
                    }
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveUser();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.$scope.userStatus.push({ id: intranet.common.enums.UserStatus.Active, name: 'ACTIVE' });
                this.$scope.userStatus.push({ id: intranet.common.enums.UserStatus.Inactive, name: 'INACTIVE' });
            }
            validate() {
                if (this.$scope.user.password) {
                    if (!this.commonDataService.validatePassword(this.$scope.user.password, true)) {
                        return false;
                    }
                    else if (this.$scope.user.password !== this.$scope.user.confirmpassword) {
                        var msg = this.$filter('translate')('profile.password.confirm.invalid');
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Error, msg);
                        return false;
                    }
                }
                return true;
            }
            saveUser() {
                if (this.validate() || this.$scope.user.password == '') {
                    var item = {};
                    angular.copy(this.$scope.user, item);
                    var promise;
                    promise = this.userService.updateAdminUser(item);
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                        else {
                            this.$scope.messages = response.messages;
                        }
                    });
                }
            }
        }
        master.EditCPUserModalCtrl = EditCPUserModalCtrl;
        angular.module('intranet.master').controller('editCPUserModalCtrl', EditCPUserModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EditCPUserModalCtrl.js.map