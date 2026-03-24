var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class UserMarketService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getMarketList(data) {
                return this.baseService.post('usermarket', data);
            }
            updateUserMarketParams(data) {
                return this.baseService.post('usermarket/updateusermarket', data);
            }
        }
        services.UserMarketService = UserMarketService;
        angular.module('intranet.services').service('userMarketService', UserMarketService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UserMarketService.js.map