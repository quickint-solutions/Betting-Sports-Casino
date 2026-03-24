namespace intranet.common.services {
    export class AuthorizationService extends intranet.common.security.BaseAuthorizationService {

        constructor(private baseService: BaseService,
            localStorageHelper: common.helpers.LocalStorageHelper,
            settings: intranet.common.IBaseSettings,
            websiteService: intranet.services.WebsiteService,
            $q: ng.IQService) {
            super(localStorageHelper, settings, websiteService, $q);
        }

        protected getClaims(): ng.IHttpPromise<any> {
            return this.baseService.get('permission/claims');
        }
    }

    angular.module('intranet.common.services').service('authorizationService', AuthorizationService);
}