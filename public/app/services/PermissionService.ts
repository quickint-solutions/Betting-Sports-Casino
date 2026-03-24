namespace intranet.services {
    export class PermissionService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public getRolePermission(): ng.IHttpPromise<any> {
            return this.baseService.get('permission');
        }

        public addRole(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('permission/addrole', data);
        }

        public addPermission(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('permission/addpermission', data);
        }

        public updateRolePermission(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('permission/updatepermission', data);
        }

        public deleteRole(roleId: any): ng.IHttpPromise<any> {
            return this.baseService.get('permission/deleterole/' + roleId);
        }

        public deletePermission(permissionId: any): ng.IHttpPromise<any> {
            return this.baseService.get('permission/deletepermission/' + permissionId);
        }
    }

    angular.module('intranet.services').service('permissionService', PermissionService);

}