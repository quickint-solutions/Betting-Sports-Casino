module intranet.services {

    export class FairTradeService {
        constructor(private baseService: common.services.BaseService) {
        }
       
        public launchFairTrade(): ng.IHttpPromise<any> {
            return this.baseService.get('fairtrade/launchfairtrade');
        }
    }

    angular.module('intranet.services').service('fairTradeService', FairTradeService);
}