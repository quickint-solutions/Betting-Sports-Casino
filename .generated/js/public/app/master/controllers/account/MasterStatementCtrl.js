var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MasterStatementCtrl extends intranet.common.ControllerBase {
            constructor($scope, ExportFactory, accountService, commonDataService, $state, $q, $stateParams, $filter) {
                super($scope);
                this.ExportFactory = ExportFactory;
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.$state = $state;
                this.$q = $q;
                this.$stateParams = $stateParams;
                this.$filter = $filter;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.selectedTab = 0;
                this.$scope.search = {
                    fromdate: new Date(moment().add(-180, 'd').startOf('day').format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss"))
                };
            }
            loadInitialData() {
                this.getUserId();
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            getUserId() {
                if (this.$stateParams.memberid) {
                    this.$scope.userid = this.$stateParams.memberid;
                }
                else {
                    var result = this.commonDataService.getLoggedInUserData();
                    if (result) {
                        this.$scope.userid = result.id;
                    }
                }
            }
            getPLStatement(params) {
                this.$scope.totalRows = 0;
                this.$scope.totalPL = 0;
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                var defer = this.$q.defer();
                this.accountService.getPLStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid })
                    .success((response) => {
                    if (response.success) {
                        this.$scope.totalPL = response.data.totalPnl;
                        defer.resolve(response.data);
                    }
                    else {
                        defer.reject();
                    }
                }).error(() => { defer.reject(); });
                return defer.promise;
            }
            getCreditStatement(params) {
                this.$scope.totalRows = 0;
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                };
                return this.accountService.getCreditStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
            getAccountStatement(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                return this.accountService.getAccountStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
            exportAccountStatement() {
                var promise;
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                promise = this.accountService.getAccountStatementExport({ searchQuery: searchQuery, id: this.$scope.userid });
                if (promise) {
                    promise.success((response) => {
                        if (response.success) {
                            var gridData = response.data;
                            if (gridData) {
                                var table = '';
                                var headerTD = '';
                                var contentTD = '';
                                var contentTR = '';
                                gridData.forEach((g, index) => {
                                    if (index == 0) {
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Date");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Description");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Remarks");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("P&L");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Credit");
                                        headerTD += intranet.common.helpers.CommonHelper.wrapTD("Balance");
                                        table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                                    }
                                    contentTD = intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm'));
                                    var narration = g.narration;
                                    if (g.accountType == intranet.common.enums.AccountType.CasinoPL) {
                                        narration += " # " + g.roundId;
                                    }
                                    if (g.comment) {
                                        narration += " - " + g.comment;
                                    }
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(narration);
                                    var remarks = '';
                                    if (g.name) {
                                        remarks += g.name;
                                    }
                                    if (g.remarks) {
                                        remarks += g.remarks;
                                    }
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(remarks);
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balance));
                                    if (g.accountType == intranet.common.enums.AccountType.Credit) {
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.creditTotal));
                                    }
                                    else {
                                        contentTD += intranet.common.helpers.CommonHelper.wrapTD('');
                                    }
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.total));
                                    contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                                });
                                table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                                table = intranet.common.helpers.CommonHelper.wrapTable(table);
                                this.ExportFactory.tableStringToExcel(table, 'Account Statement');
                            }
                        }
                    });
                }
            }
            search() {
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
            openBetReport(item) {
                var obj = {
                    marketTitle: item.marketInfo.eventName + ' - ' + item.marketInfo.name,
                    backText: 'Account Statement'
                };
                this.commonDataService.setShareData(obj);
                var result = this.commonDataService.getLoggedInUserData();
                if (result && (result.userType == intranet.common.enums.UserType.SuperAdmin || result.userType == intranet.common.enums.UserType.Manager)) {
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
        home.MasterStatementCtrl = MasterStatementCtrl;
        angular.module('intranet.master').controller('masterStatementCtrl', MasterStatementCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MasterStatementCtrl.js.map