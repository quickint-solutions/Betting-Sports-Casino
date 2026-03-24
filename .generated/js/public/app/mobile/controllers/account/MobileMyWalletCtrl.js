var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        var account;
        (function (account) {
            class MobileMyWalletCtrl extends intranet.common.ControllerBase {
                constructor($scope, accountService, localStorageHelper, paymentService, commonDataService, toasterService, modalService, $base64, $filter, settings) {
                    super($scope);
                    this.accountService = accountService;
                    this.localStorageHelper = localStorageHelper;
                    this.paymentService = paymentService;
                    this.commonDataService = commonDataService;
                    this.toasterService = toasterService;
                    this.modalService = modalService;
                    this.$base64 = $base64;
                    this.$filter = $filter;
                    this.settings = settings;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.selectedPaymentTab = 0;
                    this.$scope.depositRequest = {};
                    this.$scope.withdrawalRequest = {};
                    this.$scope.spinnerImg = this.commonDataService.spinnerImg;
                    this.$scope.showDLoading = false;
                    this.$scope.showWLoading = false;
                    this.$scope.supportDetail = {};
                }
                loadInitialData() {
                    this.getUserId();
                }
                loadWebsiteData() {
                    this.commonDataService.getSupportDetails()
                        .then((data) => {
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
                getUserId() {
                    var result = this.commonDataService.getLoggedInUserData();
                    if (result) {
                        this.$scope.userid = result.id;
                    }
                }
                getBalance() {
                    this.accountService.getBalance()
                        .success((res) => {
                        if (res.success) {
                            this.$scope.balanceInfo = res.data;
                        }
                    });
                }
                getAccountStatement(params) {
                    var searchQuery = {
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                        toDate: intranet.common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
                    };
                    return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
                }
                paytmDeposit() {
                    this.$scope.showDLoading = true;
                    this.paymentService.paytmDeposit(this.$scope.depositRequest)
                        .success((response) => {
                        if (response.success) {
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$scope.depositRequest.transactionId = '';
                        }
                        else {
                            this.toasterService.showMessages(response.messages, 3000);
                        }
                    }).finally(() => { this.$scope.showDLoading = false; });
                }
                availableToWithdraw() {
                    this.paymentService.availableToWithdraw()
                        .success((response) => {
                        if (response.success && response.data) {
                            this.$scope.withdrawalRequest.amount = this.$filter('toRateOnly')(response.data.withdrawalAmount);
                            this.$scope.withdrawalRequest.minAmount = response.data.withdrawalLimit;
                        }
                    });
                }
                paytmWithdraw() {
                    this.$scope.showWLoading = true;
                    this.paymentService.paytmWithdrawal(this.$scope.withdrawalRequest)
                        .success((response) => {
                        if (response.success) {
                            this.toasterService.showToast(intranet.common.helpers.ToastType.Success, "Payment Withdrawal Request Registered Successfully", 3000);
                            this.$scope.withdrawalRequest = {};
                        }
                        else {
                            this.toasterService.showMessages(response.messages, 3000);
                        }
                    }).finally(() => { this.$scope.showWLoading = false; });
                }
                showWithdrawalHistory() {
                    var modal = new intranet.common.helpers.CreateModal();
                    modal.header = 'withdrawal.history.modal.header';
                    modal.bodyUrl = this.settings.ThemeName + '/mobile/account/withdrawal-history-modal.html';
                    modal.controller = 'withdrawalHistoryModalCtrl';
                    modal.size = "lg";
                    modal.options.actionButton = '';
                    modal.SetModal();
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults);
                }
            }
            account.MobileMyWalletCtrl = MobileMyWalletCtrl;
            angular.module('intranet.mobile.account').controller('mobileMyWalletCtrl', MobileMyWalletCtrl);
        })(account = mobile.account || (mobile.account = {}));
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileMyWalletCtrl.js.map