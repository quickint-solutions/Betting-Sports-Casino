var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class AgentOfferLogCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, offerService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.offerService = offerService;
                super.init(this);
            }
            initScopeValues() { }
            loadInitialData() { }
            getItems(params, filters) {
                var model = { params: params, filters: filters, id: this.$stateParams.id };
                return this.offerService.getAgentOfferLog(model);
            }
        }
        master.AgentOfferLogCtrl = AgentOfferLogCtrl;
        angular.module('intranet.master').controller('agentOfferLogCtrl', AgentOfferLogCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AgentOfferLogsCtrl.js.map