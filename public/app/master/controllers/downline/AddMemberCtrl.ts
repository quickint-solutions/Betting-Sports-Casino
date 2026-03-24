module intranet.master {

    export interface IAddMemberScope extends intranet.common.IScopeBase {
        newuser: any;
        currentUser: any;
        loginUser: any;
        crLimit: any;
        parentCode: any;
    }

    export class AddMemberCtrl extends intranet.common.ControllerBase<IAddMemberScope>
        implements intranet.common.init.IInit {
        constructor($scope: IAddMemberScope,
            private commonDataService: common.services.CommonDataService,
            private userService: services.UserService,
            private $filter: any,
            private $stateParams: any,
            private toasterService: intranet.common.services.ToasterService,
            private $state: any) {
            super($scope);


            this.$scope.$on('$destroy', () => {

            });
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.newuser = { status: 2, ptConfig: {} };
            this.$scope.crLimit = 0;
        }

        public loadInitialData(): void {
            this.$scope.loginUser = this.commonDataService.getLoggedInUserData();
            this.getPostFixName();

            document.getElementById('newusername').focus();
            this.$scope.currentUser = this.commonDataService.getLoggedInUserData();
            this.getPtLimit();
        }

        private getPostFixName(): void {
            this.userService.getUsercode(this.$stateParams.parentid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        var name: string = response.data;
                        var lastCh = name.substr(name.length - 2, 2);
                        this.$scope.parentCode = name.substr(0, name.length - 2);

                        this.$scope.newuser.fl = lastCh[0];
                        this.$scope.newuser.sl = lastCh[1];
                    }
                });
        }

        private isNameAvailable(): void {
            if (this.$scope.newuser.fl && this.$scope.newuser.sl) {
                this.userService.checkName(this.$scope.parentCode + this.$scope.newuser.fl + this.$scope.newuser.sl)
                    .success((response: common.messaging.IResponse<any>) => {
                        this.$scope.newuser.isNameInvalid = !response.data;
                    });
            } else {
                this.$scope.newuser.isNameInvalid = true;
            }
        }

        private getPtLimit(): void {
            this.userService.getMyInfo(this.$stateParams.parentid)
                .success((response: common.messaging.IResponse<any>) => {
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


        private cancelNewUser(): void {
            this.$state.go('master.memberlist', { memberid: this.$stateParams.parentid, userid: '' });
        }

        private isUsernameAvailable(): void {
            if (this.$scope.newuser.username && this.$scope.newuser.username.length > 3) {
                this.userService.checkUsername(this.$scope.newuser.username)
                    .success((response: common.messaging.IResponse<any>) => {
                        this.$scope.newuser.isInvalid = !response.data;
                    });
            } else {
                this.$scope.newuser.isInvalid = false;
            }
        }

        private validate(): boolean {
            if (!this.commonDataService.validatePassword(this.$scope.newuser.password, true)) {
                return false;
            }
            else if (this.$scope.newuser.password !== this.$scope.newuser.confirmpassword) {
                var msg: string = this.$filter('translate')('profile.password.confirm.invalid');
                this.toasterService.showToast(common.helpers.ToastType.Error, msg);
                return false;
            }
            if (this.$scope.newuser.creditRef > this.$scope.crLimit) {
                this.toasterService.showToast(common.helpers.ToastType.Error, "Credit should not be greater than " + this.$scope.crLimit);
            }
            return true;
        }

        private addUser(): void {
            if (this.validate()) {
                var item: any = {};
                angular.copy(this.$scope.newuser, item);
                item.userCode = this.$scope.parentCode + item.fl + item.sl;
                if (item.creditRef) { item.creditRef = this.$filter('toGLC')(item.creditRef); }
                item.parentId = this.$stateParams.parentid;
                var promise: ng.IHttpPromise<any>;
                promise = this.userService.addDownlineMembers(item);
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(response.messages, 3000);
                    if (response.success) {
                        this.$state.go('master.memberlist', { memberid: this.$stateParams.parentid, userid: '' });
                    }
                });
            }
        }
    }
    angular.module('intranet.master').controller('addMemberCtrl', AddMemberCtrl);
}