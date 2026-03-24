module intranet.services {

    export class CommissionService {
        constructor(private baseService: common.services.BaseService) {
        }

        public setFullCommission(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('commission/setfullcommission', data);
        }

        public getcommission(userId: any): ng.IHttpPromise<any> {
            return this.baseService.get('commission/getcommission/' + userId);
        }

        public setCommission(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('commission/setcommission', data);
        }

    }

    angular.module('intranet.services').service('commissionService', CommissionService);
}