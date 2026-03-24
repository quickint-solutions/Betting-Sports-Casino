module intranet.master {

    export interface IB2CActivityScope extends intranet.common.IScopeBase {
       

        selectedTab: any;

        search: any;
        depositSearch: any;
        fairxpayinList: any[];

        userList: any[];
        promiseItem: any;
        fairxpayoutList: any[];

    }

    export class B2CActivityCtrl extends intranet.common.ControllerBase<IB2CActivityScope>
        implements common.init.IInit {
        constructor($scope: IB2CActivityScope,
            private paymentService: services.PaymentService,
            private toasterService: common.services.ToasterService,
            private accountService: services.AccountService,
            private settings: common.IBaseSettings,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private modalService: common.services.ModalService,
            private commonDataService: common.services.CommonDataService,
            private websiteService: services.WebsiteService,
            private $filter: any,
            private $stateParams: any,
            private userService: services.UserService) {
            super($scope);

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

        public initScopeValues(): void {
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


            if (this.$stateParams.tab) { this.$scope.selectedTab = this.$stateParams.tab; }
        }

        public loadInitialData(): void {
            this.getPayInOutStatus();
        }

        private getPayInOutStatus(): void {
            var gameType: any = common.enums.FairXPayOutStatus;
            this.$scope.fairxpayoutList = common.helpers.Utility.enumToArray<common.enums.FairXPayOutStatus>(gameType);
            this.$scope.fairxpayoutList.splice(0, 0, { id: '', name: 'All' });

            var offpaystatus: any = common.enums.OffPayStatus;
            this.$scope.fairxpayinList = common.helpers.Utility.enumToArray<common.enums.OffPayStatus>(offpaystatus);
            this.$scope.fairxpayinList.splice(0, 0, { id: '', name: 'All' });
        }

       

        // deposit request
        private showDeposit() {
                this.$scope.$broadcast('refreshGrid_kt-deposit-grid');
        }

        private getPayins(params: any): any {
            var searchQuery: any = {
                status: this.$scope.depositSearch.status.id,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.depositSearch.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.depositSearch.todate),
                userId: ''
            };
            if (this.$scope.depositSearch.selectedUser) {
                searchQuery.userId = this.$scope.depositSearch.selectedUser.id;
            }
            return this.accountService.getOffPayIn({ searchQuery: searchQuery, params: params });
        }

        private getPayInStatus(s: any): any {
            return common.enums.OffPayStatus[s];
        }

        private resetDepositCriteria(): void {
            this.$scope.depositSearch.status = { id: '', name: 'All' };
            this.$scope.depositSearch.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.depositSearch.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.depositSearch.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
            this.$scope.depositSearch.selectedUser = undefined;
            this.showWithdrawal();
        }

        // withdrawal request
        private getStatus(s: any): any {
            return common.enums.FairXPayOutStatus[s];
        }

        private showWithdrawal() {
            this.$scope.$broadcast('refreshGrid_kt-withdrawal-grid');
        }

        private getPayouts(params: any): any {
            var searchQuery: any = {
                status: this.$scope.search.status.id,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                userId: ''
            };
            if (this.$scope.search.selectedUser) {
                searchQuery.userId = this.$scope.search.selectedUser.id;
            }
            return this.accountService.getOffPayout({ searchQuery: searchQuery, params: params });
        }

        private resetCriteria(): void {
            this.$scope.search.status = { id: '', name: 'All' };
            this.$scope.search.fromdate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.search.fromdate = new Date(moment().add(-2, 'd').format("DD MMM YYYY HH:mm"));
            this.$scope.search.selectedUser = undefined;
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

        private getReceiptImage(request: any) {
            this.accountService.getPayInOutSlip(request.imageId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.showReceiptModal(this.$scope, response.data);
                    }
                });
        }

        private copyText(item: any) {
            this.commonDataService.copyText(item);
            this.toasterService.showToastMessage(common.helpers.ToastType.Info, "Copied", 2000);
        }
    }
    angular.module('intranet.master').controller('b2CActivityCtrl', B2CActivityCtrl);
}