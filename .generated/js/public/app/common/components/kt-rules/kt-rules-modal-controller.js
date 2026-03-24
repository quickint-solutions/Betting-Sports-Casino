var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTRulesModalCtrl extends common.ControllerBase {
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
                    this.$scope.modalOptions.ok = result => ({ data: null, button: common.services.ModalResult.Cancel });
                    this.$scope.modalOptions.close = result => {
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
                    };
                }
            }
            directives.KTRulesModalCtrl = KTRulesModalCtrl;
            angular.module('kt.components').controller('ktRulesModalCtrl', KTRulesModalCtrl);
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=kt-rules-modal-controller.js.map