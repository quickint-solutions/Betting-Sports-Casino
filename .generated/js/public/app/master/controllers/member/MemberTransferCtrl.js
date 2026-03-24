var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MemberTransferCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService, commonDataService, ExportFactory, $stateParams, $filter, settings) {
                super($scope);
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.ExportFactory = ExportFactory;
                this.$stateParams = $stateParams;
                this.$filter = $filter;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.userType = 0;
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
                    this.$scope.userType = this.$stateParams.usertype;
                }
                else {
                    var result = this.commonDataService.getLoggedInUserData();
                    if (result) {
                        this.$scope.userid = result.id;
                        this.$scope.userType = result.userType;
                    }
                }
            }
            getTransferStatement(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                    toDate: intranet.common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
                };
                return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
            exportDataToExcel() {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                    toDate: intranet.common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
                };
                this.accountService.getTransferStatementExport({ searchQuery: searchQuery, id: this.$scope.userid })
                    .success((response) => {
                    if (response.success) {
                        var gridData = response.data;
                        if (gridData) {
                            var table = '';
                            var headerTD = '';
                            var contentTD = '';
                            var contentTR = '';
                            angular.forEach(gridData, (g, gindex) => {
                                if (gindex == 0) {
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Date (GMT)");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Time");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Payer/Payee");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Amount");
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD("Notes");
                                    table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                                }
                                contentTD = intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY'));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('HH:mm:ss'));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.remarks);
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balance));
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.comment);
                                contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                            });
                            table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                            table = intranet.common.helpers.CommonHelper.wrapTable(table);
                            this.ExportFactory.tableStringToExcel(table, 'Transfer Statement');
                        }
                    }
                });
            }
        }
        home.MemberTransferCtrl = MemberTransferCtrl;
        angular.module('intranet.master').controller('memberTransferCtrl', MemberTransferCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MemberTransferCtrl.js.map