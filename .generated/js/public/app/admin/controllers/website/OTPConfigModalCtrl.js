var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class OTPConfigModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, websiteService, toasterService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.websiteService = websiteService;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
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
                    this.saveOtpConfigData();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
            }
            saveOtpConfigData() {
                var promise;
                promise = this.websiteService.updateOTPConfig(this.$scope.data);
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
        admin.OTPConfigModalCtrl = OTPConfigModalCtrl;
        angular.module('intranet.admin').controller('otpConfigModalCtrl', OTPConfigModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=OTPConfigModalCtrl.js.map