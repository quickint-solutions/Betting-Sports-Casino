namespace intranet.services {
    export class OfferService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }
        public getOffers(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('offer/getoffers', data);
        }
        public addOffer(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('offer/addoffer', data);
        }
        public updateOffer(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('offer/updateoffer', data);
        }
        public deleteOffer(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('offer/deleteoffer/' + id);
        }
        public getOfferLog(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('offer/getofferlog', data);
        }

        public getOfferList(): ng.IHttpPromise<any> {
            return this.baseService.get('offer/getofferlist');
        }
        public getDepositOfferList(): ng.IHttpPromise<any> {
            return this.baseService.get('offer/getdepositofferlist');
        }

       

        public getAgentOffers(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('offer/getagentoffers', data);
        }
        public addAgentOffer(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('offer/addagentoffer', data);
        }
        public updateAgentOffer(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('offer/updateagentoffer', data);
        }
        public deleteAgentOffer(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('offer/deleteagentoffer/' + id);
        }
        public getAgentOfferLog(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('offer/getagentofferlog', data);
        }
       
    }
    angular.module('intranet.services').service('offerService', OfferService);
}