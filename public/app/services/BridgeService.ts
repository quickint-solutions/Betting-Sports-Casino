namespace intranet.services {
    export class BridgeService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public getEventTypes(): ng.IHttpPromise<any> {
            return this.baseService.get('bridge/geteventtype');
        }

        public getEventList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bridge/getevent', data);
        }

        public getCompetitionList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bridge/getcompetition', data);
        }

        public getMarketList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bridge/getmarket', data);
        }
        public getTreeServiceData(servicename: string, parenid: any): ng.IHttpPromise<any> {
            return this.baseService.get('bridge/' + servicename + '/' + parenid);
        }

        public startBot(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bridge/startbot', data);
        }
       
    }

    angular.module('intranet.services').service('bridgeService', BridgeService);
}