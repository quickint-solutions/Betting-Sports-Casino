var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class ConfirmBetCtrl extends intranet.common.ControllerBase {
                constructor($scope, $uibModalInstance, modalOptions) {
                    super($scope);
                    this.$uibModalInstance = $uibModalInstance;
                    this.modalOptions = modalOptions;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.modalOptions = this.modalOptions;
                    if (this.modalOptions.data) {
                        this.$scope.bet = this.modalOptions.data;
                    }
                    this.$scope.modalOptions.ok = result => {
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    };
                    this.$scope.modalOptions.close = result => {
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
                    };
                }
            }
            directives.ConfirmBetCtrl = ConfirmBetCtrl;
            angular.module('kt.components').controller('confirmBetCtrl', ConfirmBetCtrl);
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=confirm-bet-controller.js.map