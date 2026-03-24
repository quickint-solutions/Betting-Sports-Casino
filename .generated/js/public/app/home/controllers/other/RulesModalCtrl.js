var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class RulesModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, $uibModalInstance, modalOptions) {
                super($scope);
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.market = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
        }
        home.RulesModalCtrl = RulesModalCtrl;
        angular.module('intranet.home').controller('rulesModalCtrl', RulesModalCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=RulesModalCtrl.js.map