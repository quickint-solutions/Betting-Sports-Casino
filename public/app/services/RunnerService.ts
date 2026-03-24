namespace intranet.services {
    export class RunnerService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }
        public getRunnerList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('runner', data);
        }
        public searchRunner(search: any): intranet.common.services.IHttpPromiseWithCancel<any> {
            return this.baseService.postWithCancel('runner/searchrunner', search);
        }
        public addRunner(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('runner/addrunner', data);
        }
        public updateRunner(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('runner/updaterunner', data);
        }
    }
    angular.module('intranet.services').service('runnerService', RunnerService);
}