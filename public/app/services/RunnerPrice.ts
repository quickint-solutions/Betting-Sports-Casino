namespace intranet.services {
    export class RunnerPriceService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }
        public getRunnerList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('defaultprice', data);
        }

        public addRunnerPrice(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('defaultprice/adddefaultprice', data);
        }
        public updateRunnerPrice(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('defaultprice/updatedefaultprice', data);
        }
        public deleteRunnerPrice(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('defaultprice/deletedefaultprice/' + id);
        }
    }
    angular.module('intranet.services').service('runnerPriceService', RunnerPriceService);
}