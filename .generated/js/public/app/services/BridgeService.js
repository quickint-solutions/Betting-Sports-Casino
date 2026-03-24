var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class BridgeService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getEventTypes() {
                return this.baseService.get('bridge/geteventtype');
            }
            getEventList(data) {
                return this.baseService.post('bridge/getevent', data);
            }
            getCompetitionList(data) {
                return this.baseService.post('bridge/getcompetition', data);
            }
            getMarketList(data) {
                return this.baseService.post('bridge/getmarket', data);
            }
            getTreeServiceData(servicename, parenid) {
                return this.baseService.get('bridge/' + servicename + '/' + parenid);
            }
            startBot(data) {
                return this.baseService.post('bridge/startbot', data);
            }
        }
        services.BridgeService = BridgeService;
        angular.module('intranet.services').service('bridgeService', BridgeService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BridgeService.js.map