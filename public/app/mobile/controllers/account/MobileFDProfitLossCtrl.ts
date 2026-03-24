
module intranet.home {
    export interface IMobileFDProfitLossScope extends intranet.common.IScopeBase {
        search: { fromdate: any, todate: any };
        totalRows: any;
        dateDiff: any;
    }

    export class MobileFDProfitLossCtrl extends intranet.common.ControllerBase<IMobileFDProfitLossScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileFDProfitLossScope,
            private fdService: services.FDService,
            private commonDataService: common.services.CommonDataService,
            private $stateParams: any,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().add(-6, 'd').format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
        }

        public loadInitialData(): void {
            //this.setDates(-1, 'M');
        }


        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private getTableProvider(p: any) { return common.enums.TableProvider[p]; }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
        }
        private getProfitLoss(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
            };
            this.$scope.dateDiff = moment(searchQuery.toDate).diff(searchQuery.fromDate, 'days');
            params.groupBy = 'round';
            if (this.$stateParams.memberid) {
                searchQuery.userId = this.$stateParams.memberid;
            }
            return this.fdService.getPLbyUser({ searchQuery: searchQuery, params: params });
        }

    }
    angular.module('intranet.home').controller('mobileFDProfitLossCtrl', MobileFDProfitLossCtrl);
}