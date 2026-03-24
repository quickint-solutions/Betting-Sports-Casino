module intranet.admin {

    export interface ISAStatementsScope extends intranet.common.IScopeBase {
        search: { fromdate: any, todate: any };
        canILoad: any;
        userid: any;
        totalPL: any;
    }

    export class SAStatementsCtrl extends intranet.common.ControllerBase<ISAStatementsScope>
        implements common.init.IInit {
        constructor($scope: ISAStatementsScope,
            private accountService: services.AccountService,
            private $q: ng.IQService,
            private commonDataService: common.services.CommonDataService,
            private settings: common.IBaseSettings) {
            super($scope);
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
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                this.$scope.userid = result.id;
            }

            this.setDates(-7, 'd');
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private refreshGrid(): void {
            this.$scope.canILoad = true;
            this.$scope.$broadcast('refreshGridWithoutSorting');
        }

        private getPLStatement(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            var defer = this.$q.defer();
            this.accountService.getPLStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid })
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.totalPL = response.data.totalPnl;
                        defer.resolve(response.data);
                    }
                }).error(() => { defer.reject(); });
            return defer.promise;
        }

        private getCreditStatement(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
            };
            return this.accountService.getCreditStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }

        private getTransferStatement(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }
    }
    angular.module('intranet.admin').controller('sAStatementsCtrl', SAStatementsCtrl);
}