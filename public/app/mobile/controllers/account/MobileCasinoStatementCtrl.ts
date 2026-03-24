module intranet.mobile.account {
    export interface IMobileCasinoStatementScope extends intranet.common.IScopeBase {
        userid: any;
        accountTypeList: any[];
        search: { accountType: any, fromdate: any, todate: any };
    }

    export class MobileCasinoStatementCtrl extends intranet.common.ControllerBase<IMobileCasinoStatementScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileCasinoStatementScope,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private exportService: services.ExportService,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                accountType: '-1',
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
        }

        public loadInitialData(): void {
            this.getUserId();
            this.fillAccountType()
        }

        private fillAccountType(): void {
            this.$scope.accountTypeList = [];
            var actypes: any = common.enums.AccountType;
            this.$scope.accountTypeList = common.helpers.Utility.enumToArray<common.enums.AccountType>(actypes);
            this.$scope.accountTypeList = this.$scope.accountTypeList.filter((a: any) => {
                return  a.id == common.enums.AccountType.CasinoPL
            });
            this.$scope.accountTypeList.splice(0, 0, { id: -1, name: '-- Select Account Type --' });
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-accountstatement-grid');
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.refreshGrid();
        }

        private getUserId(): void {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                this.$scope.userid = result.id;
            }
        }

        private getAccountStatement(params: any): any {
            var searchQuery = {
                accountType: this.$scope.search.accountType == '-1' ? '' : this.$scope.search.accountType,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            return this.accountService.getCasinoStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }

        private exportAccountStatement(params: any, exportType: any): any {
            var searchQuery = {
                accountType: this.$scope.search.accountType == '-1' ? '' : this.$scope.search.accountType,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            return this.exportService.casinoStatement({ searchQuery: searchQuery, exportType: exportType, params: params, id: this.$scope.userid })
        }
    }
    angular.module('intranet.mobile.account').controller('mobileCasinoStatementCtrl', MobileCasinoStatementCtrl);
}