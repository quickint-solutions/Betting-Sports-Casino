var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class AuthorizationService extends intranet.common.security.BaseAuthorizationService {
                constructor(baseService, localStorageHelper, settings, websiteService, $q) {
                    super(localStorageHelper, settings, websiteService, $q);
                    this.baseService = baseService;
                }
                getClaims() {
                    return this.baseService.get('permission/claims');
                }
            }
            services.AuthorizationService = AuthorizationService;
            angular.module('intranet.common.services').service('authorizationService', AuthorizationService);
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AuthorizationService.js.map