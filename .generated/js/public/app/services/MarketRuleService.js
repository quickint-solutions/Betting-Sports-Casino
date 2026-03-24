var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class MarketRuleService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getMarketRulesList(data) {
                return this.baseService.post('marketrule', data);
            }
            getMarketRules() {
                return this.baseService.get('marketrule/getmarketrule');
            }
            addMarketRule(data) {
                return this.baseService.post('marketrule/addmarketrule', data);
            }
            updateMarketRule(data) {
                return this.baseService.post('marketrule/updatemarketrule', data);
            }
            deleteMarketRule(id) {
                return this.baseService.get('marketrule/deletemarketrule/' + id);
            }
            getMarketRulebyId(marketruleid) {
                return this.baseService.get('marketrule/getmarketrulebyid/' + marketruleid);
            }
        }
        services.MarketRuleService = MarketRuleService;
        angular.module('intranet.services').service('marketRuleService', MarketRuleService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MarketRuleService.js.map