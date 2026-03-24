var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class CasinoService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getLaunchToken() {
                return this.baseService.get('ezugi/launchezugi');
            }
        }
        services.CasinoService = CasinoService;
        angular.module('intranet.services').service('casinoService', CasinoService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CasinoService.js.map