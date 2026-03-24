var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class RunnerService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getRunnerList(data) {
                return this.baseService.post('runner', data);
            }
            searchRunner(search) {
                return this.baseService.postWithCancel('runner/searchrunner', search);
            }
            addRunner(data) {
                return this.baseService.post('runner/addrunner', data);
            }
            updateRunner(data) {
                return this.baseService.post('runner/updaterunner', data);
            }
        }
        services.RunnerService = RunnerService;
        angular.module('intranet.services').service('runnerService', RunnerService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=RunnerService.js.map