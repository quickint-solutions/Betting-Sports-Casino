var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class CurrencyService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getCurrencyList(data) {
                return this.baseService.post('currency', data);
            }
            getCurrencies() {
                return this.baseService.get('currency/getcurrencylist');
            }
            addCurrency(data) {
                return this.baseService.post('currency/addcurrency', data);
            }
            updateCurrency(data) {
                return this.baseService.post('currency/updatecurrency', data);
            }
        }
        services.CurrencyService = CurrencyService;
        angular.module('intranet.services').service('currencyService', CurrencyService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CurrencyService.js.map