module intranet.home {
    export interface ICasinoStatementScope extends intranet.common.IScopeBase {
        userid: any;
        userType: any;
        accountTypeList: any[];
        search: { accountType: any, fromdate: any, todate: any };

        headerLabel: string;
        isCurrentStatement: boolean;
    }

    export class CasinoStatementCtrl extends intranet.common.ControllerBase<ICasinoStatementScope>
        implements intranet.common.init.IInit {
        constructor($scope: ICasinoStatementScope,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private exportService: services.ExportService,
            private $stateParams: any,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.userType = 0;
            this.$scope.search = {
                accountType: '-1',
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
            this.statementModeChange();
        }

        public loadInitialData(): void {
            this.getUserId();
        }

        private getGameType(usertype: any): string {
            return common.enums.EzugiGameType[usertype];
        }

        private fillAccountType(): void {
            this.$scope.accountTypeList = [];
            var actypes: any = common.enums.AccountType;
            this.$scope.accountTypeList = common.helpers.Utility.enumToArray<common.enums.AccountType>(actypes);
            this.$scope.accountTypeList = this.$scope.accountTypeList.filter((a: any) => {
                return a.id == common.enums.AccountType.CasinoPL
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
            if (this.$stateParams.memberid) { this.$scope.userid = this.$stateParams.memberid; }
            else {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.userid = result.id;
                    this.$scope.userType = result.userType;
                }
            }
            this.fillAccountType();
        }

        private getAccountStatement(params: any): any {
            var searchQuery = {
                accountType: this.$scope.search.accountType == '-1' ? '' : this.$scope.search.accountType,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            if (this.$scope.isCurrentStatement) {
                return this.accountService.getCasinoStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            } else {
                return this.accountService.getSettleCasinoStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
            }
        }

        private exportAccountStatement(params: any, exportType: any): any {
            var searchQuery = {
                accountType: this.$scope.search.accountType == '-1' ? '' : this.$scope.search.accountType,
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            if (this.$scope.isCurrentStatement) {
                return this.exportService.casinoStatement({ searchQuery: searchQuery, exportType: exportType, params: params, id: this.$scope.userid })
            } else {
                return this.exportService.settleCasinoStatement({ searchQuery: searchQuery, exportType: exportType, params: params, id: this.$scope.userid })
            }
        }

        private statementModeChange(isCurrent: boolean = true): void {
            this.$scope.isCurrentStatement = isCurrent;
            if (isCurrent) {
                this.$scope.headerLabel = 'common.casinostatement.label';
                this.setDates(-1, 'd');
            } else {
                this.$scope.headerLabel = 'historical.casinostatement.label';
                this.setDates(-2, 'M');
            }
        }
    }
    angular.module('intranet.home').controller('casinoStatementCtrl', CasinoStatementCtrl);
}