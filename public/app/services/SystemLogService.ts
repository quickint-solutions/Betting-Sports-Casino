namespace intranet.services {
    export class SystemLogService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public getLogList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('logger', data);
        }

        public clearLog(): ng.IHttpPromise<any> {
            return this.baseService.get('logger/clearlog' );
        }
        
    }

    angular.module('intranet.services').service('systemLogService', SystemLogService);

}