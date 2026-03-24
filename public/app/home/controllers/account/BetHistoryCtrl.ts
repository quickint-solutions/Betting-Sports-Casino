module intranet.home {
    export interface IBetHistoryScope extends intranet.common.IScopeBase {
        betStatus: any[];
        betSides: any[];
        search: any;
        bet_status: any;
        liveGamesId: any;

        promiseItem: any;
        memberList: any[];
        member: any;
    }

    export class BetHistoryCtrl extends intranet.common.ControllerBase<IBetHistoryScope>
        implements intranet.common.init.IInit {
        constructor($scope: IBetHistoryScope,
            private $stateParams: any,
            private exportService: services.ExportService,
            private settings: common.IBaseSettings,
            private betHistoryService: services.BetHistoryService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
            var searchQuery: any = {
                status: this.$scope.search.status,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
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

        private exportBetHistory(params: any, exportType: any): any {
            var searchQuery: any = {
                status: this.$scope.search.status,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
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
    angular.module('intranet.home').controller('betHistoryCtrl', BetHistoryCtrl);
}