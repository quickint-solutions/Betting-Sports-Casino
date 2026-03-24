var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class ResultsCtrl extends intranet.common.ControllerBase {
            constructor($scope, $timeout, commonDataService, settings, marketService) {
                super($scope);
                this.$timeout = $timeout;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.marketService = marketService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.resultsList = [];
                this.$scope.selectAll = true;
            }
            loadInitialData() {
                this.getRecentResults();
                this.loadEventTypes();
            }
            loadEventTypes() {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    this.$scope.filters = value;
                    if (this.$scope.filters.length > 0) {
                        this.$scope.filters = this.$scope.filters.filter((a) => { return a.id != this.settings.LiveGamesId; });
                        this.$scope.filters.forEach((a) => { a.checked = true; });
                    }
                });
            }
            eventTypeChanged(all = false) {
                if (all) {
                    this.$scope.filters.forEach((a) => { a.checked = this.$scope.selectAll; });
                }
                else {
                    var result = this.$scope.filters.every((a) => { return a.checked == true; });
                    this.$scope.selectAll = result;
                }
            }
            getRecentResults() {
                var eventTypeIds = [];
                if (!this.$scope.selectAll) {
                    this.$scope.filters.forEach((a) => { if (a.checked) {
                        eventTypeIds.push(a.id);
                    } });
                }
                this.marketService.getRecentClose(eventTypeIds)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.resultsList = response.data;
                    }
                });
            }
        }
        home.ResultsCtrl = ResultsCtrl;
        angular.module('intranet.home').controller('resultsCtrl', ResultsCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ResultsCtrl.js.map