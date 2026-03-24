module intranet.home {
    export interface IRecentPayInOutModalScope extends intranet.common.IScopeBase {
        modalOptions: any;


        forDeposit: boolean;
        forCryptoDeposit: boolean;
        forPaymorDeposit: boolean;
        forYuvapayDeposit: boolean;
        forOnRampDeposit: boolean;

        forOnRampWithdrawal: boolean;
        forWithdrawal: boolean;
        forPaymorWithdrawal: boolean;

        depositRequestType: any;//1=other,2=pinwallet

        requestList: any[];
    }

    export class RecentPayInOutModalCtrl extends intranet.common.ControllerBase<IRecentPayInOutModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IRecentPayInOutModalScope,
            private accountService: services.AccountService,
            private $uibModalInstance,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            this.loadRequests();
        }

        private getDetailType(d: any) { return common.enums.DepositOptinos[d]; }

        private getPayInStatus(d: any) { return common.enums.OffPayStatus[d]; }

        private getPayOutStatus(d: any) { return common.enums.FairXPayOutStatus[d]; }

        private getPaymorPayOutStatus(d: any) { return common.enums.PaymorPayoutStatus[d]; }

        private getReceiptImage(request: any, forQR: boolean = false) {
            if (forQR) {
                this.commonDataService.showReceiptModal(this.$scope, request, true);
            } else {
                this.accountService.getPayInOutSlip(request.imageId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.commonDataService.showReceiptModal(this.$scope, response.data);
                        }
                    });
            }
        }

        private loadRequests() {

            var promise: any;
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
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.requestList = response.data;
                    }
                });
            }
        }

        private copyTxt(t: any) {
            this.commonDataService.copyText(t);
            this.toasterService.showToast(common.helpers.ToastType.Info, "Copied", 2000);
        }

        private cancelWithdrawalRequest(id: any) {
            this.accountService.cancelOfflineWIthdrawal(id)
                .success((response: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(response.messages);
                    if (response.success) { this.loadRequests(); }
                });
        }

    }

    angular.module('intranet.home').controller('recentPayInOutModalCtrl', RecentPayInOutModalCtrl);
}