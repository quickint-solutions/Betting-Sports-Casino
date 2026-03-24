var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddCurrencyModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, currencyService, toasterService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.currencyService = currencyService;
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
                    promise = this.currencyService.updateCurrency(this.$scope.data);
                }
                else {
                    promise = this.currencyService.addCurrency(this.$scope.data);
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
        admin.AddCurrencyModalCtrl = AddCurrencyModalCtrl;
        angular.module('intranet.admin').controller('addCurrencyModalCtrl', AddCurrencyModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddCurrencyModalCtrl.js.map