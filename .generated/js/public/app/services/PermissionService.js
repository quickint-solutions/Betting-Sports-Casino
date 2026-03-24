var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class PermissionService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getRolePermission() {
                return this.baseService.get('permission');
            }
            addRole(data) {
                return this.baseService.post('permission/addrole', data);
            }
            addPermission(data) {
                return this.baseService.post('permission/addpermission', data);
            }
            updateRolePermission(data) {
                return this.baseService.post('permission/updatepermission', data);
            }
            deleteRole(roleId) {
                return this.baseService.get('permission/deleterole/' + roleId);
            }
            deletePermission(permissionId) {
                return this.baseService.get('permission/deletepermission/' + permissionId);
            }
        }
        services.PermissionService = PermissionService;
        angular.module('intranet.services').service('permissionService', PermissionService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PermissionService.js.map