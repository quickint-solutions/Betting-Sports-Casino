module intranet.master {

    export interface IAddCPUserScope extends intranet.common.IScopeBase {
        newuser: any;
        userStatus: any[];
    }

    export class AddCPUserCtrl extends intranet.common.ControllerBase<IAddCPUserScope>
        implements common.init.IInit {
        constructor($scope: IAddCPUserScope,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private userService: services.UserService,
            private $filter:any,
            private $state: any) {
            super($scope);

          
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.newuser = {};
            this.$scope.newuser.status = '2';
            this.$scope.userStatus = [];
        }

        public loadInitialData(): void {
            this.$scope.userStatus.push({ id: common.enums.UserStatus.Active, name: 'ACTIVE' });
            this.$scope.userStatus.push({ id: common.enums.UserStatus.Inactive, name: 'INACTIVE' });
        }

        private checkusername(): void {
            if (!this.$scope.newuser.username) { this.$scope.newuser.isInvalidUser = true; }
            else if (this.$scope.newuser.username.length < 4) { this.$scope.newuser.isInvalidUser = true; }
            else if (this.$scope.newuser.username.indexOf('.') < 1) { this.$scope.newuser.isInvalidUser = true; }
            else if (this.$scope.newuser.username.indexOf('.') == this.$scope.newuser.username.length-1) { this.$scope.newuser.isInvalidUser = true; }
            else { this.$scope.newuser.isInvalidUser = false; }
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
            return true;
        }

        private cancelNewUser(): void {
            this.$state.go('master.adminusers');
        }

        private createAdminUser(): void {
            if (this.validate()) {
                var item: any = {};
                angular.copy(this.$scope.newuser, item);
                var promise: ng.IHttpPromise<any>;
                promise = this.userService.addAdminUser(item);
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(response.messages, 3000);
                    if (response.success) {
                        this.cancelNewUser();
                    }
                });

            }
        }
      
    }

    angular.module('intranet.master').controller('addCPUserCtrl', AddCPUserCtrl);
}