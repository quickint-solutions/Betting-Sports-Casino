var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class CommissionService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            setFullCommission(data) {
                return this.baseService.post('commission/setfullcommission', data);
            }
            getcommission(userId) {
                return this.baseService.get('commission/getcommission/' + userId);
            }
            setCommission(data) {
                return this.baseService.post('commission/setcommission', data);
            }
        }
        services.CommissionService = CommissionService;
        angular.module('intranet.services').service('commissionService', CommissionService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CommissionService.js.map