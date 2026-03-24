var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class BficBankingCtrl extends intranet.common.ControllerBase {
            constructor($scope, paymentService, toasterService, accountService, settings, localStorageHelper, modalService, commonDataService, websiteService, $stateParams, userService) {
                super($scope);
                this.paymentService = paymentService;
                this.toasterService = toasterService;
                this.accountService = accountService;
                this.settings = settings;
                this.localStorageHelper = localStorageHelper;
                this.modalService = modalService;
                this.commonDataService = commonDataService;
                this.websiteService = websiteService;
                this.$stateParams = $stateParams;
                this.userService = userService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.selectedTab = 0;
                this.$scope.userList = [];
                this.$scope.statusList = [];
                this.$scope.depositSearch = {
                    status: { id: '', name: 'All' },
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                };
                this.$scope.withdrawalSearch = {
                    status: { id: '', name: 'All' },
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                };
                this.$scope.depositSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.withdrawalSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                if (this.$stateParams.tab) {
                    this.$scope.selectedTab = this.$stateParams.tab;
                }
            }
            loadInitialData() {
                this.$scope.statusList.push({ id: '', name: 'All' });
                this.$scope.statusList.push({ id: 1, name: 'Init' });
                this.$scope.statusList.push({ id: 2, name: 'Confirmed' });
            }
            getStatus(s) { return this.$scope.statusList[s].name; }
            viewDetail(gitem) {
                var item = {};
                angular.copy(gitem, item);
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = "Transaction detail";
                modal.data = item;
                modal.bodyUrl = this.settings.ThemeName + '/master/banking/view-bfic-transaction-modal.html';
                modal.controller = 'viewBficTransactionModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            showDeposit() {
                this.$scope.$broadcast('refreshGrid_kt-deposit-grid');
            }
            getPayins(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.depositSearch.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.depositSearch.todate),
                    userId: '',
                    searchText: this.$scope.depositSearch.searchText,
                    isDeposit: true,
                    gameOkStatus: this.$scope.depositSearch.status.id
                };
                if (this.$scope.depositSearch.selectedUser) {
                    searchQuery.userId = this.$scope.depositSearch.selectedUser.id;
                }
                return this.accountService.getGameokTransactions({ searchQuery: searchQuery, params: params });
            }
            resetDepositCriteria() {
                this.$scope.depositSearch.status = { id: '', name: 'All' };
                this.$scope.depositSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.depositSearch.todate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.depositSearch.searchText = '';
                this.$scope.depositSearch.selectedUser = undefined;
                this.showDeposit();
            }
            showWithdrawal() {
                this.$scope.$broadcast('refreshGrid_kt-withdrawal-grid');
            }
            getPayouts(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.withdrawalSearch.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.withdrawalSearch.todate),
                    userId: '',
                    searchText: this.$scope.withdrawalSearch.searchText,
                    isDeposit: false,
                    gameOkStatus: this.$scope.withdrawalSearch.status.id
                };
                if (this.$scope.withdrawalSearch.selectedUser) {
                    searchQuery.userId = this.$scope.withdrawalSearch.selectedUser.id;
                }
                return this.accountService.getGameokTransactions({ searchQuery: searchQuery, params: params });
            }
            resetCriteria() {
                this.$scope.withdrawalSearch.status = { id: '', name: 'All' };
                this.$scope.withdrawalSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.withdrawalSearch.todate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.withdrawalSearch.searchText = '';
                this.$scope.withdrawalSearch.selectedUser = undefined;
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
            addDepositEntry() {
                var item = {};
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = "Add Deposit Entry";
                modal.data = item;
                modal.bodyUrl = this.settings.ThemeName + '/master/banking/add-deposit-entry-modal.html';
                modal.controller = 'addDepositEntryModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.showDeposit();
                    }
                });
            }
        }
        master.BficBankingCtrl = BficBankingCtrl;
        angular.module('intranet.master').controller('bficBankingCtrl', BficBankingCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BficBankingCtrl.js.map