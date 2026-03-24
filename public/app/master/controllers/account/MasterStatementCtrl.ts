
module intranet.home {
    export interface IMasterStatementScope extends intranet.common.IScopeBase {
        search: { fromdate: any, todate: any };
        selectedTab: any; //0=stmt,1=pl,2=credit
        userid: any;
        totalPL: any;
        totalRows: any;
    }

    export class MasterStatementCtrl extends intranet.common.ControllerBase<IMasterStatementScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMasterStatementScope,
            private ExportFactory: any,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private $state: any,
            private $q: ng.IQService,
            private $stateParams: any,
            private $filter: any) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.selectedTab = 0;
            this.$scope.search = {
                fromdate: new Date(moment().add(-180, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm:ss"))
            };
        }

        public loadInitialData(): void {
            this.getUserId();
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        private getUserId(): void {
            if (this.$stateParams.memberid) { this.$scope.userid = this.$stateParams.memberid; }
            else {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.userid = result.id;
                }
            }
        }

        private getPLStatement(params: any): any {
            this.$scope.totalRows = 0;
            this.$scope.totalPL = 0;
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            var defer = this.$q.defer();
            this.accountService.getPLStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid })
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.totalPL = response.data.totalPnl;
                        defer.resolve(response.data);
                    } else { defer.reject(); }
                }).error(() => { defer.reject(); });
            return defer.promise;
        }

        private getCreditStatement(params: any): any {
            this.$scope.totalRows = 0;
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
            };
            return this.accountService.getCreditStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }

        private getAccountStatement(params: any): any {
            var searchQuery = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            return this.accountService.getAccountStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }

        private exportAccountStatement(): void {
            var promise: ng.IHttpPromise<any>;
            var searchQuery = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };

            promise = this.accountService.getAccountStatementExport({ searchQuery: searchQuery, id: this.$scope.userid });

            if (promise) {
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        var gridData = response.data;
                        if (gridData) {
                            var table: string = '';
                            var headerTD: string = '';
                            var contentTD: string = '';
                            var contentTR: string = '';

                            gridData.forEach((g: any, index: any) => {
                                if (index == 0) {
                                    headerTD += common.helpers.CommonHelper.wrapTD("Date");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Description");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Remarks");
                                    headerTD += common.helpers.CommonHelper.wrapTD("P&L");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Credit");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Balance");
                                    table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                                }
                                contentTD = common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm'));

                                var narration = g.narration;
                                if (g.accountType == common.enums.AccountType.CasinoPL) { narration += " # " + g.roundId; }
                                if (g.comment) { narration += " - " + g.comment; }
                                contentTD += common.helpers.CommonHelper.wrapTD(narration);

                                var remarks = '';
                                if (g.name) { remarks += g.name; }
                                if (g.remarks) { remarks += g.remarks; }
                                contentTD += common.helpers.CommonHelper.wrapTD(remarks);

                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balance));

                                if (g.accountType == common.enums.AccountType.Credit) {
                                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.creditTotal));
                                } else {
                                    contentTD += common.helpers.CommonHelper.wrapTD('');
                                }
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.total));
                                contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                            });
                            table += common.helpers.CommonHelper.wrapTBody(contentTR);
                            table = common.helpers.CommonHelper.wrapTable(table);

                            this.ExportFactory.tableStringToExcel(table, 'Account Statement');
                        }
                    }
                });
            }
        }

        private search(): void {
            if (this.$scope.selectedTab == 0) {
                this.$scope.$broadcast('refreshGrid_kt-acstatement-grid');
            }
            else if (this.$scope.selectedTab == 1) {
                this.$scope.$broadcast('refreshGrid_kt-plstatement-grid');
            }
            else {
                this.$scope.$broadcast('refreshGrid_kt-creditstatement-grid');
            }
        }

        private openBetReport(item: any): void {
            var obj = {
                marketTitle: item.marketInfo.eventName + ' - ' + item.marketInfo.name,
                backText: 'Account Statement'
            }
            this.commonDataService.setShareData(obj);
            var result = this.commonDataService.getLoggedInUserData();
            if (result && (result.userType == common.enums.UserType.SuperAdmin || result.userType == common.enums.UserType.Manager)) {
                if (this.$stateParams.memberid) {
                    this.$state.go('admin.betreport', { marketId: item.marketId, userId: this.$scope.userid });
                }
                else {
                    this.$state.go('admin.betreport', { marketId: item.marketId });
                }
            }
            else {
                if (this.$stateParams.memberid) {
                    this.$state.go('master.betreport', { marketId: item.marketId, userId: this.$scope.userid });
                }
                else {
                    this.$state.go('master.betreport', { marketId: item.marketId });
                }
            }

        }

    }
    angular.module('intranet.master').controller('masterStatementCtrl', MasterStatementCtrl);
}