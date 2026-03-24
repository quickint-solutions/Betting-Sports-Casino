var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class MarketService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getMarketList(data) {
                return this.baseService.post('market', data);
            }
            addMarket(data) {
                return this.baseService.post('market/addmarket', data);
            }
            updateMarket(data) {
                return this.baseService.post('market/updatemarket', data);
            }
            deleteMarket(marketId) {
                return this.baseService.get('market/deletemarket/' + marketId);
            }
            getMarketType() {
                return this.baseService.get('market/getallmarkettype');
            }
            changeInPlay(id, inplay) {
                return this.baseService.get('market/changeinplay/' + id + '/' + inplay);
            }
            changeStatus(id, status) {
                return this.baseService.get('market/changestatus/' + id + '/' + status);
            }
            changeSyncData(id, syncData) {
                return this.baseService.get('market/changesyncdata/' + id + '/' + syncData);
            }
            changeTemporaryStatus(id, status) {
                return this.baseService.get('market/changetemporarystatus/' + id + '/' + status);
            }
            closeMarket(data) {
                return this.baseService.post('market/closemarket', data);
            }
            recloseMarket(data) {
                return this.baseService.post('market/reclosemarket', data);
            }
            searchMarket(data) {
                return this.baseService.post('market/searchmarket', data);
            }
            searchMarketByEventName(eventname) {
                return this.baseService.get('market/getmarketbyeventname/' + eventname);
            }
            getMarketByEventId(eventId) {
                return this.baseService.get('market/getmarketbyeventid/' + eventId);
            }
            changeMarketParams(data) {
                return this.baseService.post('market/changemarketparam', data);
            }
            getRecentClose(eventTypeIds = []) {
                return this.baseService.get('market/getrecentclose/' + eventTypeIds.join(','));
            }
            getRecentCloseByEvent(eventId, count = 15) {
                return this.baseService.get('market/getrecentclosebyevent/' + eventId + '/' + count);
            }
            getLiveGameMultiplier() {
                return this.baseService.get('market/getlivegamemultiplier');
            }
            setNotification(data) {
                return this.baseService.post('market/setnotification', data);
            }
            changeMultiTempStatus(data) {
                return this.baseService.post('market/changemultits', data);
            }
            changeMultiMarketStatus(data) {
                return this.baseService.post('market/changemultistatus', data);
            }
            getMarketTypeMapping(data) {
                return this.baseService.post('market/getmarkettypemapping', data);
            }
            getAllMarketTypeMapping() {
                return this.baseService.get('market/getAllmarkettypemapping');
            }
            addMarketTypeMapping(data) {
                return this.baseService.post('market/addmarkettypemapping', data);
            }
            updateMarketTypeMapping(data) {
                return this.baseService.post('market/updatemarkettypemapping', data);
            }
            updateSettleMarket(data) {
                return this.baseService.post('market/updatesettlemarket', data);
            }
        }
        services.MarketService = MarketService;
        angular.module('intranet.services').service('marketService', MarketService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MarketService.js.map