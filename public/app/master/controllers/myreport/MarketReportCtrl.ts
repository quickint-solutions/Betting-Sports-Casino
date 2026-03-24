module intranet.master {
    export interface IMarketReportScope extends intranet.common.IScopeBase {
        search: any;
        eventTypeList: any[];
        userList: any[];
        promiseItem: any;
        currentUserType: any;
        totalRows: any;
    }

    export class MarketReportCtrl extends intranet.common.ControllerBase<IMarketReportScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMarketReportScope,
            private $stateParams: any,
            private $q: ng.IQService,
            private $state: any,
            private commonDataService: common.services.CommonDataService,
            private ExportFactory: any,
            private $filter: any,
            private userService: services.UserService,
            private eventTypeService: services.EventTypeService,
            private betHistoryService: services.BetHistoryService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.userList = [];
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
            };

            var loggeduser = this.commonDataService.getLoggedInUserData();
            if (loggeduser) { this.$scope.currentUserType = loggeduser.userType; }
            this.$scope.totalRows = 0;
        }

        public loadInitialData(): void {
            this.getEventTypes();
            if (!this.commonDataService.getDateFilter(this.$scope.search, 'market-date'))
                this.setDates(-1, 'D');
            else
                this.refreshReportGrid();
        }

        private getEventTypes(): void {
            this.eventTypeService.getEventTypes()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventTypeList = response.data;
                        this.$scope.eventTypeList.splice(0, 0, { id: '', name: 'All' });
                    }
                });
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).startOf('day').format("DD MMM YYYY HH:mm:ss"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm:ss"));
            this.refreshReportGrid();
        }

        private getPLbyMarket(params: any): any {
            this.commonDataService.storeDateFilter(this.$scope.search, 'market-date');
            var searchQuery = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                eventTypeId: this.$scope.search.eventType ? this.$scope.search.eventType.id : '',
                eventName: this.$scope.search.eventName,

            };
            if (this.$scope.search.selectedUser) {
                return this.betHistoryService.getPLbyMarket({ searchQuery: searchQuery, params: params, id: this.$scope.search.selectedUser.id });
            }
            else {
                return this.betHistoryService.getPLbyMarket({ searchQuery: searchQuery, params: params });
            }
        }

        private getPLDetail(item: any, touchShow: boolean = true, userId: any = ''): void {
            if (touchShow) item.show = !item.show;
            if (item.show) {
                this.betHistoryService.getPLbyMarketDetail(item.marketId, (this.$scope.search.selectedUser ? this.$scope.search.selectedUser.id : userId))
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            item.userPLInfo = response.data;
                        }
                    });
            }
        }

        private refreshReportGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-marketreport-grid');
        }

        private resetCriteria(): void {
            this.$scope.search = {
                eventType: { id: '', name: 'All' },
                eventName: '',
                selectedUser: undefined
            };
            this.setDates(-1, 'D');
        }

        private searchUser(search: any): void {
            if (search && search.length >= 3) {
                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }
                if (this.$stateParams.memberid) {
                    this.$scope.promiseItem = this.userService.findMembers(search, this.$stateParams.memberid);
                }
                else {
                    this.$scope.promiseItem = this.userService.findMembers(search);
                }

                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        this.$scope.userList = response.data;
                        if (this.$scope.userList && this.$scope.userList.length > 0) {
                            this.$scope.userList.forEach((u: any) => {
                                u.extra = super.getUserTypesObj(u.userType);
                            });
                        }
                    });
                }

            } else {
                this.$scope.userList.splice(0);
            }
        }

        private openBetReport(item: any): void {
            var obj = {
                marketTitle: item.eventName + ' - ' + item.marketName,
                backText: 'P&L Report By Market'
            }
            this.commonDataService.setShareData(obj);
            if (this.$scope.search.selectedUser) {
                this.$state.go('master.betreport', { marketId: item.marketId, userId: this.$scope.search.selectedUser.id });
            } else {
                this.$state.go('master.betreport', { marketId: item.marketId });
            }
        }



        private exportToExcel(tableId: any): void {
            this.commonDataService.storeDateFilter(this.$scope.search, 'market-date');
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id > 0 ? this.$scope.search.eventType.id : '',
                eventName: this.$scope.search.eventName,

            };
            if (this.$scope.search.selectedUser) {
                searchQuery.userId = this.$scope.search.selectedUser.id;
                this.betHistoryService.getPLbyMarketExport(searchQuery)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.exportExcel(response.data);
                        }
                    });
            }
            else {
                this.betHistoryService.getPLbyMarketExport(searchQuery)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.exportExcel(response.data);
                        }
                    });
            }


        }

        private exportExcel(data: any): void {
            if (data) {
                var table: string = '';
                var headerTD: string = '';
                var contentTD: string = '';
                var contentTR: string = '';

                angular.forEach(data, (d: any, index: any) => {
                    if (index == 0) {
                        headerTD = common.helpers.CommonHelper.wrapTD("Date");
                        headerTD += common.helpers.CommonHelper.wrapTD("Id");
                        headerTD += common.helpers.CommonHelper.wrapTD("Competition");
                        headerTD += common.helpers.CommonHelper.wrapTD("Event");
                        headerTD += common.helpers.CommonHelper.wrapTD("Market");
                        headerTD += common.helpers.CommonHelper.wrapTD("Winner");
                        headerTD += common.helpers.CommonHelper.wrapTD("Stakes");
                        headerTD += common.helpers.CommonHelper.wrapTD("Win");
                        headerTD += common.helpers.CommonHelper.wrapTD("Comm");
                        headerTD += common.helpers.CommonHelper.wrapTD("P&L");
                        table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                    }

                    contentTD = common.helpers.CommonHelper.wrapTD(moment(d.settleTime).format('DD/MM/YYYY'));
                    contentTD += common.helpers.CommonHelper.wrapTD(d.roundId);
                    contentTD += common.helpers.CommonHelper.wrapTD(d.competitionName);
                    contentTD += common.helpers.CommonHelper.wrapTD(d.eventName);
                    contentTD += common.helpers.CommonHelper.wrapTD(d.marketName);
                    contentTD += common.helpers.CommonHelper.wrapTD(d.winner);

                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(d.stake));
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(d.win));
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(d.commission));
                    contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(d.pnl));

                    contentTR += common.helpers.CommonHelper.wrapTR(contentTD);

                });
                table += common.helpers.CommonHelper.wrapTBody(contentTR);
                table = common.helpers.CommonHelper.wrapTable(table);

                this.ExportFactory.tableStringToExcel(table, 'P&L Report By Market');
            }
        }

        private viewCards(item: any): void {
            this.commonDataService.viewCards(item.market);
        }

        public formatWinner(winner: any, gametype: any): any {
            return this.commonDataService.formatLiveGameResult(winner, gametype);
        }
    }
    angular.module('intranet.master').controller('marketReportCtrl', MarketReportCtrl);
}