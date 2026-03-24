var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class BetfairService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getBetfairAccountList(data) {
                return this.baseService.post('betfair', data);
            }
            addBetfairAccount(data) {
                return this.baseService.post('betfair/addbetfairaccount', data);
            }
            updateBetfairAccount(data) {
                return this.baseService.post('betfair/updatebetfairaccount', data);
            }
            deleteBetfairAccount(id) {
                return this.baseService.get('betfair/deletebetfairaccount/' + id);
            }
            getEventType() {
                return this.baseService.get('betfair/geteventtype');
            }
            getTreeServiceData(servicename, parenid) {
                return this.baseService.get('betfair/' + servicename + '/' + parenid);
            }
            startBot(data) {
                return this.baseService.post('betfair/startbot', data);
            }
            getActiveBot() {
                return this.baseService.get('betfair/getactivebot');
            }
        }
        services.BetfairService = BetfairService;
        angular.module('intranet.services').service('betfairService', BetfairService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetfairService.js.map