module intranet.master {
    export interface IDownlineSummaryScope extends intranet.common.IScopeBase {
        search: any;
        canILoad: boolean;
        gridItems: any[];

        loginUsername: any;
        currentUsershort: any;
        childUsershort: any;

        isChildClient: boolean;

        userTree: any[];
    }

    export class DownlineSummaryCtrl extends intranet.common.ControllerBase<IDownlineSummaryScope>
        implements intranet.common.init.IInit {
        constructor($scope: IDownlineSummaryScope,
            private $state: any,
            private $stateParams:any,
            private $filter: any,
            private commonDataService: common.services.CommonDataService,
            private userService: services.UserService,
            private ExportFactory: any,
            private betHistoryService: services.BetHistoryService) {
            super($scope);
            
            this.$scope.$on('$destroy', () => {
            });
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.canILoad = false;
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm:ss"))
            };
            this.$scope.userTree = [];
        }

        public loadInitialData(): void {
            if (!this.commonDataService.getDateFilter(this.$scope.search, 'downline-summary-date'))
                this.setDates(0, 'd');
            else
                this.refreshGrid();

            this.buildUserTreeForHeader();
            this.getUserTree();
        }

        private buildUserTreeForHeader(): void {
            var loggeduser = this.commonDataService.getLoggedInUserData();
            if (loggeduser) { this.$scope.loginUsername = loggeduser.username; }
            if (this.$stateParams.usertype) {
                this.$scope.childUsershort = super.getUserTypesShort(math.add(this.$stateParams.usertype, 1));
                this.$scope.currentUsershort = super.getUserTypesShort(this.$stateParams.usertype);
                this.$scope.isChildClient = math.add(this.$stateParams.usertype, 1) == common.enums.UserType.Player;
            }
            else {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser) {
                    this.$scope.childUsershort = super.getUserTypesShort(loggeduser.userType + 1);
                    this.$scope.currentUsershort = super.getUserTypesShort(loggeduser.userType);
                    this.$scope.isChildClient = math.add(loggeduser.userType, 1) == common.enums.UserType.Player;
                }
            }
        }

        private getUserTree(): void {
            if (this.$stateParams.memberid) {
                this.userService.getParentsByUserId(this.$stateParams.memberid)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            var result = response.data;
                            if (result) {
                                this.$scope.userTree.push({ id: result.id, name: result.username, userType: result.userType });
                                var parent = result.parent;
                                while (parent) {
                                    if (parent.username != 'sa') {
                                        this.$scope.userTree.push({ id: parent.id, name: parent.username, userType: parent.userType });
                                        if (parent.parent) { parent = parent.parent; }
                                        else { parent = null; }
                                    } else { parent = null; }
                                }
                                this.$scope.userTree = this.$scope.userTree.reverse();
                                //this.$scope.userTree.splice(0, 1);
                            }
                        }
                    });
            }
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
            this.refreshGrid();
        }

        private refreshGrid(): void {
            this.$scope.canILoad = true;
            this.$scope.$broadcast('refreshGrid_kt-downline-summary-grid');
        }

       
        private getItems(params: any): any {
            this.commonDataService.storeDateFilter(this.$scope.search, 'downline-summary-date');
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate)
            };
            if (this.$stateParams.memberid) {
                return this.betHistoryService.getDownlineSummary({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
            }
            else {
                return this.betHistoryService.getDownlineSummary({ searchQuery: searchQuery, params: params });
            }
        }

        private getPLDetail(item: any): void {
            item.show = !item.show;
            if (item.show) {
                var searchQuery = {
                    fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    reportOf: this.$scope.search.reportOf
                };
                var request = { id: item.user.id, searchQuery: searchQuery };
                this.betHistoryService.getDownlineSummaryDetails(request)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            item.eventTypes = response.data;
                        }
                    });
            }
        }

    }
    angular.module('intranet.master').controller('downlineSummaryCtrl', DownlineSummaryCtrl);
}