var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddSymbolModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, symbolService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.symbolService = symbolService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.symbol = {};
                if (this.modalOptions.data) {
                    this.$scope.symbol = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveRunner();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                var status = intranet.common.enums.Segment;
                this.$scope.segmentList = intranet.common.helpers.Utility.enumToArray(status);
                if (this.$scope.symbol.segment) {
                    this.$scope.symbol.segment = this.$scope.symbol.segment.toString();
                }
                else {
                    this.$scope.symbol.segment = this.$scope.segmentList[0].id.toString();
                }
            }
            saveRunner() {
                var promise;
                if (this.$scope.symbol.id) {
                    promise = this.symbolService.updateSymbol(this.$scope.symbol);
                }
                else {
                    promise = this.symbolService.addSymbol(this.$scope.symbol);
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
        admin.AddSymbolModalCtrl = AddSymbolModalCtrl;
        angular.module('intranet.admin').controller('addSymbolModalCtrl', AddSymbolModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddSymbolModalCtrl.js.map