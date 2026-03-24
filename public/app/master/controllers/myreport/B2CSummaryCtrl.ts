
module intranet.master {

    export interface IB2CSummaryScope extends intranet.common.IScopeBase {
        search: { fromdate: any, todate: any };
        canILoad: any;
        gridItems: any[];
        totalItems: any;
    }

    export class B2CSummaryCtrl extends intranet.common.ControllerBase<IB2CSummaryScope>
        implements common.init.IInit {
        constructor($scope: IB2CSummaryScope,
            private accountService: services.AccountService,
            private $filter: any,
            private $state: ng.ui.IStateService,
            private ExportFactory: any,
            private $window: any,
            private localStorageHelper: common.helpers.LocalStorageHelper) {
            super($scope);

            var newPageLoader = this.$scope.$on('newPageLoaded', (e: any, data: any) => {
                if (e.targetScope.gridId === 'kt-b2csummary-grid') {
                    if (data && data.result.length > 0) {
                        data.result.forEach((item: any) => {
                            if (item.firstDeposit != undefined) item.firstDepositCount = item.firstDeposit.length;
                            else item.firstDepositCount = 0;
                            if (item.secondDeposit != undefined) item.secondDepositCount = item.secondDeposit.length;
                            else item.secondDepositCount = 0;
                            if (item.thirdDeposit != undefined) item.thirdDepositCount = item.thirdDeposit.length;
                            else item.thirdDepositCount = 0;
                        });
                    }
                }
            });

            this.$scope.$on('$destroy', () => {
                newPageLoader();
            });

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
            this.$scope.canILoad = false;
        }

        public loadInitialData(): void {
            this.setDates(-7, 'd');
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private refreshGrid(): void {
            if (!this.$scope.canILoad) this.$scope.canILoad = true;
            else {
                this.$scope.$broadcast('refreshGrid');
            }
        }


        private getB2CSummary(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTCZero(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTCZero(this.$scope.search.todate)
            };
            return this.accountService.getB2CSummary({ searchQuery: searchQuery, params: params });
        }

        private exportData() {
            var gridData: any[] = this.$scope.gridItems;
            if (gridData.length > 0) {
                var table: string = '';
                var headerTD: string = '';
                var contentTD: string = '';
                var contentTR: string = '';

                var bonusCodeList = [];
                angular.forEach(gridData, (g: any) => {
                    angular.forEach(g.bonusCodeList, (b: any) => {
                        if (bonusCodeList.indexOf(b.offerCode) < 0) {
                            bonusCodeList.push(b.offerCode);
                        }
                    });
                });


                angular.forEach(gridData, (g: any, index: any) => {
                    if (index == 0) {
                        headerTD += common.helpers.CommonHelper.wrapTD("Date");
                        headerTD += common.helpers.CommonHelper.wrapTD("Agent Name");
                        headerTD += common.helpers.CommonHelper.wrapTD("New Clients");
                        headerTD += common.helpers.CommonHelper.wrapTD("Bonus Code Used");
                        headerTD += common.helpers.CommonHelper.wrapTD("Deposit Count");
                        headerTD += common.helpers.CommonHelper.wrapTD("Deposit");
                        headerTD += common.helpers.CommonHelper.wrapTD("Withdrawal Count");
                        headerTD += common.helpers.CommonHelper.wrapTD("Withdrawal");
                        headerTD += common.helpers.CommonHelper.wrapTD("Bonus Count");
                        headerTD += common.helpers.CommonHelper.wrapTD("Bonus Amount");
                        headerTD += common.helpers.CommonHelper.wrapTD("Net Deposit");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("First Deposit");
                        headerTD += common.helpers.CommonHelper.wrapTD("Second Deposit");
                        headerTD += common.helpers.CommonHelper.wrapTD("Third Deposit");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("Bonus Redeem");
                        headerTD += common.helpers.CommonHelper.wrapTD("Bonus Activated");
                        headerTD += common.helpers.CommonHelper.wrapTD("Bonus Expired");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        angular.forEach(bonusCodeList, (b: any) => {
                            headerTD += common.helpers.CommonHelper.wrapTD(b);
                        });
                        table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                    }

                    contentTD = common.helpers.CommonHelper.wrapTD(moment(g.date).format('DD/MM/YYYY'));
                    contentTD += common.helpers.CommonHelper.wrapTD(g.agentName);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.newUsers.length);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.bonusCodeList.length);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.depositCount);
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.deposit));
                    contentTD += common.helpers.CommonHelper.wrapTD(g.withdrawalCount);
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.withdrawal));
                    contentTD += common.helpers.CommonHelper.wrapTD(g.bonusCount);
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonus));
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.netDeposit));

                    contentTD += common.helpers.CommonHelper.wrapTD("");
                    contentTD += common.helpers.CommonHelper.wrapTD(g.firstDepositCount);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.secondDepositCount);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.thirdDepositCount);

                    contentTD += common.helpers.CommonHelper.wrapTD("");
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonusRedeem));
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonusActivated));
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonusExpired));

                    contentTD += common.helpers.CommonHelper.wrapTD("");
                    angular.forEach(bonusCodeList, (b: any) => {
                        var found = false;
                        angular.forEach(g.bonusCodeList, (bl: any) => {
                            if (bl.offerCode == b) {
                                found = true;
                                contentTD += common.helpers.CommonHelper.wrapTD(bl.bonusCount);
                            }
                        });
                        if (!found) { contentTD += common.helpers.CommonHelper.wrapTD(""); }
                    });

                    contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                });
                table += common.helpers.CommonHelper.wrapTBody(contentTR);
                table = common.helpers.CommonHelper.wrapTable(table);
                this.ExportFactory.tableStringToExcel(table, 'B2C Summary');
            }
        }

        private showTransactions(item: any, dwType: any) {
            var id = new Date().getTime();
            var model: any = {
                b2CSummaryId: item.id,
                userId: item.userId,
                fromDate: common.helpers.Utility.fromDateUTCIST(new Date(item.date)),
                dwType: dwType,
                agentName: item.agentName
            }
            this.localStorageHelper.set('b2c_search_' + id, model);
            var url = this.$state.href('master.b2ctransactions', { searchId: id });
            this.$window.open(url, '_blank');
        }

        private showBonusTransactions(item: any, dwType: any) {
            var id = new Date().getTime();
            var model: any = {
                b2CSummaryId: item.id,
                userId: item.userId,
                fromDate: common.helpers.Utility.fromDateUTCIST(new Date(item.date)),
                dwType: dwType,
                agentName: item.agentName
            }
            this.localStorageHelper.set('b2c_search_' + id, model);
            var url = this.$state.href('master.b2ctransactions', { searchId: id, reporttype: 2 });
            this.$window.open(url, '_blank');
        }

        private showInlineDetail(prop: any, state: boolean, item: any) {
            item.showUsers = false;
            item.showBonusList = false;
            item.showFirstDepositList = false;
            item.showSecondDepositList = false;
            item.showThirdDepositList = false;
            item[prop] = state;
        }
    }
    angular.module('intranet.master').controller('b2CSummaryCtrl', B2CSummaryCtrl);
}