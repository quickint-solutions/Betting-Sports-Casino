module intranet.home {

    export interface IResultsScope extends intranet.common.IScopeBase {
        resultsList: any[];
        filters: any[];
        selectAll: any;
    }

    export class ResultsCtrl extends intranet.common.ControllerBase<IResultsScope>
        implements intranet.common.init.IInit {
        constructor($scope: IResultsScope,
            public $timeout: ng.ITimeoutService,
            public commonDataService: common.services.CommonDataService,
            public settings: common.IBaseSettings,
            public marketService: services.MarketService) {
            super($scope);
            super.init(this);
        }


        public initScopeValues() {
            this.$scope.resultsList = [];
            this.$scope.selectAll = true;
        }

        public loadInitialData() {
            this.getRecentResults();
            this.loadEventTypes();
        }

        private loadEventTypes(): void {
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                this.$scope.filters = value;
                if (this.$scope.filters.length > 0) {
                    this.$scope.filters = this.$scope.filters.filter((a: any) => { return a.id != this.settings.LiveGamesId; });
                    this.$scope.filters.forEach((a: any) => { a.checked = true; });
                }
            });
        }

        private eventTypeChanged(all: boolean = false): void {
            if (all) {
                this.$scope.filters.forEach((a: any) => { a.checked = this.$scope.selectAll; });
            }
            else {
                var result = this.$scope.filters.every((a: any) => { return a.checked == true; });
                this.$scope.selectAll = result;
            }
        }

        private getRecentResults(): void {
            var eventTypeIds: any = [];
            if (!this.$scope.selectAll) {
                this.$scope.filters.forEach((a: any) => { if (a.checked) { eventTypeIds.push(a.id); } });
            }
            this.marketService.getRecentClose(eventTypeIds)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.resultsList = response.data;
                    }
                });
        }

    }

    angular.module('intranet.home').controller('resultsCtrl', ResultsCtrl);
}