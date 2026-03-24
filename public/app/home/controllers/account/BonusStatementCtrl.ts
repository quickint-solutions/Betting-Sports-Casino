module intranet.home {

    export interface IBonusStatementScope extends intranet.common.IScopeBase {
        userid: any;
        search: { fromdate: any, todate: any };
    }

    export class BonusStatementCtrl extends intranet.common.ControllerBase<IBonusStatementScope>
        implements intranet.common.init.IInit {
        constructor($scope: IBonusStatementScope,
            private $stateParams: any,
            private commonDataService: common.services.CommonDataService,
            private accountService: services.AccountService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues() {
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
            this.setDates(-3, 'M');
        }

        public loadInitialData() {
            this.getUserId();
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private getUserId(): void {
            if (this.$stateParams.memberid) { this.$scope.userid = this.$stateParams.memberid; }
            else {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.userid = result.id;
                }
            }
        }

        private getBonusStatement(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            return this.accountService.getBonusStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }
    }
    angular.module('intranet.home').controller('bonusStatementCtrl', BonusStatementCtrl);
}