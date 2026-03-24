var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        var account;
        (function (account) {
            class MobileCurrentBetCtrl extends intranet.common.ControllerBase {
                constructor($scope, exportService, betService) {
                    super($scope);
                    this.exportService = exportService;
                    this.betService = betService;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.betStatus = [];
                    this.$scope.betSides = [];
                    this.$scope.search = { status: '-1', betside: '-1' };
                }
                loadInitialData() {
                    this.fillBetStatus();
                    this.fillBetSides();
                }
                fillBetStatus() {
                    this.$scope.betStatus.push({ id: -1, name: 'All' });
                    this.$scope.betStatus.push({ id: 2, name: 'Matched' });
                    this.$scope.betStatus.push({ id: 3, name: 'Unmatched' });
                }
                fillBetSides() {
                    this.$scope.betSides.push({ id: -1, name: 'All' });
                    this.$scope.betSides.push({ id: 1, name: 'Back' });
                    this.$scope.betSides.push({ id: 2, name: 'Lay' });
                }
                getMatchedBets(params) {
                    var searchQuery = { status: 2, side: this.$scope.search.betside };
                    return this.betService.getBets({ searchQuery: searchQuery, params: params });
                }
                getUnmatchedBets(params) {
                    var searchQuery = { status: 3, side: this.$scope.search.betside };
                    return this.betService.getBets({ searchQuery: searchQuery, params: params });
                }
                exportMatchedBets(params, exportType) {
                    var searchQuery = { status: 2, side: this.$scope.search.betside };
                    return this.exportService.currentBets({ exportType: exportType, searchQuery: searchQuery, params: params });
                }
                exportUnmatchedBets(params, exportType) {
                    var searchQuery = { status: 3, side: this.$scope.search.betside };
                    return this.exportService.currentBets({ exportType: exportType, searchQuery: searchQuery, params: params });
                }
                betSideChanged() {
                    var refreshCMD = "refreshGrid";
                    if (this.$scope.search.status == 2) {
                        refreshCMD = refreshCMD + "_kt-matchedbets-grid";
                    }
                    else if (this.$scope.search.status == 3) {
                        refreshCMD = refreshCMD + "_kt-unmatchedbets-grid";
                    }
                    this.$scope.$broadcast(refreshCMD);
                }
            }
            account.MobileCurrentBetCtrl = MobileCurrentBetCtrl;
            angular.module('intranet.mobile.account').controller('mobileCurrentBetCtrl', MobileCurrentBetCtrl);
        })(account = mobile.account || (mobile.account = {}));
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileCurrentBet.js.map