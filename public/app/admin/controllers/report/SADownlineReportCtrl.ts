module intranet.admin {
    export interface ISADownlineReportScope extends intranet.common.IScopeBase {
        search: any;
        canILoad: boolean;
        gridItems: any[];

        loginUsername: any;
        currentUsershort: any;
        childUsershort: any;

        isChildClient: boolean;

        userTree: any[];
        grossTotal: any;
    }

    export class SADownlineReportCtrl extends intranet.common.ControllerBase<ISADownlineReportScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISADownlineReportScope,
            private $state: any,
            private $stateParams:any,
            private $filter: any,
            private commonDataService: common.services.CommonDataService,
            private userService: services.UserService,
            private ExportFactory: any,
            private betHistoryService: services.BetHistoryService) {
            super($scope);
            var newPageLoader = this.$scope.$on('newPageLoaded', (e: any, data: any) => {
                if (e.targetScope.gridId === 'kt-downlinereport-grid') {
                    var grossTotal: any = { comm: 0, grossComm: 0, netWin: 0, upline: 0, win: 0, middleMan: 0 };
                    if (data && data.result.length > 0) {
                        angular.forEach((data.result), (d: any) => {
                            angular.forEach((d.userPls), (u: any) => {
                                grossTotal.comm = math.add(grossTotal.comm, u.comm);
                                grossTotal.netWin = math.add(grossTotal.netWin, u.netWin);
                                grossTotal.win = math.add(grossTotal.win, u.win);

                                grossTotal.middleMan = math.add(grossTotal.middleMan, math.add(u.win, u.comm));
                            });
                        });
                    }
                    this.$scope.grossTotal = grossTotal;
                }
            });
            this.$scope.$on('$destroy', () => {
                newPageLoader();
            });
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.grossTotal = {};
            this.$scope.canILoad = false;
            this.$scope.isChildClient = false;
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm:ss"))
            };
            this.$scope.userTree = [];
        }

        public loadInitialData(): void {
            if (!this.commonDataService.getDateFilter(this.$scope.search, 'downline-date'))
                this.setDates(0, 'd');
            else
                this.refreshGrid();

            this.buildUserTreeForHeader();
            this.getUserTree();
        }

        private buildUserTreeForHeader(): void {
            var loggeduser = this.commonDataService.getLoggedInUserData();
            if (loggeduser) { this.$scope.loginUsername = loggeduser.username; }
            if (this.$stateParams.usertype) {
                this.$scope.childUsershort = super.getUserTypesShort(math.add(this.$stateParams.usertype, 1));
                this.$scope.currentUsershort = super.getUserTypesShort(this.$stateParams.usertype);
                this.$scope.isChildClient = math.add(this.$stateParams.usertype, 1) == common.enums.UserType.Player;
            }
            else {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser) {
                    this.$scope.childUsershort = super.getUserTypesShort(loggeduser.userType + 1);
                    this.$scope.currentUsershort = super.getUserTypesShort(loggeduser.userType);
                    this.$scope.isChildClient = math.add(loggeduser.userType, 1) == common.enums.UserType.Player;
                }
            }
        }

        private getUserTree(): void {
            if (this.$stateParams.memberid) {
                this.userService.getParentsByUserId(this.$stateParams.memberid)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            var result = response.data;
                            if (result) {
                                this.$scope.userTree.push({ id: result.id, name: result.username, userType: result.userType });
                                var parent = result.parent;
                                while (parent) {
                                    if (parent.username != 'sa') {
                                        this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType });
                                        if (parent.parent) { parent = parent.parent; }
                                        else { parent = null; }
                                    } else { parent = null; }
                                }
                                this.$scope.userTree = this.$scope.userTree.reverse();
                                //this.$scope.userTree.splice(0, 1);
                            }
                        }
                    });
            }
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
            this.refreshGrid();
        }

        private refreshGrid(): void {
            this.$scope.canILoad = true;
            this.$scope.$broadcast('refreshGrid_kt-downlinereport-grid');
        }

        private exportToExcel(): void {
            if (this.$scope.gridItems) {
                var table: string = '';
                var headerTD: string = '';
                var contentTD: string = '';
                var contentTR: string = '';

                angular.forEach(this.$scope.gridItems, (item: any, index: any) => {
                    if (index == 0) {
                        headerTD = common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("Member");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        if (!this.$scope.isChildClient) headerTD += common.helpers.CommonHelper.wrapTD(this.$scope.childUsershort);
                        headerTD += common.helpers.CommonHelper.wrapTD(this.$scope.currentUsershort);
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("Upline");
                        table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));

                        headerTD = common.helpers.CommonHelper.wrapTD("Date");
                        headerTD += common.helpers.CommonHelper.wrapTD("Sport");
                        headerTD += common.helpers.CommonHelper.wrapTD("Competition");
                        headerTD += common.helpers.CommonHelper.wrapTD("Event");
                        headerTD += common.helpers.CommonHelper.wrapTD(this.$scope.childUsershort + " Login Name");
                        headerTD += common.helpers.CommonHelper.wrapTD(this.$scope.childUsershort + " ID");
                        headerTD += common.helpers.CommonHelper.wrapTD("Net Win");
                        headerTD += common.helpers.CommonHelper.wrapTD("Comm");
                        if (!this.$scope.isChildClient) headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("Win");
                        headerTD += common.helpers.CommonHelper.wrapTD("Comm");
                        headerTD += common.helpers.CommonHelper.wrapTD("P&L");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                    }
                    angular.forEach(item.values, (m: any) => {
                        angular.forEach(m.userPls, (u: any) => {
                            contentTD = common.helpers.CommonHelper.wrapTD(moment(m.settleTime).format('DD/MM/YYYY'));
                            contentTD += common.helpers.CommonHelper.wrapTD(m.eventTypeName);
                            contentTD += common.helpers.CommonHelper.wrapTD(m.competitionName);
                            contentTD += common.helpers.CommonHelper.wrapTD(m.eventName);
                            contentTD += common.helpers.CommonHelper.wrapTD(u.user.username);
                            contentTD += common.helpers.CommonHelper.wrapTD(u.user.name);
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.netWin));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.grossComm));
                            if (!this.$scope.isChildClient) {
                                var middleman: any = math.multiply(math.add((u.win + u.comm), u.upline), -1);
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(middleman));
                            }
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.win));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.comm));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.win + u.comm));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.upline));


                            contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                        });

                    });
                });

                table += common.helpers.CommonHelper.wrapTBody(contentTR);
                table = common.helpers.CommonHelper.wrapTable(table);

                this.ExportFactory.tableStringToExcel(table, 'P&L Report By Agent');
            }

        }

        private getPLbyDownline(params: any): any {
            this.$scope.grossTotal = undefined;
            this.commonDataService.storeDateFilter(this.$scope.search, 'downline-date');
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            if (this.$stateParams.memberid) {
                return this.betHistoryService.getPLbyAgent({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
            }
            else {
                return this.betHistoryService.getPLbyAgent({ searchQuery: searchQuery, params: params });
            }

        }

        private openBetReport(item: any, user: any): void {
            var obj = {
                marketTitle: item.eventName + ' - ' + item.marketName,
                backText: 'P&L Report By Agent'
            }
            this.commonDataService.setShareData(obj);
            this.$state.go('admin.betreport', { marketId: item.marketId, userId: user.id });
        }
    }
    angular.module('intranet.admin').controller('sADownlineReportCtrl', SADownlineReportCtrl);
}