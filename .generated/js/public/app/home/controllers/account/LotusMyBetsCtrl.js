var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class LotusMyBetsCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, betService, betHistoryService, settings) {
                super($scope);
                this.toasterService = toasterService;
                this.betService = betService;
                this.betHistoryService = betHistoryService;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                };
                this.$scope.betStatus = 2;
                this.$scope.liveGamesId = this.settings.LiveGamesId;
                this.$scope.dataForCurrent = true;
            }
            loadInitialData() {
            }
            getMatchedBets(params) {
                var searchQuery = { status: 2, side: -1 };
                return this.betService.getBets({ searchQuery: searchQuery, params: params });
            }
            getUnmatchedBets(params) {
                var searchQuery = { status: 3, side: -1 };
                return this.betService.getBets({ searchQuery: searchQuery, params: params });
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
            cancelBet(id) {
                this.betService.cancelBet(id)
                    .success((response) => {
                    if (response.success) {
                        this.betSideChanged(3);
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
            }
            getHistoryBets(params) {
                this.$scope.dataForCurrent = false;
                var searchQuery = {
                    status: 'settled',
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params });
            }
            refreshHistoryGrid() {
                this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
            }
            search() {
                if (this.$scope.dataForCurrent) {
                    this.betSideChanged(this.$scope.betStatus);
                }
                else {
                    this.refreshHistoryGrid();
                }
            }
        }
        home.LotusMyBetsCtrl = LotusMyBetsCtrl;
        angular.module('intranet.home').controller('lotusMyBetsCtrl', LotusMyBetsCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LotusMyBetsCtrl.js.map