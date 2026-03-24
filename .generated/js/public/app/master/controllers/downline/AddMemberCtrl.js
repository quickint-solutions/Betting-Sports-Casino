var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class AddMemberCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, userService, $filter, $stateParams, toasterService, $state) {
                super($scope);
                this.commonDataService = commonDataService;
                this.userService = userService;
                this.$filter = $filter;
                this.$stateParams = $stateParams;
                this.toasterService = toasterService;
                this.$state = $state;
                this.$scope.$on('$destroy', () => {
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.newuser = { status: 2, ptConfig: {} };
                this.$scope.crLimit = 0;
            }
            loadInitialData() {
                this.$scope.loginUser = this.commonDataService.getLoggedInUserData();
                this.getPostFixName();
                document.getElementById('newusername').focus();
                this.$scope.currentUser = this.commonDataService.getLoggedInUserData();
                this.getPtLimit();
            }
            getPostFixName() {
                this.userService.getUsercode(this.$stateParams.parentid)
                    .success((response) => {
                    if (response.success) {
                        var name = response.data;
                        var lastCh = name.substr(name.length - 2, 2);
                        this.$scope.parentCode = name.substr(0, name.length - 2);
                        this.$scope.newuser.fl = lastCh[0];
                        this.$scope.newuser.sl = lastCh[1];
                    }
                });
            }
            isNameAvailable() {
                if (this.$scope.newuser.fl && this.$scope.newuser.sl) {
                    this.userService.checkName(this.$scope.parentCode + this.$scope.newuser.fl + this.$scope.newuser.sl)
                        .success((response) => {
                        this.$scope.newuser.isNameInvalid = !response.data;
                    });
                }
                else {
                    this.$scope.newuser.isNameInvalid = true;
                }
            }
            getPtLimit() {
                this.userService.getMyInfo(this.$stateParams.parentid)
                    .success((response) => {
                    if (response && response.success) {
                        if (response.data.balanceInfo) {
                            var bl = response.data.balanceInfo;
                            if (bl) {
                                this.$scope.crLimit = (math.subtract(bl.creditLimit, bl.givenCredit ? bl.givenCredit : 0));
                                this.$scope.crLimit = this.$filter('toRateOnly')(this.$scope.crLimit);
                            }
                        }
                    }
                });
            }
            cancelNewUser() {
                this.$state.go('master.memberlist', { memberid: this.$stateParams.parentid, userid: '' });
            }
            isUsernameAvailable() {
                if (this.$scope.newuser.username && this.$scope.newuser.username.length > 3) {
                    this.userService.checkUsername(this.$scope.newuser.username)
                        .success((response) => {
                        this.$scope.newuser.isInvalid = !response.data;
                    });
                }
                else {
                    this.$scope.newuser.isInvalid = false;
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
                if (this.$scope.newuser.creditRef > this.$scope.crLimit) {
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Error, "Credit should not be greater than " + this.$scope.crLimit);
                }
                return true;
            }
            addUser() {
                if (this.validate()) {
                    var item = {};
                    angular.copy(this.$scope.newuser, item);
                    item.userCode = this.$scope.parentCode + item.fl + item.sl;
                    if (item.creditRef) {
                        item.creditRef = this.$filter('toGLC')(item.creditRef);
                    }
                    item.parentId = this.$stateParams.parentid;
                    var promise;
                    promise = this.userService.addDownlineMembers(item);
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        this.toasterService.showMessages(response.messages, 3000);
                        if (response.success) {
                            this.$state.go('master.memberlist', { memberid: this.$stateParams.parentid, userid: '' });
                        }
                    });
                }
            }
        }
        master.AddMemberCtrl = AddMemberCtrl;
        angular.module('intranet.master').controller('addMemberCtrl', AddMemberCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddMemberCtrl.js.map