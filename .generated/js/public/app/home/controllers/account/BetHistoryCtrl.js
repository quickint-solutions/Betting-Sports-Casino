var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class BetHistoryCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, exportService, settings, betHistoryService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.exportService = exportService;
                this.settings = settings;
                this.betHistoryService = betHistoryService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.betStatus = [];
                this.$scope.betSides = [];
                this.$scope.search = {
                    status: '',
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                };
                this.$scope.liveGamesId = this.settings.LiveGamesId;
                this.$scope.memberList = [];
                this.$scope.member = {};
            }
            loadInitialData() {
                this.$scope.betSides.push({ id: 1, name: 'Back' });
                this.$scope.betSides.push({ id: 2, name: 'Lay' });
                this.fillBetStatus();
            }
            fillBetStatus() {
                this.$scope.betStatus.push({ id: 'settled', name: 'Settled' });
                this.$scope.betStatus.push({ id: 'cancelled', name: 'Cancelled' });
                this.$scope.betStatus.push({ id: 'voided', name: 'Voided' });
                this.$scope.search.status = this.$scope.betStatus[0].id;
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.refreshGrid();
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
            }
            getHistoryBets(params) {
                var searchQuery = {
                    status: this.$scope.search.status,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$scope.member.selectedMember && this.$scope.member.selectedMember.userId) {
                    searchQuery.sourceUserId = this.$scope.member.selectedMember.userId;
                }
                if (this.$scope.search.userId) {
                    searchQuery.sourceUserId = this.$scope.search.userId;
                }
                if (this.$scope.search.platformUserId) {
                    searchQuery.platformUserId = this.$scope.search.platformUserId;
                }
                this.$scope.bet_status = searchQuery.status;
                if (this.$stateParams.memberid) {
                    return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
                }
                else {
                    return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params });
                }
            }
            exportBetHistory(params, exportType) {
                var searchQuery = {
                    status: this.$scope.search.status,
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                };
                if (this.$scope.member.selectedMember && this.$scope.member.selectedMember.userId) {
                    searchQuery.sourceUserId = this.$scope.member.selectedMember.userId;
                }
                if (this.$scope.search.userId) {
                    searchQuery.sourceUserId = this.$scope.search.userId;
                }
                if (this.$stateParams.memberid) {
                    return this.exportService.historyBetbyId({ exportType: exportType, searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
                }
                else {
                    return this.exportService.historyBet({ exportType: exportType, searchQuery: searchQuery, params: params });
                }
            }
        }
        home.BetHistoryCtrl = BetHistoryCtrl;
        angular.module('intranet.home').controller('betHistoryCtrl', BetHistoryCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetHistoryCtrl.js.map