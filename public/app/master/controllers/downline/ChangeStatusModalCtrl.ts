module intranet.master {
    export interface IChangeStatusModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        user: any
        userTypes: any[];

        password: any;
    }

    export class ChangeStatusModalCtrl extends intranet.common.ControllerBase<IChangeStatusModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IChangeStatusModalScope,
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
            this.$scope.userTypes = [];
            this.$scope.messages = [];
            this.$scope.user = {};
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.user = this.modalOptions.data;
                this.$scope.user.selectedStatus = this.modalOptions.data.status;
            }

            this.$scope.modalOptions.ok = result => {
                this.changeUserStatus();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.fillUserTypes();
        }

        private fillUserTypes(): void {
            this.$scope.userTypes = super.getUserTypes();
        }

        private getUserStatus(status: any): string {
            return common.enums.UserStatus[status];
        }

        private getUserTypeShort(usertype: any): any {
            var found = this.$scope.userTypes.filter((a) => { return a.id == usertype; });
            if (found.length>0) {
                return found[0].name;
            }
        }

        private changeUserStatus(): void {
            var promise: ng.IHttpPromise<any>;
            var model = { Password: this.$scope.password, userId: this.$scope.user.userId, status: this.$scope.user.selectedStatus };
            promise = this.userService.changeStatus(model);
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

    angular.module('intranet.master').controller('changeStatusModalCtrl', ChangeStatusModalCtrl);
}