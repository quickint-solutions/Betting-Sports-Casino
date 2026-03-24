var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class ReferralStatementCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, commonDataService, toasterService, accountService, userService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.commonDataService = commonDataService;
                this.toasterService = toasterService;
                this.accountService = accountService;
                this.userService = userService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    viewType: '1'
                };
                this.setDates(-3, 'M');
                this.$scope.referralObj = {};
                this.$scope.canILoad = false;
                this.$scope.viewTypeList = [];
            }
            loadInitialData() {
                this.$scope.viewTypeList.push({ id: 1, name: 'Get Referral Users' });
                this.$scope.viewTypeList.push({ id: 2, name: 'Get Referral Statement' });
                this.getUserId();
            }
            refreshGrid() {
                if (this.$scope.search.viewType == 1) {
                    this.getMyReferrals();
                }
                else {
                    this.$scope.viewType = 2;
                    this.$scope.canILoad = true;
                    this.$scope.$broadcast('refreshGrid');
                }
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.refreshGrid();
            }
            getUserId() {
                if (this.$stateParams.memberid) {
                    this.$scope.userid = this.$stateParams.memberid;
                }
                else {
                    var result = this.commonDataService.getLoggedInUserData();
                    if (result) {
                        this.$scope.userid = result.id;
                    }
                }
                this.getReferralBalance();
                this.getReferralLink();
                this.getMyReferrals();
            }
            getReferralLink() {
                var baseUrl;
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    baseUrl = data.url + '#';
                    var uData = this.commonDataService.getLoggedInUserData();
                    if (uData) {
                        var code = uData.referralCode;
                        this.$scope.referralObj.link = baseUrl + '?code=' + code;
                    }
                });
            }
            getMyReferrals() {
                this.$scope.viewType = 1;
                this.$scope.canILoad = false;
                var promise;
                if (this.$stateParams.memberid) {
                    promise = this.userService.getMyReferralMember(this.$stateParams.memberid);
                }
                else {
                    promise = this.userService.getMyReferral();
                }
                promise.success((response) => {
                    if (response.success) {
                        this.$scope.referralUsers = response.data;
                    }
                });
            }
            getReferralBalance() {
                this.accountService.getReferralBalance(this.$scope.userid)
                    .success((response) => {
                    if (response.success && response.data) {
                        this.$scope.referralObj.balance = response.data.referralBalance;
                        this.$scope.referralObj.minWithdrawalAmount = response.data.minWithdrawalAmount;
                        this.$scope.referralObj.minimumBalanceRequired = response.data.minimumBalanceRequired;
                    }
                });
            }
            showReferralStatement() {
            }
            getReferralStatement(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                return this.accountService.getReferralStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
            copytext(item) {
                this.commonDataService.copyText(item);
                this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Info, "Referral link Copied.", 2000);
            }
            withdrawBalance() {
                this.accountService.withdrawalReferralLedger()
                    .success((response) => {
                    this.toasterService.showMessages(response.messages);
                    if (response.success) {
                        this.getReferralBalance();
                        this.refreshGrid();
                    }
                });
            }
        }
        home.ReferralStatementCtrl = ReferralStatementCtrl;
        angular.module('intranet.home').controller('referralStatementCtrl', ReferralStatementCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ReferralStatementCtrl.js.map