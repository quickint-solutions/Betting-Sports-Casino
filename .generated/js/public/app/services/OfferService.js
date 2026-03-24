var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class OfferService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getOffers(data) {
                return this.baseService.post('offer/getoffers', data);
            }
            addOffer(data) {
                return this.baseService.post('offer/addoffer', data);
            }
            updateOffer(data) {
                return this.baseService.post('offer/updateoffer', data);
            }
            deleteOffer(id) {
                return this.baseService.get('offer/deleteoffer/' + id);
            }
            getOfferLog(data) {
                return this.baseService.post('offer/getofferlog', data);
            }
            getOfferList() {
                return this.baseService.get('offer/getofferlist');
            }
            getDepositOfferList() {
                return this.baseService.get('offer/getdepositofferlist');
            }
            getAgentOffers(data) {
                return this.baseService.post('offer/getagentoffers', data);
            }
            addAgentOffer(data) {
                return this.baseService.post('offer/addagentoffer', data);
            }
            updateAgentOffer(data) {
                return this.baseService.post('offer/updateagentoffer', data);
            }
            deleteAgentOffer(id) {
                return this.baseService.get('offer/deleteagentoffer/' + id);
            }
            getAgentOfferLog(data) {
                return this.baseService.post('offer/getagentofferlog', data);
            }
        }
        services.OfferService = OfferService;
        angular.module('intranet.services').service('offerService', OfferService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=OfferService.js.map