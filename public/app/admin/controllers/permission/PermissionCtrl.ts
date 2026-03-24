module intranet.admin {
    export interface IPermissionScope extends intranet.common.IScopeBase {
        roles: any[];
        permissions: any[];
    }

    export class PermissionCtrl extends intranet.common.ControllerBase<IPermissionScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: IPermissionScope,
            private $state: any,
            private toasterService: intranet.common.services.ToasterService,
            private permissionService: services.PermissionService,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public loadInitialData(): void {
            this.getRolePermissions();
        }

        private addRole(isrole = true) {
            var options = new intranet.common.services.ModalOptions();
            options.data = { isRole: isrole };
            if (isrole) { options.header = 'admin.role.modal.header'; }
            else { options.header = 'admin.permission.modal.header'; }
            options.bodyUrl = this.settings.ThemeName + '/admin/permission/add-role-permission-modal.html';

            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.controller = 'addRolePermissionModalCtrl';
            modalDefaults.resolve = {
                modalOptions: () => {
                    return options;
                }
            };
            this.modalService.showWithOptions(options, modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.getRolePermissions();
                }
            });
        }

        private getRolePermissions(): void {
            this.permissionService.getRolePermission()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.permissions = response.data.permissions;
                        this.$scope.roles = response.data.roles;
                    } else {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                }).finally(() => {

                    angular.forEach((this.$scope.permissions), (p: any) => {
                        p.roles = [];
                        angular.forEach(this.$scope.roles, (r: any) => {
                            if (r.permissions && r.permissions.indexOf(p.id) > -1) {
                                p.roles.push({ id: r.id, name: r.name, isAssigned: true });
                            } else {
                                p.roles.push({ id: r.id, name: r.name, isAssigned: false });
                            }
                        });
                    });
                });
        }

        private saveRolePermission(): void {
            angular.forEach(this.$scope.roles, (r: any) => {
                r.permissions = [];
                angular.forEach((this.$scope.permissions), (p: any) => {
                    if (p.roles.some((pr: any) => { return pr.id == r.id && pr.isAssigned == true }) == true) {
                        r.permissions.push(p.id);
                    }
                });
            });
            this.permissionService.updateRolePermission(this.$scope.roles)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.getRolePermissions(); }
                    if (response.messages) this.toasterService.showMessages(response.messages, 5000);
                });
        }

        private deleteRole(roleId: number): void {
            this.permissionService.deleteRole(roleId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.getRolePermissions(); }
                    if (response.messages) this.toasterService.showMessages(response.messages, 5000);
                });
        }

        private deletePermission(permissionId: number): void {
            this.permissionService.deletePermission(permissionId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.getRolePermissions(); }
                    if (response.messages) this.toasterService.showMessages(response.messages, 5000);
                });
        }
    }

    angular.module('intranet.admin').controller('permissionCtrl', PermissionCtrl);
}