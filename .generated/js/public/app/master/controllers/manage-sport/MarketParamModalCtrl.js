var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class MarketParamModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, userMarketService, toasterService, $uibModalInstance, modalOptions) {
                super($scope);
                this.userMarketService = userMarketService;
                this.toasterService = toasterService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.userMarketList = [];
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.market = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.updateMarketParam();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                var types = intranet.common.enums.UserMarketStatus;
                this.$scope.userMarketList = intranet.common.helpers.Utility.enumToArray(types);
            }
            updateMarketParam() {
                this.userMarketService.updateUserMarketParams(this.$scope.market)
                    .success((response) => {
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
        master.MarketParamModalCtrl = MarketParamModalCtrl;
        angular.module('intranet.master').controller('marketParamModalCtrl', MarketParamModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MarketParamModalCtrl.js.map