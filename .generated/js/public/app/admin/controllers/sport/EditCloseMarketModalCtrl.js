var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class EditCloseMarketModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, marketService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.marketService = marketService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.market = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveEventTypeDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
            }
            saveEventTypeDetail() {
                var promise;
                if (this.$scope.market.id) {
                    promise = this.marketService.updateSettleMarket(this.$scope.market);
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
        }
        admin.EditCloseMarketModalCtrl = EditCloseMarketModalCtrl;
        angular.module('intranet.admin').controller('editCloseMarketModalCtrl', EditCloseMarketModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EditCloseMarketModalCtrl.js.map