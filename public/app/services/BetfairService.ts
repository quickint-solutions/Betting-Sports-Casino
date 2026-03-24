namespace intranet.services {
    export class BetfairService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public getBetfairAccountList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('betfair', data);
        }
        public addBetfairAccount(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('betfair/addbetfairaccount', data);
        }
        public updateBetfairAccount(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('betfair/updatebetfairaccount', data);
        }
        public deleteBetfairAccount(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('betfair/deletebetfairaccount/' + id);
        }

        public getEventType(): ng.IHttpPromise<any> {
            return this.baseService.get('betfair/geteventtype');
        }
        public getTreeServiceData(servicename: string, parenid: any): ng.IHttpPromise<any> {
            return this.baseService.get('betfair/' + servicename + '/' + parenid);
        }
        public startBot(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('betfair/startbot', data);
        }
        public getActiveBot(): ng.IHttpPromise<any> {
            return this.baseService.get('betfair/getactivebot');
        }

    }

    angular.module('intranet.services').service('betfairService', BetfairService);

}