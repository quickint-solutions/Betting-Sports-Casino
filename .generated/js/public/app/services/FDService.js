var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class FDService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            launchFairDeal() {
                return this.baseService.get('fdstudio/launchfairdeal');
            }
            getLiveBets(data) {
                return this.baseService.post('fdstudio/getlivebets', data);
            }
            getLiveBetsExport(data) {
                return this.baseService.post('fdstudio/getlivebetsexport', data, { timeout: this.baseService.longTime });
            }
            getBetHistory(data) {
                return this.baseService.post('fdstudio/getbethistory', data);
            }
            getBetHistoryExport(data) {
                return this.baseService.post('fdstudio/getbethistoryexport', data, { timeout: this.baseService.longTime });
            }
            getProfitLoss(data) {
                return this.baseService.post('fdstudio/getprofitloss', data);
            }
            getProfitLossBets(roundId, userid = '') {
                return this.baseService.get('fdstudio/getprofitlossbet/' + roundId + '/' + userid);
            }
            getPLbyUser(data) {
                return this.baseService.post('fdstudio/getprofitloss', data, { timeout: this.baseService.longTime });
            }
            getProfitLossByTable(data) {
                return this.baseService.post('fdstudio/getprofitlossbytable', data);
            }
            getPLbyTableExport(data) {
                return this.baseService.post('fdstudio/getplbytableexport', data);
            }
            getPendingFDExposure(data) {
                return this.baseService.post('fdstudio/getpendingfdexposure', data);
            }
            removePendingFDExposure(data) {
                return this.baseService.post('fdstudio/removependingfdexposure', data);
            }
            getRunningFDExposure(data) {
                return this.baseService.post('fdstudio/getrunningexposure', data);
            }
            getProfitLossByAdmin(data) {
                return this.baseService.post('fdstudio/getprofitlossbyadmin', data, { timeout: this.baseService.longTime });
            }
            getProfitLossByUser(data) {
                return this.baseService.post('fdstudio/getprofitlossbyuser', data, { timeout: this.baseService.longTime });
            }
            getProfitLossByUserExport(data) {
                return this.baseService.post('fdstudio/getprofitlossbyuserexport', data, { timeout: this.baseService.longTime });
            }
        }
        services.FDService = FDService;
        angular.module('intranet.services').service('fdService', FDService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FDService.js.map