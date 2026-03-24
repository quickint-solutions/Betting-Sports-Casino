var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MyWalletCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService, localStorageHelper, paymentService, commonDataService, toasterService, modalService, $filter, $base64, settings) {
                super($scope);
                this.accountService = accountService;
                this.localStorageHelper = localStorageHelper;
                this.paymentService = paymentService;
                this.commonDataService = commonDataService;
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.$filter = $filter;
                this.$base64 = $base64;
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
        }
        home.MyWalletCtrl = MyWalletCtrl;
        angular.module('intranet.home').controller('myWalletCtrl', MyWalletCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MyWalletCtrl.js.map