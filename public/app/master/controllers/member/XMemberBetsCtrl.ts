module intranet.master {
    export interface IMemberBetsScope extends intranet.common.IScopeBase {
        search: any;
        dataForCurrent: boolean;

        // 2=matched,3=unmatched
        betStatus: any;
        totalRows: any;

        liveGamesId: any;
    }

    export class MemberBetsCtrl extends intranet.common.ControllerBase<IMemberBetsScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMemberBetsScope,
            private toasterService: intranet.common.services.ToasterService,
            private betService: services.BetService,
            private betHistoryService: services.BetHistoryService,
            private $stateParams: any,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().startOf('day').format("DD MMM YYYY HH:mm:ss")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm:ss"))
            };
            this.$scope.totalRows = 0;
            this.$scope.betStatus = 2;
            this.$scope.liveGamesId = this.settings.LiveGamesId;
            this.$scope.dataForCurrent = true;
        }

        public loadInitialData(): void {

        }

        private getMatchedBets(params: any): any {
            var searchQuery = { status: 2, side: -1 };
            if (this.$stateParams.memberid) {
                return this.betService.getBetsById({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
            } else {
                return this.betService.getBets({ searchQuery: searchQuery, params: params });
            }
        }

        private getUnmatchedBets(params: any): any {
            var searchQuery = { status: 3, side: -1 };
            if (this.$stateParams.memberid) {
                return this.betService.getBetsById({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
            } else {
                return this.betService.getBets({ searchQuery: searchQuery, params: params });
            }
        }

        private betSideChanged(status: any): void {
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


        private getHistoryBets(params: any): any {
            this.$scope.dataForCurrent = false;
            var searchQuery: any = {
                status: 'settled',
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            if (this.$stateParams.memberid) {
                return this.betHistoryService.getHistoryBetsById({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
            } else {
                return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params });
            }
        }

        private refreshHistoryGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
        }

        private search(): void {
            this.$scope.totalRows = 0;
            if (this.$scope.dataForCurrent) { this.betSideChanged(this.$scope.betStatus); }
            else { this.refreshHistoryGrid(); }
        }
    }
    angular.module('intranet.master').controller('memberBetsCtrl', MemberBetsCtrl);
}