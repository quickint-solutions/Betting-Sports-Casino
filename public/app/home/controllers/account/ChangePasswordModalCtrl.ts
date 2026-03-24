module intranet.home {
    export interface IChangePasswordModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
        userId: any;
        fromMember: boolean;
    }

    export class ChangePasswordModalCtrl extends intranet.common.ControllerBase<IChangePasswordModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IChangePasswordModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private validate(): boolean {
            if (!this.commonDataService.validatePassword(this.$scope.newPassword)) {
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    'Password must be 6 character long, must contain alphabetics and numbers', null));
                return false;
            }
            if (this.$scope.newPassword !== this.$scope.confirmPassword) {
                var msg: string = this.$filter('translate')('profile.password.confirm.invalid');
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            return true;
        }

        private changePassword(): void {
            if (this.validate()) {
                var model = {
                    currentPassword: this.$scope.currentPassword,
                    newPassword: this.$scope.newPassword,
                    userId: this.$scope.userId
                };
                var promise: ng.IHttpPromise<any>;
                if (this.$scope.fromMember) {
                    promise = this.userService.changePasswordById(model);
                } else {
                    promise = this.userService.changePassword(model);
                }
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });

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

    angular.module('intranet.home').controller('changePasswordModalCtrl', ChangePasswordModalCtrl);
}