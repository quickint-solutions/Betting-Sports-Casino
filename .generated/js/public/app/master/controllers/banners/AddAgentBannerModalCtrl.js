var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class AddAgentBannerModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $uibModalInstance, websiteService, commonDataService, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$uibModalInstance = $uibModalInstance;
                this.websiteService = websiteService;
                this.commonDataService = commonDataService;
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
                    this.saveBanner();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
            }
            showReceipt() {
                this.commonDataService.showReceiptModal(this.$scope, this.$scope.data.imageContent);
            }
            saveBanner() {
                var promise;
                var model = {};
                angular.copy(this.$scope.data, model);
                model.isActive = true;
                promise = this.websiteService.addAgentBanner(model);
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
        master.AddAgentBannerModalCtrl = AddAgentBannerModalCtrl;
        angular.module('intranet.master').controller('addAgentBannerModalCtrl', AddAgentBannerModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddAgentBannerModalCtrl.js.map