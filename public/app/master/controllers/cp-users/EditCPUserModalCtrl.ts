module intranet.master {
    export interface IEditCPUserModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        user: any;
        userStatus: any;
    }

    export class EditCPUserModalCtrl extends intranet.common.ControllerBase<IEditCPUserModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IEditCPUserModalScope,
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };


        }

        public loadInitialData(): void {
            this.$scope.userStatus.push({ id: common.enums.UserStatus.Active, name: 'ACTIVE' });
            this.$scope.userStatus.push({ id: common.enums.UserStatus.Inactive, name: 'INACTIVE' });
        }

        private validate(): boolean {
            if (this.$scope.user.password) {
                if (!this.commonDataService.validatePassword(this.$scope.user.password, true)) {
                    return false;
                }
                else if (this.$scope.user.password !== this.$scope.user.confirmpassword) {
                    var msg: string = this.$filter('translate')('profile.password.confirm.invalid');
                    this.toasterService.showToast(common.helpers.ToastType.Error, msg);
                    return false;
                }
            }
            return true;
        }

        private saveUser(): void {
            if (this.validate() || this.$scope.user.password == '') {
                var item: any = {};
                angular.copy(this.$scope.user, item);
                var promise: ng.IHttpPromise<any>;
                promise = this.userService.updateAdminUser(item);
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
    }

    angular.module('intranet.master').controller('editCPUserModalCtrl', EditCPUserModalCtrl);
}