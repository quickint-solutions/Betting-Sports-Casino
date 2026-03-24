module intranet.admin {

    export interface IAddRolePermissionModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        name: string;
        key: string;

        isRole: boolean;
    }

    export class AddRolePermissionModalCtrl extends intranet.common.ControllerBase<IAddRolePermissionModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddRolePermissionModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private permissionService: services.PermissionService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.isRole = false;
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.isRole = this.modalOptions.data.isRole;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveRole();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveRole(): void {
            var promise: ng.IHttpPromise<any>;
            var model = { name: this.$scope.name, key: this.$scope.key };
            if (this.$scope.isRole) {
                promise = this.permissionService.addRole(model);
            } else {
                promise = this.permissionService.addPermission(model);
            }
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

    angular.module('intranet.admin').controller('addRolePermissionModalCtrl', AddRolePermissionModalCtrl);
}