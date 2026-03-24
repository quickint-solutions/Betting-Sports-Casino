var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAPaymorSummaryCtrl extends intranet.common.ControllerBase {
            constructor($scope, accountService, commonDataService) {
                super($scope);
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.$scope.$on('$destroy', () => {
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                };
                this.$scope.canILoad = false;
            }
            loadInitialData() {
                this.setDates(-7, 'M');
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.refreshGrid();
            }
            refreshGrid() {
                if (!this.$scope.canILoad)
                    this.$scope.canILoad = true;
                else {
                    this.$scope.$broadcast('refreshGrid');
                }
            }
            getPaymorSummary(params) {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTCZero(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTCZero(this.$scope.search.todate)
                };
                return this.accountService.getPaymorSummary({ searchQuery: searchQuery, params: params });
            }
            getReceiptImage(request) {
                this.commonDataService.showReceiptModal(this.$scope, request, true);
            }
        }
        admin.SAPaymorSummaryCtrl = SAPaymorSummaryCtrl;
        angular.module('intranet.admin').controller('sAPaymorSummaryCtrl', SAPaymorSummaryCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAPaymorSummaryCtrl.js.map