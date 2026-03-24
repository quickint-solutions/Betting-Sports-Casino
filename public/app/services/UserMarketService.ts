namespace intranet.services {
    export class UserMarketService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }
        public getMarketList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('usermarket', data);
        }

        public updateUserMarketParams(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('usermarket/updateusermarket', data);
        }
       
    }
    angular.module('intranet.services').service('userMarketService', UserMarketService);
}