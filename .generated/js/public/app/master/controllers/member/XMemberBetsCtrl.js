var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class MemberBetsCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, betService, betHistoryService, $stateParams, settings) {
                super($scope);
                this.toasterService = toasterService;
                this.betService = betService;
                this.betHistoryService = betHistoryService;
                this.$stateParams = $stateParams;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    fromdate: new Date(moment().startOf('day').format("DD MMM YYYY HH:mm:ss")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm:ss"))
                };
                this.$scope.totalRows = 0;
                this.$scope.betStatus = 2;
                this.$scope.liveGamesId = this.settings.LiveGamesId;
                this.$scope.dataForCurrent = true;
            }
            loadInitialData() {
            }
            getMatchedBets(params) {
                var searchQuery = { status: 2, side: -1 };
                if (this.$stateParams.memberid) {
                    return this.betService.getBetsById({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
                }
                else {
                    return this.betService.getBets({ searchQuery: searchQuery, params: params });
                }
            }
            getUnmatchedBets(params) {
                var searchQuery = { status: 3, side: -1 };
                if (this.$stateParams.memberid) {
                    return this.betService.getBetsById({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
                }
                else {
                    return this.betService.getBets({ searchQuery: searchQuery, params: params });
                }
            }
            betSideChanged(status) {
                this.$scope.betStatus = status;
                var refreshCMD = "refreshGrid";
                if (status == 2) {
                    refreshCMD = refreshCMD + "_kt-matchedbets-grid";
                }
                else if (status == 3) {
                    refreshCMD = refreshCMD + "_kt-unmatchedbets-grid";
                }
                this.$scope.$broadcast(refreshCMD);
            }
            getHistoryBets(params) {
                this.$scope.dataForCurrent = false;
                var searchQuery = {
                    status: 'settled',
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$stateParams.memberid) {
                    return this.betHistoryService.getHistoryBetsById({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
                }
                else {
                    return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params });
                }
            }
            refreshHistoryGrid() {
                this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
            }
            search() {
                this.$scope.totalRows = 0;
                if (this.$scope.dataForCurrent) {
                    this.betSideChanged(this.$scope.betStatus);
                }
                else {
                    this.refreshHistoryGrid();
                }
            }
        }
        master.MemberBetsCtrl = MemberBetsCtrl;
        angular.module('intranet.master').controller('memberBetsCtrl', MemberBetsCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=XMemberBetsCtrl.js.map