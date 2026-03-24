module intranet.mobile.account {
    export interface IMobileCurrentBetScope extends intranet.common.IScopeBase {
        betStatus: any[];
        betSides: any[];
        search: { status: any, betside: any };
        totalMatched: number;
        totalUnmatched: number;
    }

    export class MobileCurrentBetCtrl extends intranet.common.ControllerBase<IMobileCurrentBetScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileCurrentBetScope,
            private exportService: services.ExportService,
            private betService: services.BetService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.betStatus = [];
            this.$scope.betSides = [];
            this.$scope.search = { status: '-1', betside: '-1' };
        }

        public loadInitialData(): void {
            this.fillBetStatus();
            this.fillBetSides();

        }

        private fillBetStatus(): void {
            this.$scope.betStatus.push({ id: -1, name: 'All' });
            this.$scope.betStatus.push({ id: 2, name: 'Matched' });
            this.$scope.betStatus.push({ id: 3, name: 'Unmatched' });
        }

        private fillBetSides(): void {
            this.$scope.betSides.push({ id: -1, name: 'All' });
            this.$scope.betSides.push({ id: 1, name: 'Back' });
            this.$scope.betSides.push({ id: 2, name: 'Lay' });
        }

        private getMatchedBets(params: any): any {
            var searchQuery = { status: 2, side: this.$scope.search.betside };
            return this.betService.getBets({ searchQuery: searchQuery, params: params });
        }

        private getUnmatchedBets(params: any): any {
            var searchQuery = { status: 3, side: this.$scope.search.betside };
            return this.betService.getBets({ searchQuery: searchQuery, params: params });
        }

        private exportMatchedBets(params: any, exportType: any): any {
            var searchQuery = { status: 2, side: this.$scope.search.betside };
            return this.exportService.currentBets({ exportType: exportType, searchQuery: searchQuery, params: params });
        }

        private exportUnmatchedBets(params: any, exportType: any): any {
            var searchQuery = { status: 3, side: this.$scope.search.betside };
            return this.exportService.currentBets({ exportType: exportType, searchQuery: searchQuery, params: params });
        }

        private betSideChanged(): void {
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
    angular.module('intranet.mobile.account').controller('mobileCurrentBetCtrl', MobileCurrentBetCtrl);
}