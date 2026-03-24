var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        var account;
        (function (account) {
            class MobileAccountStatementCtrl extends intranet.common.ControllerBase {
                constructor($scope, accountService, commonDataService, betHistoryService, ExportFactory, $filter) {
                    super($scope);
                    this.accountService = accountService;
                    this.commonDataService = commonDataService;
                    this.betHistoryService = betHistoryService;
                    this.ExportFactory = ExportFactory;
                    this.$filter = $filter;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.search = {
                        fromdate: new Date(moment().add(-7, 'd').format("DD MMM YYYY HH:mm")),
                        todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                    };
                }
                loadInitialData() {
                    this.getUserId();
                    var acType = intranet.common.enums.AccountType;
                    this.$scope.accountTypeList = intranet.common.helpers.Utility.enumToArray(acType);
                    this.$scope.accountTypeList.splice(0, 0, { id: '', name: 'All' });
                }
                refreshGrid() {
                    this.$scope.$broadcast('refreshGrid_kt-accountstatement-grid');
                }
                setDates(num, sh) {
                    this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                    this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                    this.refreshGrid();
                }
                getUserId() {
                    var result = this.commonDataService.getLoggedInUserData();
                    if (result) {
                        this.$scope.userid = result.id;
                    }
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
                getTransferStatement(params) {
                    var searchQuery = {
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                        toDate: intranet.common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
                    };
                    return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
                }
                getProvider(p) { return intranet.common.enums.TableProvider[p]; }
                getBet(item, show = true) {
                    item.show = !item.show;
                    if (show) {
                        item.inprogress = true;
                        this.betHistoryService.getplBetbyMarketIdUserId(item.marketId)
                            .success((response) => {
                            if (response.success) {
                                item.betDetailItems = response.data;
                            }
                        }).finally(() => {
                            item.inprogress = false;
                        });
                    }
                }
            }
            account.MobileAccountStatementCtrl = MobileAccountStatementCtrl;
            angular.module('intranet.mobile.account').controller('mobileAccountStatementCtrl', MobileAccountStatementCtrl);
        })(account = mobile.account || (mobile.account = {}));
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileAccountStatementCtrl.js.map