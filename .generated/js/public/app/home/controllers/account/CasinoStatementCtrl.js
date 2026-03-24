var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class CasinoStatementCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService, commonDataService, exportService, $stateParams, settings) {
                super($scope);
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.exportService = exportService;
                this.$stateParams = $stateParams;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.userType = 0;
                this.$scope.search = {
                    accountType: '-1',
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                };
                this.statementModeChange();
            }
            loadInitialData() {
                this.getUserId();
            }
            getGameType(usertype) {
                return intranet.common.enums.EzugiGameType[usertype];
            }
            fillAccountType() {
                this.$scope.accountTypeList = [];
                var actypes = intranet.common.enums.AccountType;
                this.$scope.accountTypeList = intranet.common.helpers.Utility.enumToArray(actypes);
                this.$scope.accountTypeList = this.$scope.accountTypeList.filter((a) => {
                    return a.id == intranet.common.enums.AccountType.CasinoPL;
                });
                this.$scope.accountTypeList.splice(0, 0, { id: -1, name: '-- Select Account Type --' });
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
                this.fillAccountType();
            }
            getAccountStatement(params) {
                var searchQuery = {
                    accountType: this.$scope.search.accountType == '-1' ? '' : this.$scope.search.accountType,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$scope.isCurrentStatement) {
                    return this.accountService.getCasinoStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
                }
                else {
                    return this.accountService.getSettleCasinoStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
                }
            }
            exportAccountStatement(params, exportType) {
                var searchQuery = {
                    accountType: this.$scope.search.accountType == '-1' ? '' : this.$scope.search.accountType,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$scope.isCurrentStatement) {
                    return this.exportService.casinoStatement({ searchQuery: searchQuery, exportType: exportType, params: params, id: this.$scope.userid });
                }
                else {
                    return this.exportService.settleCasinoStatement({ searchQuery: searchQuery, exportType: exportType, params: params, id: this.$scope.userid });
                }
            }
            statementModeChange(isCurrent = true) {
                this.$scope.isCurrentStatement = isCurrent;
                if (isCurrent) {
                    this.$scope.headerLabel = 'common.casinostatement.label';
                    this.setDates(-1, 'd');
                }
                else {
                    this.$scope.headerLabel = 'historical.casinostatement.label';
                    this.setDates(-2, 'M');
                }
            }
        }
        home.CasinoStatementCtrl = CasinoStatementCtrl;
        angular.module('intranet.home').controller('casinoStatementCtrl', CasinoStatementCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CasinoStatementCtrl.js.map