module intranet.mobile.account {
    export interface IMobileAccountStatementScope extends intranet.common.IScopeBase {
        userid: any;
        search: { fromdate: any, todate: any };
        gridTotalRow: any;

        accountTypeList: any[];
        betDetailItems: any;
    }

    export class MobileAccountStatementCtrl extends intranet.common.ControllerBase<IMobileAccountStatementScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileAccountStatementScope,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
              private betHistoryService: services.BetHistoryService,
            private ExportFactory: any,
            private $filter: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().add(-7, 'd').format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
        }

        public loadInitialData(): void {
            this.getUserId();

            var acType: any = common.enums.AccountType;
            this.$scope.accountTypeList = common.helpers.Utility.enumToArray<common.enums.AccountType>(acType);
            this.$scope.accountTypeList.splice(0, 0, { id: '', name: 'All' });
        }


        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-accountstatement-grid');
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private getUserId(): void {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                this.$scope.userid = result.id;
            }
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

        private getTransferStatement(params: any): any {
            var searchQuery: any = {
                //accountType: common.enums.AccountType.Chips,
                fromDate: common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                toDate: common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
            };
            return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }

        private getProvider(p: any) { return common.enums.TableProvider[p]; }

         private getBet(item: any, show: boolean = true): void {
            item.show = !item.show;
            if (show) {
                item.inprogress = true;
                this.betHistoryService.getplBetbyMarketIdUserId(item.marketId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            item.betDetailItems = response.data;
                        }
                    }).finally(() => {
                        item.inprogress = false;
                    });
            }
        }

    }
    angular.module('intranet.mobile.account').controller('mobileAccountStatementCtrl', MobileAccountStatementCtrl);
}