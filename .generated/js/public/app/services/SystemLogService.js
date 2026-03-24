var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class SystemLogService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getLogList(data) {
                return this.baseService.post('logger', data);
            }
            clearLog() {
                return this.baseService.get('logger/clearlog');
            }
        }
        services.SystemLogService = SystemLogService;
        angular.module('intranet.services').service('systemLogService', SystemLogService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SystemLogService.js.map