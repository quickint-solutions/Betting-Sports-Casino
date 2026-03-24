var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class B2CSummaryCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService, $filter, $state, ExportFactory, $window, localStorageHelper) {
                super($scope);
                this.accountService = accountService;
                this.$filter = $filter;
                this.$state = $state;
                this.ExportFactory = ExportFactory;
                this.$window = $window;
                this.localStorageHelper = localStorageHelper;
                var newPageLoader = this.$scope.$on('newPageLoaded', (e, data) => {
                    if (e.targetScope.gridId === 'kt-b2csummary-grid') {
                        if (data && data.result.length > 0) {
                            data.result.forEach((item) => {
                                if (item.firstDeposit != undefined)
                                    item.firstDepositCount = item.firstDeposit.length;
                                else
                                    item.firstDepositCount = 0;
                                if (item.secondDeposit != undefined)
                                    item.secondDepositCount = item.secondDeposit.length;
                                else
                                    item.secondDepositCount = 0;
                                if (item.thirdDeposit != undefined)
                                    item.thirdDepositCount = item.thirdDeposit.length;
                                else
                                    item.thirdDepositCount = 0;
                            });
                        }
                    }
                });
                this.$scope.$on('$destroy', () => {
                    newPageLoader();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                };
                this.$scope.canILoad = false;
            }
            loadInitialData() {
                this.setDates(-7, 'd');
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.refreshGrid();
            }
            refreshGrid() {
                if (!this.$scope.canILoad)
                    this.$scope.canILoad = true;
                else {
                    this.$scope.$broadcast('refreshGrid');
                }
            }
            getB2CSummary(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTCZero(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTCZero(this.$scope.search.todate)
                };
                return this.accountService.getB2CSummary({ searchQuery: searchQuery, params: params });
            }
            exportData() {
                var gridData = this.$scope.gridItems;
                if (gridData.length > 0) {
                    var table = '';
                    var headerTD = '';
                    var contentTD = '';
                    var contentTR = '';
                    var bonusCodeList = [];
                    angular.forEach(gridData, (g) => {
                        angular.forEach(g.bonusCodeList, (b) => {
                            if (bonusCodeList.indexOf(b.offerCode) < 0) {
                                bonusCodeList.push(b.offerCode);
                            }
                        });
                    });
                    angular.forEach(gridData, (g, index) => {
                        if (index == 0) {
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Date");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Agent Name");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("New Clients");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bonus Code Used");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Deposit Count");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Deposit");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Withdrawal Count");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Withdrawal");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bonus Count");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bonus Amount");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Net Deposit");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("First Deposit");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Second Deposit");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Third Deposit");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bonus Redeem");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bonus Activated");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bonus Expired");
                            headerTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            angular.forEach(bonusCodeList, (b) => {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD(b);
                            });
                            table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                        }
                        contentTD = intranet.common.helpers.CommonHelper.wrapTD(moment(g.date).format('DD/MM/YYYY'));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.agentName);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.newUsers.length);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bonusCodeList.length);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.depositCount);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.deposit));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.withdrawalCount);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.withdrawal));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bonusCount);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonus));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.netDeposit));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD("");
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.firstDepositCount);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.secondDepositCount);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.thirdDepositCount);
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD("");
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonusRedeem));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonusActivated));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.bonusExpired));
                        contentTD += intranet.common.helpers.CommonHelper.wrapTD("");
                        angular.forEach(bonusCodeList, (b) => {
                            var found = false;
                            angular.forEach(g.bonusCodeList, (bl) => {
                                if (bl.offerCode == b) {
                                    found = true;
                                    contentTD += intranet.common.helpers.CommonHelper.wrapTD(bl.bonusCount);
                                }
                            });
                            if (!found) {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD("");
                            }
                        });
                        contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                    });
                    table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                    table = intranet.common.helpers.CommonHelper.wrapTable(table);
                    this.ExportFactory.tableStringToExcel(table, 'B2C Summary');
                }
            }
            showTransactions(item, dwType) {
                var id = new Date().getTime();
                var model = {
                    b2CSummaryId: item.id,
                    userId: item.userId,
                    fromDate: intranet.common.helpers.Utility.fromDateUTCIST(new Date(item.date)),
                    dwType: dwType,
                    agentName: item.agentName
                };
                this.localStorageHelper.set('b2c_search_' + id, model);
                var url = this.$state.href('master.b2ctransactions', { searchId: id });
                this.$window.open(url, '_blank');
            }
            showBonusTransactions(item, dwType) {
                var id = new Date().getTime();
                var model = {
                    b2CSummaryId: item.id,
                    userId: item.userId,
                    fromDate: intranet.common.helpers.Utility.fromDateUTCIST(new Date(item.date)),
                    dwType: dwType,
                    agentName: item.agentName
                };
                this.localStorageHelper.set('b2c_search_' + id, model);
                var url = this.$state.href('master.b2ctransactions', { searchId: id, reporttype: 2 });
                this.$window.open(url, '_blank');
            }
            showInlineDetail(prop, state, item) {
                item.showUsers = false;
                item.showBonusList = false;
                item.showFirstDepositList = false;
                item.showSecondDepositList = false;
                item.showThirdDepositList = false;
                item[prop] = state;
            }
        }
        master.B2CSummaryCtrl = B2CSummaryCtrl;
        angular.module('intranet.master').controller('b2CSummaryCtrl', B2CSummaryCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=B2CSummaryCtrl.js.map