module intranet.services {

    export class CurrencyService {
        constructor(private baseService: common.services.BaseService) {
        }

        public getCurrencyList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('currency', data);
        }

        public getCurrencies(): ng.IHttpPromise<any> {
            return this.baseService.get('currency/getcurrencylist');
        }

        public addCurrency(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('currency/addcurrency', data);
        }

        public updateCurrency(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('currency/updatecurrency', data);
        }

    }

    angular.module('intranet.services').service('currencyService', CurrencyService);
}