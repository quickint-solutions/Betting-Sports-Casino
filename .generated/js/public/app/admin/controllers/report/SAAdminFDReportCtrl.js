var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAAdminFDReportCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, settings, $filter, ExportFactory, fdService) {
                super($scope);
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.$filter = $filter;
                this.ExportFactory = ExportFactory;
                this.fdService = fdService;
                this.$scope.$on('$destroy', () => {
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                    userType: '1'
                };
            }
            loadInitialData() {
                this.$scope.lstUsertTypes = [];
                this.$scope.lstUsertTypes.push({ id: '1', name: 'Admin' });
                this.$scope.lstUsertTypes.push({ id: '2', name: 'User' });
                if (!this.commonDataService.getDateFilter(this.$scope.search, 'admin-fd-date'))
                    this.setDates(0, 'd');
                var types = intranet.common.enums.TableProvider;
                this.$scope.providers = intranet.common.helpers.Utility.enumToArray(types);
            }
            getProvider(p) { return intranet.common.enums.TableProvider[p]; }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
                this.refreshGrid();
            }
            getItems(params) {
                this.commonDataService.storeDateFilter(this.$scope.search, 'admin-fd-date');
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTCZero(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.fromDateUTCZero(this.$scope.search.todate),
                    tableName: this.$scope.search.tableName
                };
                if (this.$scope.search.userType == '1') {
                    return this.fdService.getProfitLossByAdmin({ searchQuery: searchQuery, params: params });
                }
                else {
                    return this.fdService.getProfitLossByUser({ searchQuery: searchQuery, params: params });
                }
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid_kt-adminfd-grid');
            }
            exportFD() {
                if (this.$scope.search.userType == '1') {
                    this.processExport(this.$scope.gridItems);
                }
                else {
                    var searchQuery = {
                        fromDate: intranet.common.helpers.Utility.fromDateUTCZero(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.fromDateUTCZero(this.$scope.search.todate),
                        tableName: this.$scope.search.tableName
                    };
                    this.fdService.getProfitLossByUserExport(searchQuery)
                        .success((response) => {
                        if (response.success) {
                            this.processExport(response.data);
                        }
                    });
                }
            }
            processExport(gridData) {
                if (gridData && gridData.length > 0) {
                    var table = '';
                    var headerTD = '';
                    var contentTD = '';
                    var contentTR = '';
                    angular.forEach(gridData, (g, gindex) => {
                        if (gindex == 0) {
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("User");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Currency");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Rate");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("FD Code");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("FD Rate");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("P&L");
                            angular.forEach(this.$scope.providers, (p) => {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD(p.name);
                            });
                            table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                        }
                        contentTD = intranet.common.helpers.CommonHelper.wrapTD(g.user ? g.user.username : '');
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user ? g.user.currency.name : '');
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user ? g.user.currency.rate : '');
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user ? g.user.currency.fairDealCode : '');
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user ? g.user.currency.casinoRate : '');
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.win));
                        angular.forEach(this.$scope.providers, (p) => {
                            var found = false;
                            angular.forEach(g.winByProvider, (w) => {
                                if (p.id == w.provider) {
                                    found = true;
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(w.win));
                                }
                            });
                            if (!found) {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(0);
                            }
                        });
                        contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                    });
                    table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                    table = intranet.common.helpers.CommonHelper.wrapTable(table);
                    this.ExportFactory.tableStringToExcel(table, 'FD PL Report By Admin ' + (moment().format('DD-MM-YYYY')));
                }
            }
        }
        admin.SAAdminFDReportCtrl = SAAdminFDReportCtrl;
        angular.module('intranet.admin').controller('sAAdminFDReportCtrl', SAAdminFDReportCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAAdminFDReportCtrl.js.map