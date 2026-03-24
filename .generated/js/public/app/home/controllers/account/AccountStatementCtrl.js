var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class AccountStatementCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService, commonDataService, ExportFactory, toasterService, betHistoryService, modalService, $filter, $stateParams, settings) {
                super($scope);
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.ExportFactory = ExportFactory;
                this.toasterService = toasterService;
                this.betHistoryService = betHistoryService;
                this.modalService = modalService;
                this.$filter = $filter;
                this.$stateParams = $stateParams;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.userType = 0;
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    accountType: ''
                };
                this.statementModeChange();
                this.$scope.showBetDetail = false;
                this.$scope.betDetailTemplate = this.settings.ThemeName + '/template/market-pl-detail.html';
            }
            loadInitialData() {
                this.getUserId();
                var acType = intranet.common.enums.AccountType;
                this.$scope.accountTypeList = intranet.common.helpers.Utility.enumToArray(acType);
                this.$scope.accountTypeList.splice(0, 0, { id: '', name: 'All' });
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGridWithoutSorting');
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.refreshGrid();
            }
            getUserId() {
                if (this.$stateParams.memberid) {
                    this.$scope.userid = this.$stateParams.memberid;
                }
                else {
                    var result = this.commonDataService.getLoggedInUserData();
                    if (result) {
                        this.$scope.userid = result.id;
                        this.$scope.userType = result.userType;
                    }
                }
            }
            getAccountStatement(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$scope.search.accountType) {
                    searchQuery.accountType = this.$scope.search.accountType;
                }
                if (this.$scope.isCurrentStatement) {
                    return this.accountService.getAccountStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
                }
                else {
                    return this.accountService.getSettleSccountStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
                }
            }
            exportAccountStatement() {
                var promise;
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$scope.isCurrentStatement) {
                    promise = this.accountService.getAccountStatementExport({ searchQuery: searchQuery, id: this.$scope.userid });
                }
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
            statementModeChange(isCurrent = true) {
                this.$scope.isCurrentStatement = isCurrent;
                if (isCurrent) {
                    this.$scope.headerLabel = 'accountstatement.label';
                    this.setDates(-2, 'M');
                }
                else {
                    this.$scope.headerLabel = 'historical.accountstatement.label';
                    this.setDates(-2, 'M');
                }
            }
            getTransferStatement(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                    toDate: intranet.common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
                };
                return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
            goback() {
                this.$scope.showBetDetail = false;
                this.$scope.$broadcast("refreshGrid");
            }
            getBet(item) {
                if (item.marketId) {
                    item.inProgress = true;
                    this.$scope.marketname = item.narration ? item.narration : item.name;
                    this.$scope.goBackLabel = "Account Statement";
                    var promise;
                    if (this.$stateParams.memberid) {
                        promise = this.betHistoryService.getplBetbyMarketIdUserId(item.marketId, this.$stateParams.memberid);
                    }
                    else {
                        promise = this.betHistoryService.getplBetbyMarketIdUserId(item.marketId);
                    }
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.betDetailItems = response.data;
                        }
                    }).finally(() => { item.inProgress = false; this.$scope.showBetDetail = true; });
                }
            }
            getSummaryTotal(data, prop) {
                var total = 0;
                angular.forEach(data, (d) => {
                    angular.forEach(d.values, (v) => {
                        ;
                        total += v[prop];
                    });
                });
                return total;
            }
            getProvider(p) { return intranet.common.enums.TableProvider[p]; }
            removeLedger(item) {
                var txt = "Are you sure you want to delete below entry, <br/>" +
                    "<b> P&L : </b>" + this.$filter('toRate')(item.balance) + "<br/>" +
                    "<b> Total : </b>" + this.$filter('toRate')(item.total) + "<br/>" +
                    "<b> Description : </b>" + item.narration + (item.comment ? '(' + item.comment + ')' : '') + "<br/>";
                if (item.name) {
                    txt = txt + "<b> Remarks : </b>" + item.name + "<br/>";
                }
                if (item.remarks && !item.provider) {
                    txt = txt + "<b> Remarks : </b>" + item.remarks + "<br/>";
                }
                else {
                    if (item.provider) {
                        txt = txt + "<b> Provider : </b>" + this.getProvider(item.provider) + "<br/>";
                    }
                }
                txt = txt + "<b> Date : </b>" + moment(item.createdOn).format('DD-MMM-YYYY HH:mm:ss') + "<br/>";
                this.modalService.showConfirmation(txt)
                    .then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.accountService.removeLedger(item.id)
                            .success((response) => {
                            if (response.success) {
                                this.refreshGrid();
                            }
                            this.toasterService.showMessages(response.messages);
                        });
                    }
                });
            }
        }
        home.AccountStatementCtrl = AccountStatementCtrl;
        angular.module('intranet.home').controller('accountStatementCtrl', AccountStatementCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AccountStatementCtrl.js.map