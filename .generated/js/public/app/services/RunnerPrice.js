var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class RunnerPriceService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getRunnerList(data) {
                return this.baseService.post('defaultprice', data);
            }
            addRunnerPrice(data) {
                return this.baseService.post('defaultprice/adddefaultprice', data);
            }
            updateRunnerPrice(data) {
                return this.baseService.post('defaultprice/updatedefaultprice', data);
            }
            deleteRunnerPrice(id) {
                return this.baseService.get('defaultprice/deletedefaultprice/' + id);
            }
        }
        services.RunnerPriceService = RunnerPriceService;
        angular.module('intranet.services').service('runnerPriceService', RunnerPriceService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=RunnerPrice.js.map