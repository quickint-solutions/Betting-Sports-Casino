module intranet.home {
    export interface IFDBetHistoryScope extends intranet.common.IScopeBase {
        search: any;
        promiseItem: any;
        memberList: any[];
        member: any;
    }

    export class FDBetHistoryCtrl extends intranet.common.ControllerBase<IFDBetHistoryScope>
        implements intranet.common.init.IInit {
        constructor($scope: IFDBetHistoryScope,
            private $stateParams: any,
            private ExportFactory: any,
            private $filter: any,
            private fdService: services.FDService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                roundId: '',
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };

            this.$scope.memberList = [];
            this.$scope.member = {};
        }

        public loadInitialData(): void {

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
                roundId: this.$scope.search.roundId,
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
            

            if (this.$stateParams.memberid) {
                return this.fdService.getBetHistory({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
            }
            else {
                return this.fdService.getBetHistory({ searchQuery: searchQuery, params: params });
            }
        }

        private exportBetHistory(params: any, exportType: any) {
            var searchQuery: any = {
                roundId: this.$scope.search.roundId,
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
                this.fdService.getBetHistoryExport({ exportType: exportType, searchQuery: searchQuery, params: params, id: this.$stateParams.memberid })
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) { this.exportData(response.data); }
                    });
            }
            else {
                this.fdService.getBetHistoryExport({ exportType: exportType, searchQuery: searchQuery, params: params })
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) { this.exportData(response.data); }
                    });
            }
        }

        private exportData(gridData): void {
            if (gridData) {
                var table: string = '';
                var headerTD: string = '';
                var contentTD: string = '';
                var contentTR: string = '';

                angular.forEach(gridData, (g: any, gindex: any) => {
                    if (gindex == 0) {
                        headerTD += common.helpers.CommonHelper.wrapTD("BetId");
                        headerTD += common.helpers.CommonHelper.wrapTD("User");
                        headerTD += common.helpers.CommonHelper.wrapTD("Round Id");
                        headerTD += common.helpers.CommonHelper.wrapTD("Market");
                        headerTD += common.helpers.CommonHelper.wrapTD("Runner");
                        headerTD += common.helpers.CommonHelper.wrapTD("Side");
                        headerTD += common.helpers.CommonHelper.wrapTD("Price");
                        headerTD += common.helpers.CommonHelper.wrapTD("Size");
                        headerTD += common.helpers.CommonHelper.wrapTD("PL");
                        headerTD += common.helpers.CommonHelper.wrapTD("Created On");
                        headerTD += common.helpers.CommonHelper.wrapTD("Remote Ip");
                        table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                    }
                    contentTD = common.helpers.CommonHelper.wrapTD(g.betId);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.user.username);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.roundId);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.tableName);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.runner);
                    contentTD += common.helpers.CommonHelper.wrapTD(g.side == 1 ? 'Back' : 'Lay');
                    contentTD += common.helpers.CommonHelper.wrapTD(g.price);
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.size));
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.pl));
                    contentTD += common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                    contentTD += common.helpers.CommonHelper.wrapTD(g.remoteIp);
                    contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                });
                table += common.helpers.CommonHelper.wrapTBody(contentTR);
                table = common.helpers.CommonHelper.wrapTable(table);
                this.ExportFactory.tableStringToExcel(table, 'FD Bet-History');
            }
        }
    }
    angular.module('intranet.home').controller('fdBetHistoryCtrl', FDBetHistoryCtrl);
}