module intranet.admin {
    export interface ISAFDGameReportScope extends intranet.common.IScopeBase {
        search: any;
        userList: any[];
        promiseItem: any;

        currentUserType: any;

        totalRows: any;
    }

    export class SAFDGameReportCtrl extends intranet.common.ControllerBase<ISAFDGameReportScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISAFDGameReportScope,
            private $stateParams: any,
            private $q: ng.IQService,
            private $state: any,
            private $filter: any,
            private ExportFactory: any,
            private userService: services.UserService,
            private commonDataService: common.services.CommonDataService,
            private fdService: services.FDService) {
            super($scope);



            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.userList = [];
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
            };

            var loggeduser = this.commonDataService.getLoggedInUserData();
            if (loggeduser) { this.$scope.currentUserType = loggeduser.userType; }
            this.$scope.totalRows = 0;
        }

        public loadInitialData(): void {
            if (!this.commonDataService.getDateFilter(this.$scope.search, 'market-date'))
                this.setDates(0, 'd');
            else
                this.refreshReportGrid();
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
            this.refreshReportGrid();
        }

        private getTableProvider(p: any) { return common.enums.TableProvider[p]; }

        private getPLbyMarket(params: any): any {
            this.commonDataService.storeDateFilter(this.$scope.search, 'market-date');
            var searchQuery = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                tableName: this.$scope.search.tableName,
            };
            params.groupBy = 'user';
            if (this.$scope.search.selectedUser) {
                return this.fdService.getPLbyUser({ searchQuery: searchQuery, params: params, id: this.$scope.search.selectedUser.id });
            }
            else {
                return this.fdService.getPLbyUser({ searchQuery: searchQuery, params: params });
            }
        }

        private refreshReportGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-marketreport-grid');
        }

        private resetCriteria(): void {
            this.$scope.search = {
                tableName: '',
                selectedUser: undefined
            };
            this.setDates(-1, 'D');
        }

        private getPLByTable(item: any) {
            item.show = !item.show;
            if (item.show) {
                var searchQuery = {
                    fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    tableName: this.$scope.search.tableName,
                    userId: item.user.id
                };
                this.fdService.getProfitLossByTable(searchQuery)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            item.userPLInfo = response.data;
                        }
                    });
            }
        }

        private searchUser(search: any): void {
            if (search && search.length >= 3) {
                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }
                if (this.$stateParams.memberid) {
                    this.$scope.promiseItem = this.userService.findMembers(search, this.$stateParams.memberid);
                }
                else {
                    this.$scope.promiseItem = this.userService.findMembers(search);
                }

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



        private exportToExcel(tableId: any): void {
            this.commonDataService.storeDateFilter(this.$scope.search, 'market-date');
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                tableName: this.$scope.search.tableName,

            };
            if (this.$scope.search.selectedUser) {
                searchQuery.userId = this.$scope.search.selectedUser.id;
                this.fdService.getPLbyTableExport(searchQuery)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.exportExcel(response.data);
                        }
                    });
            }
            else {
                this.fdService.getPLbyTableExport(searchQuery)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.exportExcel(response.data);
                        }
                    });
            }


        }

        private exportExcel(data: any): void {
            if (data) {
                var table: string = '';
                var headerTD: string = '';
                var contentTD: string = '';
                var contentTR: string = '';

                angular.forEach(data, (d: any, index: any) => {
                    if (index == 0) {
                        headerTD = common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");

                        headerTD += common.helpers.CommonHelper.wrapTD("Member");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");

                        headerTD += common.helpers.CommonHelper.wrapTD("Agent");
                        headerTD += common.helpers.CommonHelper.wrapTD("");
                        headerTD += common.helpers.CommonHelper.wrapTD("");

                        if (this.$scope.currentUserType <= 3) {
                            headerTD += common.helpers.CommonHelper.wrapTD("MA");
                            headerTD += common.helpers.CommonHelper.wrapTD("");
                            headerTD += common.helpers.CommonHelper.wrapTD("");
                        }
                        if (this.$scope.currentUserType <= 2) {
                            headerTD += common.helpers.CommonHelper.wrapTD("CUS");
                            headerTD += common.helpers.CommonHelper.wrapTD("");
                            headerTD += common.helpers.CommonHelper.wrapTD("");
                        }
                        if (this.$scope.currentUserType <= 1) {
                            headerTD += common.helpers.CommonHelper.wrapTD("AD");
                            headerTD += common.helpers.CommonHelper.wrapTD("");
                            headerTD += common.helpers.CommonHelper.wrapTD("");
                        }
                        headerTD += common.helpers.CommonHelper.wrapTD("Upline");

                        table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));

                        headerTD = common.helpers.CommonHelper.wrapTD("Date");
                        headerTD += common.helpers.CommonHelper.wrapTD("RoundId");
                        headerTD += common.helpers.CommonHelper.wrapTD("Game");


                        headerTD += common.helpers.CommonHelper.wrapTD("T/O");
                        headerTD += common.helpers.CommonHelper.wrapTD("Win");
                        headerTD += common.helpers.CommonHelper.wrapTD("Comm");
                        headerTD += common.helpers.CommonHelper.wrapTD("P&L");

                        headerTD += common.helpers.CommonHelper.wrapTD("Win");
                        headerTD += common.helpers.CommonHelper.wrapTD("Comm");
                        headerTD += common.helpers.CommonHelper.wrapTD("P&L");

                        if (this.$scope.currentUserType <= 3) {
                            headerTD += common.helpers.CommonHelper.wrapTD("Win");
                            headerTD += common.helpers.CommonHelper.wrapTD("Comm");
                            headerTD += common.helpers.CommonHelper.wrapTD("P&L");
                        }
                        if (this.$scope.currentUserType <= 2) {
                            headerTD += common.helpers.CommonHelper.wrapTD("Win");
                            headerTD += common.helpers.CommonHelper.wrapTD("Comm");
                            headerTD += common.helpers.CommonHelper.wrapTD("P&L");
                        }
                        if (this.$scope.currentUserType <= 1) {
                            headerTD += common.helpers.CommonHelper.wrapTD("Win");
                            headerTD += common.helpers.CommonHelper.wrapTD("Comm");
                            headerTD += common.helpers.CommonHelper.wrapTD("P&L");
                        }
                        headerTD += common.helpers.CommonHelper.wrapTD("Upline");
                        table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                    }
                    angular.forEach(d.rounds, (m: any) => {
                        contentTD = common.helpers.CommonHelper.wrapTD(moment(m.settleTime).format('DD/MM/YYYY'));
                        contentTD += common.helpers.CommonHelper.wrapTD(m.roundId);
                        contentTD += common.helpers.CommonHelper.wrapTD(d.tableName);

                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.member.stake));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.member.win));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.member.commission));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.member.pnl));

                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.agent.win));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.agent.commission));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.agent.pnl));
                        if (this.$scope.currentUserType <= 3) {
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.master.win));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.master.commission));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.master.pnl));
                        }
                        if (this.$scope.currentUserType <= 2) {
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.superMaster.win));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.superMaster.commission));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.superMaster.pnl));
                        }
                        if (this.$scope.currentUserType <= 1) {
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.admin.win));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.admin.commission));
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.admin.pnl));
                        }
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.uplineWin));

                        contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                    });
                });
                table += common.helpers.CommonHelper.wrapTBody(contentTR);
                table = common.helpers.CommonHelper.wrapTable(table);

                this.ExportFactory.tableStringToExcel(table, 'P&L Report By FD Game');
            }
        }
    }
    angular.module('intranet.admin').controller('sAFDGameReportCtrl', SAFDGameReportCtrl);
}