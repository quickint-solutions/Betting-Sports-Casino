module intranet.home {
    export interface ILotusMyBetsScope extends intranet.common.IScopeBase {
        search: any;
        dataForCurrent: boolean;

        // 2=matched,3=unmatched
        betStatus: any;

        liveGamesId: any;
    }

    export class LotusMyBetsCtrl extends intranet.common.ControllerBase<ILotusMyBetsScope>
        implements intranet.common.init.IInit {
        constructor($scope: ILotusMyBetsScope,
            private toasterService: intranet.common.services.ToasterService,
            private betService: services.BetService,
            private betHistoryService: services.BetHistoryService,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
            this.$scope.betStatus = 2;
            this.$scope.liveGamesId = this.settings.LiveGamesId;
            this.$scope.dataForCurrent = true;
        }

        public loadInitialData(): void {
           
        }

        private getMatchedBets(params: any): any {
            var searchQuery = { status: 2, side: -1 };
            return this.betService.getBets({ searchQuery: searchQuery, params: params });
        }

        private getUnmatchedBets(params: any): any {
            var searchQuery = { status: 3, side: -1 };
            return this.betService.getBets({ searchQuery: searchQuery, params: params });
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

        private cancelBet(id: any): void {
            this.betService.cancelBet(id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.betSideChanged(3);
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
        }

        private getHistoryBets(params: any): any {
            this.$scope.dataForCurrent = false;
            var searchQuery: any = {
                status: 'settled',
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params });
        }

        private refreshHistoryGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
        }

        private search(): void {
            if (this.$scope.dataForCurrent) { this.betSideChanged(this.$scope.betStatus); }
            else { this.refreshHistoryGrid(); }
        }
    }
    angular.module('intranet.home').controller('lotusMyBetsCtrl', LotusMyBetsCtrl);
}