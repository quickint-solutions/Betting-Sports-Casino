module intranet.master {

    export interface IBficBankingScope extends intranet.common.IScopeBase {
        selectedTab: any;

        depositSearch: any;
        withdrawalSearch: any;

        userList: any[];
        promiseItem: any;

        statusList: any;
    }

    export class BficBankingCtrl extends intranet.common.ControllerBase<IBficBankingScope>
        implements common.init.IInit {
        constructor($scope: IBficBankingScope,
            private paymentService: services.PaymentService,
            private toasterService: common.services.ToasterService,
            private accountService: services.AccountService,
            private settings: common.IBaseSettings,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private modalService: common.services.ModalService,
            private commonDataService: common.services.CommonDataService,
            private websiteService: services.WebsiteService,
            private $stateParams: any,
            private userService: services.UserService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
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


            if (this.$stateParams.tab) { this.$scope.selectedTab = this.$stateParams.tab; }
        }

        public loadInitialData(): void {
            this.$scope.statusList.push({ id: '', name: 'All' });
            this.$scope.statusList.push({ id: 1, name: 'Init' });
            this.$scope.statusList.push({ id: 2, name: 'Confirmed' });
        }

        private getStatus(s: any) { return this.$scope.statusList[s].name; }

        private viewDetail(gitem: any): void {
            var item: any = {};
            angular.copy(gitem, item);

            var modal = new common.helpers.CreateModal();
            modal.header = "Transaction detail";
            modal.data = item;
            modal.bodyUrl = this.settings.ThemeName + '/master/banking/view-bfic-transaction-modal.html';
            modal.controller = 'viewBficTransactionModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        // deposit request
        private showDeposit() {
            this.$scope.$broadcast('refreshGrid_kt-deposit-grid');
        }

        private getPayins(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.depositSearch.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.depositSearch.todate),
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

        private resetDepositCriteria(): void {
            this.$scope.depositSearch.status = { id: '', name: 'All' };
            this.$scope.depositSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
            this.$scope.depositSearch.todate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
            this.$scope.depositSearch.searchText = '';
            this.$scope.depositSearch.selectedUser = undefined;
            this.showDeposit();
        }

        // withdrawal request
        private showWithdrawal() {
            this.$scope.$broadcast('refreshGrid_kt-withdrawal-grid');
        }

        private getPayouts(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.withdrawalSearch.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.withdrawalSearch.todate),
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

        private resetCriteria(): void {
            this.$scope.withdrawalSearch.status = { id: '', name: 'All' };
            this.$scope.withdrawalSearch.fromdate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
            this.$scope.withdrawalSearch.todate = new Date(moment().add(-2, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss"));
            this.$scope.withdrawalSearch.searchText = '';
            this.$scope.withdrawalSearch.selectedUser = undefined;
            this.showWithdrawal();
        }



        private searchUser(search: any): void {
            if (search && search.length >= 3) {
                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }
                this.$scope.promiseItem = this.userService.findMembers(search);
                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        this.$scope.userList = response.data;
                        if (this.$scope.userList && this.$scope.userList.length > 0) {
                            this.$scope.userList.forEach((u: any) => {
                                u.extra = super.getUserTypesObj(u.userType);
                            });
                        }
                    });
                }

            } else {
                this.$scope.userList.splice(0);
            }
        }

        private addDepositEntry() {
            var item: any = {};
            var modal = new common.helpers.CreateModal();
            modal.header = "Add Deposit Entry";
            modal.data = item;
            modal.bodyUrl = this.settings.ThemeName + '/master/banking/add-deposit-entry-modal.html';
            modal.controller = 'addDepositEntryModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.showDeposit();
                }
            });
        }

    }
    angular.module('intranet.master').controller('bficBankingCtrl', BficBankingCtrl);
}