var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddMarketTypeModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, marketService, toasterService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.marketService = marketService;
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
                    this.saveCurrencyData();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveCurrencyData() {
                var promise;
                if (this.$scope.data.id) {
                    promise = this.marketService.updateMarketTypeMapping(this.$scope.data);
                }
                else {
                    promise = this.marketService.addMarketTypeMapping(this.$scope.data);
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
        admin.AddMarketTypeModalCtrl = AddMarketTypeModalCtrl;
        angular.module('intranet.admin').controller('addMarketTypeModalCtrl', AddMarketTypeModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddMarketTypeModalCtrl.js.map