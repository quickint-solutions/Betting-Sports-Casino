var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class B2CActivityCtrl extends intranet.common.ControllerBase {
            constructor($scope, paymentService, toasterService, accountService, settings, localStorageHelper, modalService, commonDataService, websiteService, $filter, $stateParams, userService) {
                super($scope);
                this.paymentService = paymentService;
                this.toasterService = toasterService;
                this.accountService = accountService;
                this.settings = settings;
                this.localStorageHelper = localStorageHelper;
                this.modalService = modalService;
                this.commonDataService = commonDataService;
                this.websiteService = websiteService;
                this.$filter = $filter;
                this.$stateParams = $stateParams;
                this.userService = userService;
                var wsListnerDeposit = this.$rootScope.$on("ws-deposit-request", (event, response) => {
                    this.showDeposit();
                });
                var wsListnerWithdrawal = this.$rootScope.$on("ws-withdrawal-request", (event, response) => {
                    this.showWithdrawal();
                });
                this.$scope.$on('$destroy', () => {
                    wsListnerDeposit();
                    wsListnerWithdrawal();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.selectedTab = 0;
                this.$scope.userList = [];
                this.$scope.search = {
                    status: { id: '', name: 'All' },
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                };
                this.$scope.depositSearch = {
                    status: { id: '', name: 'All' },
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                };
                this.$scope.search.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.depositSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                if (this.$stateParams.tab) {
                    this.$scope.selectedTab = this.$stateParams.tab;
                }
            }
            loadInitialData() {
                this.getPayInOutStatus();
            }
            getPayInOutStatus() {
                var gameType = intranet.common.enums.FairXPayOutStatus;
                this.$scope.fairxpayoutList = intranet.common.helpers.Utility.enumToArray(gameType);
                this.$scope.fairxpayoutList.splice(0, 0, { id: '', name: 'All' });
                var offpaystatus = intranet.common.enums.OffPayStatus;
                this.$scope.fairxpayinList = intranet.common.helpers.Utility.enumToArray(offpaystatus);
                this.$scope.fairxpayinList.splice(0, 0, { id: '', name: 'All' });
            }
            showDeposit() {
                this.$scope.$broadcast('refreshGrid_kt-deposit-grid');
            }
            getPayins(params) {
                var searchQuery = {
                    status: this.$scope.depositSearch.status.id,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.depositSearch.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.depositSearch.todate),
                    userId: ''
                };
                if (this.$scope.depositSearch.selectedUser) {
                    searchQuery.userId = this.$scope.depositSearch.selectedUser.id;
                }
                return this.accountService.getOffPayIn({ searchQuery: searchQuery, params: params });
            }
            getPayInStatus(s) {
                return intranet.common.enums.OffPayStatus[s];
            }
            resetDepositCriteria() {
                this.$scope.depositSearch.status = { id: '', name: 'All' };
                this.$scope.depositSearch.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.depositSearch.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.depositSearch.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.depositSearch.selectedUser = undefined;
                this.showWithdrawal();
            }
            getStatus(s) {
                return intranet.common.enums.FairXPayOutStatus[s];
            }
            showWithdrawal() {
                this.$scope.$broadcast('refreshGrid_kt-withdrawal-grid');
            }
            getPayouts(params) {
                var searchQuery = {
                    status: this.$scope.search.status.id,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    userId: ''
                };
                if (this.$scope.search.selectedUser) {
                    searchQuery.userId = this.$scope.search.selectedUser.id;
                }
                return this.accountService.getOffPayout({ searchQuery: searchQuery, params: params });
            }
            resetCriteria() {
                this.$scope.search.status = { id: '', name: 'All' };
                this.$scope.search.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.search.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.search.selectedUser = undefined;
                this.showWithdrawal();
            }
            searchUser(search) {
                if (search && search.length >= 3) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.userService.findMembers(search);
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.userList = response.data;
                            if (this.$scope.userList && this.$scope.userList.length > 0) {
                                this.$scope.userList.forEach((u) => {
                                    u.extra = super.getUserTypesObj(u.userType);
                                });
                            }
                        });
                    }
                }
                else {
                    this.$scope.userList.splice(0);
                }
            }
            getReceiptImage(request) {
                this.accountService.getPayInOutSlip(request.imageId)
                    .success((response) => {
                    if (response.success) {
                        this.commonDataService.showReceiptModal(this.$scope, response.data);
                    }
                });
            }
            copyText(item) {
                this.commonDataService.copyText(item);
                this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Info, "Copied", 2000);
            }
        }
        master.B2CActivityCtrl = B2CActivityCtrl;
        angular.module('intranet.master').controller('b2CActivityCtrl', B2CActivityCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=B2CActivityCtrl.js.map