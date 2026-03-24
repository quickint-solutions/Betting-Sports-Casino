var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ViewSystemLogModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, $uibModalInstance, modalOptions) {
                super($scope);
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.data = {};
                if (this.modalOptions.data) {
                    this.$scope.data = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            getLogLevel(level) {
                return intranet.common.enums.LogLevel[level];
            }
        }
        admin.ViewSystemLogModalCtrl = ViewSystemLogModalCtrl;
        angular.module('intranet.admin').controller('viewSystemLogModalCtrl', ViewSystemLogModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ViewSystemLogModalCtrl.js.map