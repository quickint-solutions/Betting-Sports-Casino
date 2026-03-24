
module intranet.admin {

    export interface ISAPaymorSummaryScope extends intranet.common.IScopeBase {
        search: { fromdate: any, todate: any };
        canILoad: any;
    }

    export class SAPaymorSummaryCtrl extends intranet.common.ControllerBase<ISAPaymorSummaryScope>
        implements common.init.IInit {
        constructor($scope: ISAPaymorSummaryScope,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService) {
            super($scope);


            this.$scope.$on('$destroy', () => {
            });

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
            this.$scope.canILoad = false;
        }

        public loadInitialData(): void {
            this.setDates(-7, 'M');
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private refreshGrid(): void {
            if (!this.$scope.canILoad) this.$scope.canILoad = true;
            else {
                this.$scope.$broadcast('refreshGrid');
            }
        }


        private getPaymorSummary(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTCZero(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTCZero(this.$scope.search.todate)
            };
            return this.accountService.getPaymorSummary({ searchQuery: searchQuery, params: params });
        }

        public getReceiptImage(request: any) {
            this.commonDataService.showReceiptModal(this.$scope, request, true);
        }

    }
    angular.module('intranet.admin').controller('sAPaymorSummaryCtrl', SAPaymorSummaryCtrl);
}