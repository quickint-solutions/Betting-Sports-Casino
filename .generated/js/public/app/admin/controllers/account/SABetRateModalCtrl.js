var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SABetRateModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, commonDataService, betService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.betService = betService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.bet = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.save();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            save() {
                var item = {};
                item.password = this.$scope.bet.password;
                item.betId = this.$scope.bet.id;
                item.price = this.$scope.bet.price;
                item.side = this.$scope.bet.side;
                item.betDetails = this.$scope.bet.betDetails;
                var promise;
                promise = this.betService.editRate(item);
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
        admin.SABetRateModalCtrl = SABetRateModalCtrl;
        angular.module('intranet.admin').controller('sABetRateModalCtrl', SABetRateModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SABetRateModalCtrl.js.map