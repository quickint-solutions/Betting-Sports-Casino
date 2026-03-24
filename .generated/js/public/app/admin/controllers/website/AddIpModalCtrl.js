var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddIpModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $uibModalInstance, tokenService, commonDataService, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$uibModalInstance = $uibModalInstance;
                this.tokenService = tokenService;
                this.commonDataService = commonDataService;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.modalOptions.ok = result => {
                    this.saveIP();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveIP() {
                var promise;
                promise = this.tokenService.blockIP(this.$scope.ip);
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
        admin.AddIpModalCtrl = AddIpModalCtrl;
        angular.module('intranet.admin').controller('addIpModalCtrl', AddIpModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddIpModalCtrl.js.map