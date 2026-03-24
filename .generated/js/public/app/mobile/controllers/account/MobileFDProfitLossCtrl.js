var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MobileFDProfitLossCtrl extends intranet.common.ControllerBase {
            constructor($scope, fdService, commonDataService, $stateParams, settings) {
                super($scope);
                this.fdService = fdService;
                this.commonDataService = commonDataService;
                this.$stateParams = $stateParams;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    fromdate: new Date(moment().add(-6, 'd').format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                };
            }
            loadInitialData() {
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.refreshGrid();
            }
            getTableProvider(p) { return intranet.common.enums.TableProvider[p]; }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
            }
            getProfitLoss(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                };
                this.$scope.dateDiff = moment(searchQuery.toDate).diff(searchQuery.fromDate, 'days');
                params.groupBy = 'round';
                if (this.$stateParams.memberid) {
                    searchQuery.userId = this.$stateParams.memberid;
                }
                return this.fdService.getPLbyUser({ searchQuery: searchQuery, params: params });
            }
        }
        home.MobileFDProfitLossCtrl = MobileFDProfitLossCtrl;
        angular.module('intranet.home').controller('mobileFDProfitLossCtrl', MobileFDProfitLossCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileFDProfitLossCtrl.js.map