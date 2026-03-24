module intranet.services {

    export class MarketRuleService {
        constructor(private baseService: common.services.BaseService) {
        }

        public getMarketRulesList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('marketrule', data);
        }

        public getMarketRules(): ng.IHttpPromise<any> {
            return this.baseService.get('marketrule/getmarketrule');
        }

        public addMarketRule(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('marketrule/addmarketrule', data);
        }

        public updateMarketRule(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('marketrule/updatemarketrule', data);
        }

        public deleteMarketRule(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketrule/deletemarketrule/' + id);
        }

        public getMarketRulebyId(marketruleid: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketrule/getmarketrulebyid/' + marketruleid);
        }
    }

    angular.module('intranet.services').service('marketRuleService', MarketRuleService);
}