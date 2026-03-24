var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class AddCPUserCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, commonDataService, userService, $filter, $state) {
                super($scope);
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.userService = userService;
                this.$filter = $filter;
                this.$state = $state;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.newuser = {};
                this.$scope.newuser.status = '2';
                this.$scope.userStatus = [];
            }
            loadInitialData() {
                this.$scope.userStatus.push({ id: intranet.common.enums.UserStatus.Active, name: 'ACTIVE' });
                this.$scope.userStatus.push({ id: intranet.common.enums.UserStatus.Inactive, name: 'INACTIVE' });
            }
            checkusername() {
                if (!this.$scope.newuser.username) {
                    this.$scope.newuser.isInvalidUser = true;
                }
                else if (this.$scope.newuser.username.length < 4) {
                    this.$scope.newuser.isInvalidUser = true;
                }
                else if (this.$scope.newuser.username.indexOf('.') < 1) {
                    this.$scope.newuser.isInvalidUser = true;
                }
                else if (this.$scope.newuser.username.indexOf('.') == this.$scope.newuser.username.length - 1) {
                    this.$scope.newuser.isInvalidUser = true;
                }
                else {
                    this.$scope.newuser.isInvalidUser = false;
                }
            }
            validate() {
                if (!this.commonDataService.validatePassword(this.$scope.newuser.password, true)) {
                    return false;
                }
                else if (this.$scope.newuser.password !== this.$scope.newuser.confirmpassword) {
                    var msg = this.$filter('translate')('profile.password.confirm.invalid');
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Error, msg);
                    return false;
                }
                return true;
            }
            cancelNewUser() {
                this.$state.go('master.adminusers');
            }
            createAdminUser() {
                if (this.validate()) {
                    var item = {};
                    angular.copy(this.$scope.newuser, item);
                    var promise;
                    promise = this.userService.addAdminUser(item);
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        this.toasterService.showMessages(response.messages, 3000);
                        if (response.success) {
                            this.cancelNewUser();
                        }
                    });
                }
            }
        }
        master.AddCPUserCtrl = AddCPUserCtrl;
        angular.module('intranet.master').controller('addCPUserCtrl', AddCPUserCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddCPUserCtrl.js.map