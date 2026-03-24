module intranet.services {

    export class DashboardService {
        constructor(private baseService: common.services.BaseService) {
        }


        public getBetSummary(): ng.IHttpPromise<any> {
            return this.baseService.get('dashboard/getbetsummary');
        }

        public getLiveBetSummary(): ng.IHttpPromise<any> {
            return this.baseService.get('dashboard/getlivebetsummary');
        }

        public getSummaryByEventype(eventtypeid: any): ng.IHttpPromise<any> {
            return this.baseService.get('dashboard/getlivegamesummary/' + eventtypeid);
        }

        public getTotalMarkets(): ng.IHttpPromise<any> {
            return this.baseService.get('dashboard/gettotalmarket');
        }

        public getUserSummary(): ng.IHttpPromise<any> {
            return this.baseService.get('dashboard/getusersummary');
        }

        public getLivebetTotal(): ng.IHttpPromise<any> {
            return this.baseService.get('dashboard/getlivebettotal');
        }

       

        public getRecentProfitloss(): ng.IHttpPromise<any> {
            return this.baseService.get('dashboard/getrecentprofitloss');
        }

        public getTopTableWisePL(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('dashboard/gettoptablewisepl', data);
        }
        public getTopUserWisePL(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('dashboard/gettopuserwisepl', data);
        }

    }

    angular.module('intranet.services').service('dashboardService', DashboardService);
}