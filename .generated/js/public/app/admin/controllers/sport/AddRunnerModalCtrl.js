var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddRunnerModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, runnerService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.runnerService = runnerService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.runner = {};
                if (this.modalOptions.data) {
                    this.$scope.runner = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveRunner();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveRunner() {
                var promise;
                if (this.$scope.runner.id) {
                    promise = this.runnerService.updateRunner(this.$scope.runner);
                }
                else {
                    promise = this.runnerService.addRunner(this.$scope.runner);
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
        admin.AddRunnerModalCtrl = AddRunnerModalCtrl;
        angular.module('intranet.admin').controller('addRunnerModalCtrl', AddRunnerModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddRunnerModalCtrl.js.map