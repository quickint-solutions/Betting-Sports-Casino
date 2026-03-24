var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class AddDepositOptionModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, paymentService, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.paymentService = paymentService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.item = this.modalOptions.data;
                }
                var dOption = intranet.common.enums.DepositOptinos;
                this.$scope.depositOptions = intranet.common.helpers.Utility.enumToArray(dOption);
                if (!this.$scope.item.detailType) {
                    this.$scope.item.detailType = this.$scope.depositOptions[0].id.toString();
                }
                else {
                    this.$scope.item.detailType = this.$scope.item.detailType.toString();
                }
                this.$scope.item.minDeposit = this.$filter('toRateOnly')(this.$scope.item.minDeposit);
                this.$scope.item.maxDeposit = this.$filter('toRateOnly')(this.$scope.item.maxDeposit);
                this.$scope.modalOptions.ok = result => {
                    this.saveDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            getOptionsName(d) { return intranet.common.enums.DepositOptinos[d]; }
            saveDetail() {
                var promise;
                this.$scope.item.minDeposit = this.$filter('toGLC')(this.$scope.item.minDeposit);
                this.$scope.item.maxDeposit = this.$filter('toGLC')(this.$scope.item.maxDeposit);
                if (this.$scope.item.id) {
                    promise = this.paymentService.updateBankDetails(this.$scope.item);
                }
                else {
                    promise = this.paymentService.addBankDetails(this.$scope.item);
                }
                if (promise) {
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
        master.AddDepositOptionModalCtrl = AddDepositOptionModalCtrl;
        angular.module('intranet.master').controller('addDepositOptionModalCtrl', AddDepositOptionModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddDepositOptionModalCtrl.js.map