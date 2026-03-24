var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class ExposureService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getTopSizeMatched() {
                return this.baseService.get('exposure/gettopsizematched');
            }
            getTopExposure() {
                return this.baseService.get('exposure/gettopexposure');
            }
            getEventTypeExposure() {
                return this.baseService.get('exposure/geteventtypeexposure');
            }
            getExposure() {
                return this.baseService.get('exposure/getexposure');
            }
        }
        services.ExposureService = ExposureService;
        angular.module('intranet.services').service('exposureService', ExposureService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ExposureService.js.map