module intranet.mobile.account {
    export interface IMobileMyWalletScope extends intranet.common.IScopeBase {
        balanceInfo: any;
        userid: any;

        depositRequest: any;
        withdrawalRequest: any;

        selectedPaymentTab: any;
        spinnerImg: any;
        showDLoading: boolean;
        showWLoading: boolean;

        supportDetail: any;
    }

    export class MobileMyWalletCtrl extends intranet.common.ControllerBase<IMobileMyWalletScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileMyWalletScope,
            private accountService: services.AccountService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private paymentService: services.PaymentService,
            private commonDataService: common.services.CommonDataService,
            private toasterService: common.services.ToasterService,
            private modalService: common.services.ModalService,
            private $base64: any,
            private $filter: any,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.selectedPaymentTab = 0;
            this.$scope.depositRequest = {};
            this.$scope.withdrawalRequest = {};
            this.$scope.spinnerImg = this.commonDataService.spinnerImg;
            this.$scope.showDLoading = false;
            this.$scope.showWLoading = false;
            this.$scope.supportDetail = {};
        }

        public loadInitialData(): void {
            //this.loadWebsiteData();
            this.getUserId();
            //this.getBalance();
            //this.getNumber();
            //this.availableToWithdraw();
        }

        private loadWebsiteData(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                            if (this.$scope.supportDetail.vimeo) {
                                this.$scope.supportDetail.BankDetail = JSON.parse(this.$base64.decode(this.$scope.supportDetail.vimeo));
                            }
                        }
                    }
                });
        }

        private getUserId(): void {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                this.$scope.userid = result.id;
            }
        }

        private getBalance(): void {
            this.accountService.getBalance()
                .success((res: common.messaging.IResponse<any>) => {
                    if (res.success) {
                        this.$scope.balanceInfo = res.data;
                    }
                });
        }

        private getAccountStatement(params: any): any {
            var searchQuery: any = {
                //accountType: common.enums.AccountType.Chips,
                fromDate: common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                toDate: common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
            };
            return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }


        private paytmDeposit(): void {
            this.$scope.showDLoading = true;
            this.paymentService.paytmDeposit(this.$scope.depositRequest)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$scope.depositRequest.transactionId = '';
                    } else {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                }).finally(() => { this.$scope.showDLoading = false; });
        }

        private availableToWithdraw(): void {
            this.paymentService.availableToWithdraw()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.withdrawalRequest.amount = this.$filter('toRateOnly')(response.data.withdrawalAmount);
                        this.$scope.withdrawalRequest.minAmount = response.data.withdrawalLimit;
                    }
                });
        }

        private paytmWithdraw(): void {
            this.$scope.showWLoading = true;
            this.paymentService.paytmWithdrawal(this.$scope.withdrawalRequest)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showToast(common.helpers.ToastType.Success, "Payment Withdrawal Request Registered Successfully", 3000);
                        this.$scope.withdrawalRequest = {};
                    } else {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                }).finally(() => { this.$scope.showWLoading = false; });
        }

        private showWithdrawalHistory(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'withdrawal.history.modal.header';
            modal.bodyUrl = this.settings.ThemeName + '/mobile/account/withdrawal-history-modal.html';
            modal.controller = 'withdrawalHistoryModalCtrl';
            modal.size = "lg";
            modal.options.actionButton = '';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }
    }
    angular.module('intranet.mobile.account').controller('mobileMyWalletCtrl', MobileMyWalletCtrl);
}