var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        var account;
        (function (account) {
            class MobileCasinoStatementCtrl extends intranet.common.ControllerBase {
                constructor($scope, accountService, commonDataService, exportService, settings) {
                    super($scope);
                    this.accountService = accountService;
                    this.commonDataService = commonDataService;
                    this.exportService = exportService;
                    this.settings = settings;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.search = {
                        accountType: '-1',
                        fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                        todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                    };
                }
                loadInitialData() {
                    this.getUserId();
                    this.fillAccountType();
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
                    var result = this.commonDataService.getLoggedInUserData();
                    if (result) {
                        this.$scope.userid = result.id;
                    }
                }
                getAccountStatement(params) {
                    var searchQuery = {
                        accountType: this.$scope.search.accountType == '-1' ? '' : this.$scope.search.accountType,
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                    };
                    return this.accountService.getCasinoStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
                }
                exportAccountStatement(params, exportType) {
                    var searchQuery = {
                        accountType: this.$scope.search.accountType == '-1' ? '' : this.$scope.search.accountType,
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                    };
                    return this.exportService.casinoStatement({ searchQuery: searchQuery, exportType: exportType, params: params, id: this.$scope.userid });
                }
            }
            account.MobileCasinoStatementCtrl = MobileCasinoStatementCtrl;
            angular.module('intranet.mobile.account').controller('mobileCasinoStatementCtrl', MobileCasinoStatementCtrl);
        })(account = mobile.account || (mobile.account = {}));
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileCasinoStatementCtrl.js.map