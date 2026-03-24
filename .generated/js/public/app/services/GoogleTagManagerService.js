var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class GoogleTagManagerService {
            constructor(baseService, $window) {
                this.baseService = baseService;
                this.$window = $window;
            }
            push(data) {
                try {
                    this.$window.dataLayer.push(data);
                }
                catch (e) { }
            }
        }
        services.GoogleTagManagerService = GoogleTagManagerService;
        angular.module('intranet.services').service('googleTagManagerService', GoogleTagManagerService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=GoogleTagManagerService.js.map