module intranet.home {
    export interface IMemberTransferScope extends intranet.common.IScopeBase {
        userid: any;
        userType: any;
        gridItems: any[];
    }

    export class MemberTransferCtrl extends intranet.common.ControllerBase<IMemberTransferScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMemberTransferScope,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private ExportFactory: any,
            private $stateParams: any,
            private $filter: any,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.userType = 0;
        }

        public loadInitialData(): void {
            this.getUserId();
        }


        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }


        private getUserId(): void {
            if (this.$stateParams.memberid) {
                this.$scope.userid = this.$stateParams.memberid;
                this.$scope.userType = this.$stateParams.usertype;
            }
            else {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.userid = result.id;
                    this.$scope.userType = result.userType;
                }
            }
        }

        private getTransferStatement(params: any): any {
            var searchQuery: any = {
                //accountType: common.enums.AccountType.Chips,
                fromDate: common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                toDate: common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
            };
            return this.accountService.getTransferStatement({ searchQuery: searchQuery, params: params, id: this.$scope.userid });
        }

        private exportDataToExcel(): void {
            var searchQuery: any = {
                //accountType: common.enums.AccountType.Chips,
                fromDate: common.helpers.Utility.fromDateUTC(new Date(moment().add(-180, 'd').format("DD MMM YYYY HH:mm"))),
                toDate: common.helpers.Utility.toDateUTC(new Date(moment().format("DD MMM YYYY HH:mm")))
            };
            this.accountService.getTransferStatementExport({ searchQuery: searchQuery, id: this.$scope.userid })
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        var gridData = response.data;
                        if (gridData) {
                            var table: string = '';
                            var headerTD: string = '';
                            var contentTD: string = '';
                            var contentTR: string = '';

                            angular.forEach(gridData, (g: any, gindex: any) => {
                                if (gindex == 0) {
                                    headerTD += common.helpers.CommonHelper.wrapTD("Date (GMT)");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Time");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Payer/Payee");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Amount");
                                    headerTD += common.helpers.CommonHelper.wrapTD("Notes");
                                    table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                                }
                                contentTD = common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY'));
                                contentTD += common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('HH:mm:ss'));
                                contentTD += common.helpers.CommonHelper.wrapTD(g.remarks);
                                contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.balance));
                                contentTD += common.helpers.CommonHelper.wrapTD(g.comment);
                                contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                            });
                            table += common.helpers.CommonHelper.wrapTBody(contentTR);
                            table = common.helpers.CommonHelper.wrapTable(table);
                            this.ExportFactory.tableStringToExcel(table, 'Transfer Statement');
                        }
                    }
                });


        }
    }
    angular.module('intranet.master').controller('memberTransferCtrl', MemberTransferCtrl);
}