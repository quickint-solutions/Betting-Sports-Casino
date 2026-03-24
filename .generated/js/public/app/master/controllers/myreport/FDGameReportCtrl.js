var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class FDGameReportCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, $q, $state, commonDataService, ExportFactory, $filter, userService, fdService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$q = $q;
                this.$state = $state;
                this.commonDataService = commonDataService;
                this.ExportFactory = ExportFactory;
                this.$filter = $filter;
                this.userService = userService;
                this.fdService = fdService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.userList = [];
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                };
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser) {
                    this.$scope.currentUserType = loggeduser.userType;
                }
                this.$scope.totalRows = 0;
            }
            loadInitialData() {
                if (!this.commonDataService.getDateFilter(this.$scope.search, 'market-date'))
                    this.setDates(0, 'd');
                else
                    this.refreshReportGrid();
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
                this.refreshReportGrid();
            }
            getTableProvider(p) { return intranet.common.enums.TableProvider[p]; }
            getPLbyMarket(params) {
                this.commonDataService.storeDateFilter(this.$scope.search, 'market-date');
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
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
            refreshReportGrid() {
                this.$scope.$broadcast('refreshGrid_kt-marketreport-grid');
            }
            resetCriteria() {
                this.$scope.search = {
                    tableName: '',
                    selectedUser: undefined
                };
                this.setDates(-1, 'D');
            }
            getPLByTable(item) {
                item.show = !item.show;
                if (item.show) {
                    var searchQuery = {
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                        tableName: this.$scope.search.tableName,
                        userId: item.user.id
                    };
                    this.fdService.getProfitLossByTable(searchQuery)
                        .success((response) => {
                        if (response.success) {
                            item.userPLInfo = response.data;
                        }
                    });
                }
            }
            searchUser(search) {
                if (search && search.length >= 3) {
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
            exportToExcel(tableId) {
                this.commonDataService.storeDateFilter(this.$scope.search, 'market-date');
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    tableName: this.$scope.search.tableName,
                };
                if (this.$scope.search.selectedUser) {
                    searchQuery.userId = this.$scope.search.selectedUser.id;
                    this.fdService.getPLbyTableExport(searchQuery)
                        .success((response) => {
                        if (response.success) {
                            this.exportExcel(response.data);
                        }
                    });
                }
                else {
                    this.fdService.getPLbyTableExport(searchQuery)
                        .success((response) => {
                        if (response.success) {
                            this.exportExcel(response.data);
                        }
                    });
                }
            }
            exportExcel(data) {
                if (data) {
                    var table = '';
                    var headerTD = '';
                    var contentTD = '';
                    var contentTR = '';
                    angular.forEach(data, (d, index) => {
                        if (index == 0) {
                            headerTD = intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Member");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Agent");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            if (this.$scope.currentUserType <= 3) {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("MA");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            }
                            if (this.$scope.currentUserType <= 2) {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("CUS");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            }
                            if (this.$scope.currentUserType == 1) {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("AD");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            }
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Upline");
                            table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                            headerTD = intranet.common.helpers.CommonHelper.wrapTD("Date");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("RoundId");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Game");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("T/O");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Win");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comm");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("P&L");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Win");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comm");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("P&L");
                            if (this.$scope.currentUserType <= 3) {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Win");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comm");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("P&L");
                            }
                            if (this.$scope.currentUserType <= 2) {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Win");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comm");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("P&L");
                            }
                            if (this.$scope.currentUserType == 1) {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Win");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comm");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("P&L");
                            }
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Upline");
                            table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                        }
                        angular.forEach(d.rounds, (m) => {
                            contentTD = intranet.common.helpers.CommonHelper.wrapTD(moment(m.settleTime).format('DD/MM/YYYY'));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(m.roundId);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(d.tableName);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.member.stake));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.member.win));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.member.commission));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.member.pnl));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.agent.win));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.agent.commission));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.agent.pnl));
                            if (this.$scope.currentUserType <= 3) {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.master.win));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.master.commission));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.master.pnl));
                            }
                            if (this.$scope.currentUserType <= 2) {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.superMaster.win));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.superMaster.commission));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.superMaster.pnl));
                            }
                            if (this.$scope.currentUserType == 1) {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.admin.win));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.admin.commission));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.admin.pnl));
                            }
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(m.uplineWin));
                            contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                        });
                    });
                    table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                    table = intranet.common.helpers.CommonHelper.wrapTable(table);
                    this.ExportFactory.tableStringToExcel(table, 'P&L Report By FD Game');
                }
            }
            viewCards(item) {
                this.commonDataService.viewCards(item.market);
            }
            formatWinner(winner, gametype) {
                return this.commonDataService.formatLiveGameResult(winner, gametype);
            }
        }
        master.FDGameReportCtrl = FDGameReportCtrl;
        angular.module('intranet.master').controller('fdGameReportCtrl', FDGameReportCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FDGameReportCtrl.js.map