module intranet.admin {
    export interface ISAAdminFDReportScope extends intranet.common.IScopeBase {
        search: any;
        gridItems: any[];
        providers: any[];
        lstUsertTypes: any[];
    }

    export class SAAdminFDReportCtrl extends intranet.common.ControllerBase<ISAAdminFDReportScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISAAdminFDReportScope,
            private commonDataService: common.services.CommonDataService,
            public settings: common.IBaseSettings,
            private $filter: any,
            private ExportFactory: any,
            private fdService: services.FDService) {
            super($scope);

            this.$scope.$on('$destroy', () => {
            });
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                userType: '1'
            };
        }

        public loadInitialData(): void {
            this.$scope.lstUsertTypes = [];
            this.$scope.lstUsertTypes.push({ id: '1', name: 'Admin' });
            this.$scope.lstUsertTypes.push({ id: '2', name: 'User' });

            if (!this.commonDataService.getDateFilter(this.$scope.search, 'admin-fd-date'))
                this.setDates(0, 'd');


            var types: any = common.enums.TableProvider;
            this.$scope.providers = common.helpers.Utility.enumToArray<common.enums.TableProvider>(types);
        }

        private getProvider(p: any): any { return common.enums.TableProvider[p]; }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
            this.refreshGrid();
        }

        private getItems(params: any): any {
            this.commonDataService.storeDateFilter(this.$scope.search, 'admin-fd-date');
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTCZero(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.fromDateUTCZero(this.$scope.search.todate),
                tableName: this.$scope.search.tableName
            };

            if (this.$scope.search.userType == '1') {
                return this.fdService.getProfitLossByAdmin({ searchQuery: searchQuery, params: params });
            } else {
                return this.fdService.getProfitLossByUser({ searchQuery: searchQuery, params: params });
            }
        }

        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-adminfd-grid');
        }

        private exportFD() {
            if (this.$scope.search.userType == '1') {
                this.processExport(this.$scope.gridItems)
            }
            else {
                var searchQuery: any = {
                    fromDate: common.helpers.Utility.fromDateUTCZero(this.$scope.search.fromdate),
                    toDate: common.helpers.Utility.fromDateUTCZero(this.$scope.search.todate),
                    tableName: this.$scope.search.tableName
                };
                this.fdService.getProfitLossByUserExport(searchQuery)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.processExport(response.data);
                        }
                    });
            }
        }

        private processExport(gridData) {
            if (gridData && gridData.length > 0) {
                var table: string = '';
                var headerTD: string = '';
                var contentTD: string = '';
                var contentTR: string = '';

                angular.forEach(gridData, (g: any, gindex: any) => {
                    if (gindex == 0) {
                        headerTD += common.helpers.CommonHelper.wrapTD("User");
                        headerTD += common.helpers.CommonHelper.wrapTD("Currency");
                        headerTD += common.helpers.CommonHelper.wrapTD("Rate");
                        headerTD += common.helpers.CommonHelper.wrapTD("FD Code");
                        headerTD += common.helpers.CommonHelper.wrapTD("FD Rate");
                        headerTD += common.helpers.CommonHelper.wrapTD("P&L");

                        angular.forEach(this.$scope.providers, (p: any) => {
                            headerTD += common.helpers.CommonHelper.wrapTD(p.name);
                        });
                        table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                    }
                    contentTD = common.helpers.CommonHelper.wrapTD(g.user ? g.user.username : '');
                    contentTD += common.helpers.CommonHelper.wrapTD(g.user ? g.user.currency.name : '');
                    contentTD += common.helpers.CommonHelper.wrapTD(g.user ? g.user.currency.rate : '');
                    contentTD += common.helpers.CommonHelper.wrapTD(g.user ? g.user.currency.fairDealCode : '');
                    contentTD += common.helpers.CommonHelper.wrapTD(g.user ? g.user.currency.casinoRate : '');
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.win));
                    angular.forEach(this.$scope.providers, (p: any) => {
                        var found = false;
                        angular.forEach(g.winByProvider, (w: any) => {
                            if (p.id == w.provider) {
                                found = true;
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(w.win));
                            }
                        });
                        if (!found) {
                            contentTD += common.helpers.CommonHelper.wrapTD(0);
                        }
                    });
                    contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                });
                table += common.helpers.CommonHelper.wrapTBody(contentTR);
                table = common.helpers.CommonHelper.wrapTable(table);
                this.ExportFactory.tableStringToExcel(table, 'FD PL Report By Admin ' + (moment().format('DD-MM-YYYY')));
            }
        }
    }
    angular.module('intranet.admin').controller('sAAdminFDReportCtrl', SAAdminFDReportCtrl);
}