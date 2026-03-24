module intranet.home {
    export interface IMyWalletScope extends intranet.common.IScopeBase {
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

    export class MyWalletCtrl extends intranet.common.ControllerBase<IMyWalletScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMyWalletScope,
            private accountService: services.AccountService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private paymentService: services.PaymentService,
            private commonDataService: common.services.CommonDataService,
            private toasterService: common.services.ToasterService,
            private modalService: common.services.ModalService,
            private $filter: any,
            private $base64: any,
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
            this.getUserId();
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
    }
    angular.module('intranet.home').controller('myWalletCtrl', MyWalletCtrl);
}