var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddMarketRuleModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $uibModalInstance, marketRuleService, commonDataService, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$uibModalInstance = $uibModalInstance;
                this.marketRuleService = marketRuleService;
                this.commonDataService = commonDataService;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.rule = {};
                if (this.modalOptions.data) {
                    this.$scope.rule = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveRule();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveRule() {
                var promise;
                if (this.$scope.rule.id) {
                    promise = this.marketRuleService.updateMarketRule(this.$scope.rule);
                }
                else {
                    promise = this.marketRuleService.addMarketRule(this.$scope.rule);
                }
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
        admin.AddMarketRuleModalCtrl = AddMarketRuleModalCtrl;
        angular.module('intranet.admin').controller('addMarketRuleModalCtrl', AddMarketRuleModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddMarketRuleModalCtrl.js.map