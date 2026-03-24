var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAMarketReportCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, $q, $state, $filter, ExportFactory, userService, commonDataService, eventTypeService, betHistoryService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$q = $q;
                this.$state = $state;
                this.$filter = $filter;
                this.ExportFactory = ExportFactory;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.eventTypeService = eventTypeService;
                this.betHistoryService = betHistoryService;
                this.$scope.$on('$destroy', () => {
                });
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
                var bettingType = intranet.common.enums.BettingType;
                this.$scope.bettingTypeList = intranet.common.helpers.Utility.enumToArray(bettingType);
                this.$scope.bettingTypeList.splice(0, 0, { id: '', name: 'All' });
                this.getEventTypes();
                if (!this.commonDataService.getDateFilter(this.$scope.search, 'market-date'))
                    this.setDates(-1, 'D');
                else
                    this.refreshReportGrid();
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
                this.refreshReportGrid();
            }
            getEventTypes() {
                this.eventTypeService.getEventTypes()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypeList = response.data;
                        this.$scope.eventTypeList.splice(0, 0, { id: '', name: 'All' });
                    }
                });
            }
            getPLbyMarket(params) {
                this.commonDataService.storeDateFilter(this.$scope.search, 'market-date');
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    eventTypeId: this.$scope.search.eventType ? this.$scope.search.eventType.id : '',
                    eventName: this.$scope.search.eventName,
                    bettingType: this.$scope.search.bettingType && this.$scope.search.bettingType.id ? this.$scope.search.bettingType.id : '',
                };
                if (this.$scope.search.selectedUser) {
                    return this.betHistoryService.getPLbyMarket({ searchQuery: searchQuery, params: params, id: this.$scope.search.selectedUser.id });
                }
                else {
                    return this.betHistoryService.getPLbyMarket({ searchQuery: searchQuery, params: params });
                }
            }
            getPLDetail(item, touchShow = true, userId = '') {
                if (touchShow)
                    item.show = !item.show;
                if (item.show) {
                    this.betHistoryService.getPLbyMarketDetail(item.marketId, (this.$scope.search.selectedUser ? this.$scope.search.selectedUser.id : userId))
                        .success((response) => {
                        if (response.success) {
                            item.userPLInfo = response.data;
                        }
                    });
                }
            }
            refreshReportGrid() {
                this.$scope.$broadcast('refreshGrid_kt-marketreport-grid');
            }
            resetCriteria() {
                this.$scope.search = {
                    eventType: { id: '', name: 'All' },
                    eventName: '',
                    selectedUser: undefined
                };
                this.setDates(-1, 'D');
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
            openBetReport(item) {
                var obj = {
                    marketTitle: item.eventName + ' - ' + item.marketName,
                    backText: 'P&L Report By Market'
                };
                this.commonDataService.setShareData(obj);
                if (this.$scope.search.selectedUser) {
                    this.$state.go('admin.betreport', { marketId: item.marketId, userId: this.$scope.search.selectedUser.id });
                }
                else {
                    this.$state.go('admin.betreport', { marketId: item.marketId });
                }
            }
            exportToExcel(tableId) {
                this.commonDataService.storeDateFilter(this.$scope.search, 'market-date');
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id > 0 ? this.$scope.search.eventType.id : '',
                    eventName: this.$scope.search.eventName,
                };
                if (this.$scope.search.selectedUser) {
                    searchQuery.userId = this.$scope.search.selectedUser.id;
                    this.betHistoryService.getPLbyMarketExport(searchQuery)
                        .success((response) => {
                        if (response.success) {
                            this.exportExcel(response.data);
                        }
                    });
                }
                else {
                    this.betHistoryService.getPLbyMarketExport(searchQuery)
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
                            headerTD = intranet.common.helpers.CommonHelper.wrapTD("Date");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Id");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Competition");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Event");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Market");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Winner");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stakes");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Win");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Comm");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("P&L");
                            table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                        }
                        contentTD = intranet.common.helpers.CommonHelper.wrapTD(moment(d.settleTime).format('DD/MM/YYYY'));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(d.roundId);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(d.competitionName);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(d.eventName);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(d.marketName);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(d.winner);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(d.stake));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(d.win));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(d.commission));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(d.pnl));
                        contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                    });
                    table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                    table = intranet.common.helpers.CommonHelper.wrapTable(table);
                    this.ExportFactory.tableStringToExcel(table, 'P&L Report By Market');
                }
            }
        }
        admin.SAMarketReportCtrl = SAMarketReportCtrl;
        angular.module('intranet.admin').controller('sAMarketReportCtrl', SAMarketReportCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAMarketReportCtrl.js.map