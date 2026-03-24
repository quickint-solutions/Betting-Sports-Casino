module intranet.master {
    export interface IPayoutStatusModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        item: any;
        fairxpayoutList: any[];

        isPinWalletEnabled: boolean;
        isLoading: boolean;
        pinWalletTried: boolean;
    }

    export class PayoutStatusModalCtrl extends intranet.common.ControllerBase<IPayoutStatusModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IPayoutStatusModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private $timeout: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.item = this.modalOptions.data;
                this.$scope.isPinWalletEnabled = this.modalOptions.data.isPinWalletEnabled;
            }

            var gameType: any = common.enums.FairXPayOutStatus;
            this.$scope.fairxpayoutList = common.helpers.Utility.enumToArray<common.enums.FairXPayOutStatus>(gameType);
            this.$scope.item.status = this.$scope.item.status.toString();
            this.$scope.item.oldstatus = this.$scope.item.status.toString();

            this.$scope.modalOptions.ok = result => {
                this.transferBalance();
            };
            this.$scope.modalOptions.close = result => {
                if (this.$scope.pinWalletTried) {
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                } else {
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
                }
            };
        }

        private getStatus(s: any): any {
            return common.enums.FairXPayOutStatus[s];
        }

        private transferBalance(): void {
            var promise: ng.IHttpPromise<any>;
            var model = {
                id: this.$scope.item.id,
                status: this.$scope.item.status,
                comment: this.$scope.item.comment,
                payOutSlip: this.$scope.item.payOutSlip
            }
            promise = this.accountService.changeOffPayoutRequestStatus(model);
            if (promise) {
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$rootScope.$emit('dw-status-changed');
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }

        private showReceipt() {
            this.commonDataService.showReceiptModal(this.$scope, this.$scope.item.payOutSlip);
        }

        private processWithdrawalByPinWallet() {
            this.$scope.isLoading = true;
           
            this.accountService.processPinWalletWithdrawal(this.$scope.item)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showToast(common.helpers.ToastType.Success, 'Withdrawal request sent to PinWallet, Popup will close in 5 second.', 5000);
                        this.$timeout(() => {
                            this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                        }, 5000);
                    } else {
                        this.$scope.messages = response.messages;
                    }
                }).finally(() => { this.$scope.isLoading = false; this.$scope.pinWalletTried = true;});
        }
    }

    angular.module('intranet.master').controller('payoutStatusModalCtrl', PayoutStatusModalCtrl);
}