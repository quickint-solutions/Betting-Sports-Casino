namespace intranet.services {
    export class FDService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public launchFairDeal(): ng.IHttpPromise<any> {
            return this.baseService.get('fdstudio/launchfairdeal');
        }

        public getLiveBets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getlivebets', data);
        }
        public getLiveBetsExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getlivebetsexport', data, { timeout: this.baseService.longTime });
        }

        public getBetHistory(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getbethistory', data);
        }
        public getBetHistoryExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getbethistoryexport', data, { timeout: this.baseService.longTime });
        }

        public getProfitLoss(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getprofitloss', data);
        }
        public getProfitLossBets(roundId: any, userid: any = ''): ng.IHttpPromise<any> {
            return this.baseService.get('fdstudio/getprofitlossbet/' + roundId + '/' + userid);
        }

        public getPLbyUser(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getprofitloss', data, { timeout: this.baseService.longTime });
        }
        public getProfitLossByTable(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getprofitlossbytable', data);
        }
        public getPLbyTableExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getplbytableexport', data);
        }

        public getPendingFDExposure(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getpendingfdexposure', data);
        }
        public removePendingFDExposure(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/removependingfdexposure', data);
        }
        public getRunningFDExposure(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getrunningexposure', data);
        }

        public getProfitLossByAdmin(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getprofitlossbyadmin', data, { timeout: this.baseService.longTime });
        }
        public getProfitLossByUser(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getprofitlossbyuser', data, { timeout: this.baseService.longTime });
        }
        public getProfitLossByUserExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('fdstudio/getprofitlossbyuserexport', data, { timeout: this.baseService.longTime });
        }
    }

    angular.module('intranet.services').service('fdService', FDService);
}