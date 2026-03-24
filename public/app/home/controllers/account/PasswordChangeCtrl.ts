module intranet.home {

    export interface IPasswordChangeScope extends intranet.common.IScopeBase {
        currentPassword: any;
        newPassword: any;
        confirmPassword: any;
        user: any;
    }

    export class PasswordChangeCtrl extends intranet.common.ControllerBase<IPasswordChangeScope>
        implements intranet.common.init.IInit {
        constructor($scope: IPasswordChangeScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void { this.$scope.messages = []; }

        public loadInitialData(): void {
            this.getUserData();
        }

        private getUserData(): void {
            this.$scope.user = this.commonDataService.getLoggedInUserData();
        }

        public changePassword(): void {
            if (this.validate()) {
                var model = {
                    currentPassword: this.$scope.currentPassword,
                    newPassword: this.$scope.newPassword,
                    userId: this.$scope.user.id
                };
                this.userService.changePassword(model)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.currentPassword = '';
                            this.$scope.newPassword = '';
                            this.$scope.confirmPassword = '';
                        }
                        this.$scope.messages = response.messages;
                    });
            }
        }

        private validate(): any {
            if (!this.commonDataService.validatePassword(this.$scope.newPassword)) {
                var msg: string = 'Password must be 6 character long, must contain alphabetics and numbers';
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            else if (this.$scope.newPassword !== this.$scope.confirmPassword) {
                var msg: string = this.$filter('translate')('profile.password.confirm.invalid');
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            return true;
        }

    }
    angular.module('intranet.home').controller('passwordChangeCtrl', PasswordChangeCtrl);
}