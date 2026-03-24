var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class PermissionCtrl extends intranet.common.ControllerBase {
            constructor($scope, $state, toasterService, permissionService, modalService, settings) {
                super($scope);
                this.$state = $state;
                this.toasterService = toasterService;
                this.permissionService = permissionService;
                this.modalService = modalService;
                this.settings = settings;
                super.init(this);
            }
            loadInitialData() {
                this.getRolePermissions();
            }
            addRole(isrole = true) {
                var options = new intranet.common.services.ModalOptions();
                options.data = { isRole: isrole };
                if (isrole) {
                    options.header = 'admin.role.modal.header';
                }
                else {
                    options.header = 'admin.permission.modal.header';
                }
                options.bodyUrl = this.settings.ThemeName + '/admin/permission/add-role-permission-modal.html';
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.controller = 'addRolePermissionModalCtrl';
                modalDefaults.resolve = {
                    modalOptions: () => {
                        return options;
                    }
                };
                this.modalService.showWithOptions(options, modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.getRolePermissions();
                    }
                });
            }
            getRolePermissions() {
                this.permissionService.getRolePermission()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.permissions = response.data.permissions;
                        this.$scope.roles = response.data.roles;
                    }
                    else {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                }).finally(() => {
                    angular.forEach((this.$scope.permissions), (p) => {
                        p.roles = [];
                        angular.forEach(this.$scope.roles, (r) => {
                            if (r.permissions && r.permissions.indexOf(p.id) > -1) {
                                p.roles.push({ id: r.id, name: r.name, isAssigned: true });
                            }
                            else {
                                p.roles.push({ id: r.id, name: r.name, isAssigned: false });
                            }
                        });
                    });
                });
            }
            saveRolePermission() {
                angular.forEach(this.$scope.roles, (r) => {
                    r.permissions = [];
                    angular.forEach((this.$scope.permissions), (p) => {
                        if (p.roles.some((pr) => { return pr.id == r.id && pr.isAssigned == true; }) == true) {
                            r.permissions.push(p.id);
                        }
                    });
                });
                this.permissionService.updateRolePermission(this.$scope.roles)
                    .success((response) => {
                    if (response.success) {
                        this.getRolePermissions();
                    }
                    if (response.messages)
                        this.toasterService.showMessages(response.messages, 5000);
                });
            }
            deleteRole(roleId) {
                this.permissionService.deleteRole(roleId)
                    .success((response) => {
                    if (response.success) {
                        this.getRolePermissions();
                    }
                    if (response.messages)
                        this.toasterService.showMessages(response.messages, 5000);
                });
            }
            deletePermission(permissionId) {
                this.permissionService.deletePermission(permissionId)
                    .success((response) => {
                    if (response.success) {
                        this.getRolePermissions();
                    }
                    if (response.messages)
                        this.toasterService.showMessages(response.messages, 5000);
                });
            }
        }
        admin.PermissionCtrl = PermissionCtrl;
        angular.module('intranet.admin').controller('permissionCtrl', PermissionCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PermissionCtrl.js.map