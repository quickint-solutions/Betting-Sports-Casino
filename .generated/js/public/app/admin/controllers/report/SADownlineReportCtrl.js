var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SADownlineReportCtrl extends intranet.common.ControllerBase {
            constructor($scope, $state, $stateParams, $filter, commonDataService, userService, ExportFactory, betHistoryService) {
                super($scope);
                this.$state = $state;
                this.$stateParams = $stateParams;
                this.$filter = $filter;
                this.commonDataService = commonDataService;
                this.userService = userService;
                this.ExportFactory = ExportFactory;
                this.betHistoryService = betHistoryService;
                var newPageLoader = this.$scope.$on('newPageLoaded', (e, data) => {
                    if (e.targetScope.gridId === 'kt-downlinereport-grid') {
                        var grossTotal = { comm: 0, grossComm: 0, netWin: 0, upline: 0, win: 0, middleMan: 0 };
                        if (data && data.result.length > 0) {
                            angular.forEach((data.result), (d) => {
                                angular.forEach((d.userPls), (u) => {
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
            initScopeValues() {
                this.$scope.grossTotal = {};
                this.$scope.canILoad = false;
                this.$scope.isChildClient = false;
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss"))
                };
                this.$scope.userTree = [];
            }
            loadInitialData() {
                if (!this.commonDataService.getDateFilter(this.$scope.search, 'downline-date'))
                    this.setDates(0, 'd');
                else
                    this.refreshGrid();
                this.buildUserTreeForHeader();
                this.getUserTree();
            }
            buildUserTreeForHeader() {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser) {
                    this.$scope.loginUsername = loggeduser.username;
                }
                if (this.$stateParams.usertype) {
                    this.$scope.childUsershort = super.getUserTypesShort(math.add(this.$stateParams.usertype, 1));
                    this.$scope.currentUsershort = super.getUserTypesShort(this.$stateParams.usertype);
                    this.$scope.isChildClient = math.add(this.$stateParams.usertype, 1) == intranet.common.enums.UserType.Player;
                }
                else {
                    var loggeduser = this.commonDataService.getLoggedInUserData();
                    if (loggeduser) {
                        this.$scope.childUsershort = super.getUserTypesShort(loggeduser.userType + 1);
                        this.$scope.currentUsershort = super.getUserTypesShort(loggeduser.userType);
                        this.$scope.isChildClient = math.add(loggeduser.userType, 1) == intranet.common.enums.UserType.Player;
                    }
                }
            }
            getUserTree() {
                if (this.$stateParams.memberid) {
                    this.userService.getParentsByUserId(this.$stateParams.memberid)
                        .success((response) => {
                        if (response.success) {
                            var result = response.data;
                            if (result) {
                                this.$scope.userTree.push({ id: result.id, name: result.username, userType: result.userType });
                                var parent = result.parent;
                                while (parent) {
                                    if (parent.username != 'sa') {
                                        this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType });
                                        if (parent.parent) {
                                            parent = parent.parent;
                                        }
                                        else {
                                            parent = null;
                                        }
                                    }
                                    else {
                                        parent = null;
                                    }
                                }
                                this.$scope.userTree = this.$scope.userTree.reverse();
                            }
                        }
                    });
                }
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
                this.refreshGrid();
            }
            refreshGrid() {
                this.$scope.canILoad = true;
                this.$scope.$broadcast('refreshGrid_kt-downlinereport-grid');
            }
            exportToExcel() {
                if (this.$scope.gridItems) {
                    var table = '';
                    var headerTD = '';
                    var contentTD = '';
                    var contentTR = '';
                    angular.forEach(this.$scope.gridItems, (item, index) => {
                        if (index == 0) {
                            headerTD = intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Member");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            if (!this.$scope.isChildClient)
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD(this.$scope.childUsershort);
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD(this.$scope.currentUsershort);
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Upline");
                            table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                            headerTD = intranet.common.helpers.CommonHelper.wrapTD("Date");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Sport");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Competition");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Event");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD(this.$scope.childUsershort + " Login Name");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD(this.$scope.childUsershort + " ID");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Net Win");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comm");
                            if (!this.$scope.isChildClient)
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Win");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comm");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("P&L");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                        }
                        angular.forEach(item.values, (m) => {
                            angular.forEach(m.userPls, (u) => {
                                contentTD = intranet.common.helpers.CommonHelper.wrapTD(moment(m.settleTime).format('DD/MM/YYYY'));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(m.eventTypeName);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(m.competitionName);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(m.eventName);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(u.user.username);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(u.user.name);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.netWin));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.grossComm));
                                if (!this.$scope.isChildClient) {
                                    var middleman = math.multiply(math.add((u.win + u.comm), u.upline), -1);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(middleman));
                                }
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.win));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.comm));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.win + u.comm));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(u.upline));
                                contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                            });
                        });
                    });
                    table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                    table = intranet.common.helpers.CommonHelper.wrapTable(table);
                    this.ExportFactory.tableStringToExcel(table, 'P&L Report By Agent');
                }
            }
            getPLbyDownline(params) {
                this.$scope.grossTotal = undefined;
                this.commonDataService.storeDateFilter(this.$scope.search, 'downline-date');
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$stateParams.memberid) {
                    return this.betHistoryService.getPLbyAgent({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
                }
                else {
                    return this.betHistoryService.getPLbyAgent({ searchQuery: searchQuery, params: params });
                }
            }
            openBetReport(item, user) {
                var obj = {
                    marketTitle: item.eventName + ' - ' + item.marketName,
                    backText: 'P&L Report By Agent'
                };
                this.commonDataService.setShareData(obj);
                this.$state.go('admin.betreport', { marketId: item.marketId, userId: user.id });
            }
        }
        admin.SADownlineReportCtrl = SADownlineReportCtrl;
        angular.module('intranet.admin').controller('sADownlineReportCtrl', SADownlineReportCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SADownlineReportCtrl.js.map