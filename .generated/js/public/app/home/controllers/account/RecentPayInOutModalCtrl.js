var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class RecentPayInOutModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService, $uibModalInstance, toasterService, commonDataService, modalOptions) {
                super($scope);
                this.accountService = accountService;
                this.$uibModalInstance = $uibModalInstance;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.depositRequestType = 1;
                if (this.modalOptions.data) {
                    this.$scope.forDeposit = this.modalOptions.data.forDeposit;
                    this.$scope.forCryptoDeposit = this.modalOptions.data.forCryptoDeposit;
                    this.$scope.forPaymorDeposit = this.modalOptions.data.forPaymorDeposit;
                    this.$scope.forYuvapayDeposit = this.modalOptions.data.forYuvapayDeposit;
                    this.$scope.forOnRampDeposit = this.modalOptions.data.forOnRampDeposit;
                    this.$scope.forOnRampWithdrawal = this.modalOptions.data.forOnRampWithdrawal;
                    this.$scope.forWithdrawal = this.modalOptions.data.forWithdrawal;
                    this.$scope.forPaymorWithdrawal = this.modalOptions.data.forPaymorWithdrawal;
                }
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                this.loadRequests();
            }
            getDetailType(d) { return intranet.common.enums.DepositOptinos[d]; }
            getPayInStatus(d) { return intranet.common.enums.OffPayStatus[d]; }
            getPayOutStatus(d) { return intranet.common.enums.FairXPayOutStatus[d]; }
            getPaymorPayOutStatus(d) { return intranet.common.enums.PaymorPayoutStatus[d]; }
            getReceiptImage(request, forQR = false) {
                if (forQR) {
                    this.commonDataService.showReceiptModal(this.$scope, request, true);
                }
                else {
                    this.accountService.getPayInOutSlip(request.imageId)
                        .success((response) => {
                        if (response.success) {
                            this.commonDataService.showReceiptModal(this.$scope, response.data);
                        }
                    });
                }
            }
            loadRequests() {
                var promise;
                if (this.$scope.forDeposit) {
                    promise = this.accountService.getRecentOffPayIn();
                }
                if (this.$scope.forOnRampDeposit) {
                    promise = this.accountService.getOnRampPaymentIn();
                }
                if (this.$scope.forCryptoDeposit) {
                    promise = this.accountService.getRecentNowPaymentIn();
                }
                if (this.$scope.forPaymorDeposit) {
                    promise = this.accountService.getRecentPaymorPayin();
                }
                if (this.$scope.forOnRampWithdrawal) {
                    promise = this.accountService.getOnRampPaymentOut();
                }
                if (this.$scope.forWithdrawal) {
                    promise = this.accountService.getRecentOffPayOut();
                }
                if (this.$scope.forPaymorWithdrawal) {
                    promise = this.accountService.getRecentPaymorPayout();
                }
                if (promise) {
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.requestList = response.data;
                        }
                    });
                }
            }
            copyTxt(t) {
                this.commonDataService.copyText(t);
                this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Copied", 2000);
            }
            cancelWithdrawalRequest(id) {
                this.accountService.cancelOfflineWIthdrawal(id)
                    .success((response) => {
                    this.toasterService.showMessages(response.messages);
                    if (response.success) {
                        this.loadRequests();
                    }
                });
            }
        }
        home.RecentPayInOutModalCtrl = RecentPayInOutModalCtrl;
        angular.module('intranet.home').controller('recentPayInOutModalCtrl', RecentPayInOutModalCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=RecentPayInOutModalCtrl.js.map