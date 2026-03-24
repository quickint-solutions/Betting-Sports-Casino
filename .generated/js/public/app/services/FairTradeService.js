var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class FairTradeService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            launchFairTrade() {
                return this.baseService.get('fairtrade/launchfairtrade');
            }
        }
        services.FairTradeService = FairTradeService;
        angular.module('intranet.services').service('fairTradeService', FairTradeService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FairTradeService.js.map