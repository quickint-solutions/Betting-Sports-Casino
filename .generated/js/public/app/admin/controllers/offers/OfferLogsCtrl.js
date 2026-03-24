var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class OfferLogCtrl extends intranet.common.ControllerBase {
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
                return this.offerService.getOfferLog(model);
            }
        }
        admin.OfferLogCtrl = OfferLogCtrl;
        angular.module('intranet.admin').controller('offerLogCtrl', OfferLogCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=OfferLogsCtrl.js.map