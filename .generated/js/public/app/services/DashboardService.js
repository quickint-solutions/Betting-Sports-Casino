var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class DashboardService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getBetSummary() {
                return this.baseService.get('dashboard/getbetsummary');
            }
            getLiveBetSummary() {
                return this.baseService.get('dashboard/getlivebetsummary');
            }
            getSummaryByEventype(eventtypeid) {
                return this.baseService.get('dashboard/getlivegamesummary/' + eventtypeid);
            }
            getTotalMarkets() {
                return this.baseService.get('dashboard/gettotalmarket');
            }
            getUserSummary() {
                return this.baseService.get('dashboard/getusersummary');
            }
            getLivebetTotal() {
                return this.baseService.get('dashboard/getlivebettotal');
            }
            getRecentProfitloss() {
                return this.baseService.get('dashboard/getrecentprofitloss');
            }
            getTopTableWisePL(data) {
                return this.baseService.post('dashboard/gettoptablewisepl', data);
            }
            getTopUserWisePL(data) {
                return this.baseService.post('dashboard/gettopuserwisepl', data);
            }
        }
        services.DashboardService = DashboardService;
        angular.module('intranet.services').service('dashboardService', DashboardService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=DashboardService.js.map