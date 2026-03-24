module intranet.mobile.account {
    export interface IMobileBetHistoryScope extends intranet.common.IScopeBase {
        betStatus: any[];
        betSides: any[];
        search: { status: any, fromdate: any, todate: any };
        bet_status: any;

        liveGamesId: any;
    }

    export class MobileBetHistoryCtrl extends intranet.common.ControllerBase<IMobileBetHistoryScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileBetHistoryScope,
            private exportService: services.ExportService,
            private settings: common.IBaseSettings,
            private betHistoryService: services.BetHistoryService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.liveGamesId = this.settings.LiveGamesId;
            this.$scope.betStatus = [];
            this.$scope.betSides = [];
            this.$scope.search = {
                status: '',
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };

            
        }

        public loadInitialData(): void {

            this.$scope.betSides.push({ id: 1, name: 'Back' });
            this.$scope.betSides.push({ id: 2, name: 'Lay' });

            this.fillBetStatus();
        }

        private fillBetStatus(): void {
            this.$scope.betStatus.push({ id: 'settled', name: 'Settled' });
            this.$scope.betStatus.push({ id: 'cancelled', name: 'Cancelled' });
            this.$scope.betStatus.push({ id: 'voided', name: 'Voided' });
            this.$scope.search.status = this.$scope.betStatus[0].id;
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
        }

        private getHistoryBets(params: any): any {
            var searchQuery = {
                status: this.$scope.search.status,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            this.$scope.bet_status = searchQuery.status;
            return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params });
        }

        private exportBetHistory(params: any, exportType: any): any {
            var searchQuery = {
                status: this.$scope.search.status,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };

            return this.exportService.historyBet({ exportType: exportType, searchQuery: searchQuery, params: params });
        }
    }
    angular.module('intranet.mobile.account').controller('mobileBetHistoryCtrl', MobileBetHistoryCtrl);
}