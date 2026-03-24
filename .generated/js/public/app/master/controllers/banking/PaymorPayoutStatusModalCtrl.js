var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class PaymorPayoutStatusModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, accountService, commonDataService, $timeout, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.$timeout = $timeout;
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
                this.$scope.payoutList = [];
                this.$scope.payoutList.push({ id: '1', name: 'Process' });
                this.$scope.payoutList.push({ id: '0', name: 'Reject' });
                this.$scope.item.oldstatus = this.$scope.item.status.toString();
                this.$scope.item.status = '1';
                this.$scope.modalOptions.ok = result => {
                    this.transferBalance();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            getStatus(s) {
                return intranet.common.enums.PaymorPayoutStatus[s];
            }
            transferBalance() {
                var promise;
                var model = {
                    orderid: this.$scope.item.id,
                    status: this.$scope.item.status == '1' ? true : false,
                    note: this.$scope.item.comment,
                };
                promise = this.accountService.processPaymorPayout(model);
                if (promise) {
                    this.commonDataService.addPromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.$rootScope.$emit('dw-status-changed');
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                        else {
                            this.$scope.messages = response.messages;
                        }
                    });
                }
            }
            showReceipt() {
                this.commonDataService.showReceiptModal(this.$scope, this.$scope.item.payOutSlip);
            }
        }
        master.PaymorPayoutStatusModalCtrl = PaymorPayoutStatusModalCtrl;
        angular.module('intranet.master').controller('paymorPayoutStatusModalCtrl', PaymorPayoutStatusModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PaymorPayoutStatusModalCtrl.js.map