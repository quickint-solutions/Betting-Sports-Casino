var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class PayoutStatusModalCtrl extends intranet.common.ControllerBase {
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
                    this.$scope.isPinWalletEnabled = this.modalOptions.data.isPinWalletEnabled;
                }
                var gameType = intranet.common.enums.FairXPayOutStatus;
                this.$scope.fairxpayoutList = intranet.common.helpers.Utility.enumToArray(gameType);
                this.$scope.item.status = this.$scope.item.status.toString();
                this.$scope.item.oldstatus = this.$scope.item.status.toString();
                this.$scope.modalOptions.ok = result => {
                    this.transferBalance();
                };
                this.$scope.modalOptions.close = result => {
                    if (this.$scope.pinWalletTried) {
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                    }
                    else {
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                    }
                };
            }
            getStatus(s) {
                return intranet.common.enums.FairXPayOutStatus[s];
            }
            transferBalance() {
                var promise;
                var model = {
                    id: this.$scope.item.id,
                    status: this.$scope.item.status,
                    comment: this.$scope.item.comment,
                    payOutSlip: this.$scope.item.payOutSlip
                };
                promise = this.accountService.changeOffPayoutRequestStatus(model);
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
            processWithdrawalByPinWallet() {
                this.$scope.isLoading = true;
                this.accountService.processPinWalletWithdrawal(this.$scope.item)
                    .success((response) => {
                    if (response.success) {
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'Withdrawal request sent to PinWallet, Popup will close in 5 second.', 5000);
                        this.$timeout(() => {
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }, 5000);
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                }).finally(() => { this.$scope.isLoading = false; this.$scope.pinWalletTried = true; });
            }
        }
        master.PayoutStatusModalCtrl = PayoutStatusModalCtrl;
        angular.module('intranet.master').controller('payoutStatusModalCtrl', PayoutStatusModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PayoutStatusModalCtrl.js.map