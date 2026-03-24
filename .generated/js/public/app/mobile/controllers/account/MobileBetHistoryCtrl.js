var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        var account;
        (function (account) {
            class MobileBetHistoryCtrl extends intranet.common.ControllerBase {
                constructor($scope, exportService, settings, betHistoryService) {
                    super($scope);
                    this.exportService = exportService;
                    this.settings = settings;
                    this.betHistoryService = betHistoryService;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.liveGamesId = this.settings.LiveGamesId;
                    this.$scope.betStatus = [];
                    this.$scope.betSides = [];
                    this.$scope.search = {
                        status: '',
                        fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                        todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                    };
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
                    this.$scope.bet_status = searchQuery.status;
                    return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params });
                }
                exportBetHistory(params, exportType) {
                    var searchQuery = {
                        status: this.$scope.search.status,
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate)
                    };
                    return this.exportService.historyBet({ exportType: exportType, searchQuery: searchQuery, params: params });
                }
            }
            account.MobileBetHistoryCtrl = MobileBetHistoryCtrl;
            angular.module('intranet.mobile.account').controller('mobileBetHistoryCtrl', MobileBetHistoryCtrl);
        })(account = mobile.account || (mobile.account = {}));
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileBetHistoryCtrl.js.map