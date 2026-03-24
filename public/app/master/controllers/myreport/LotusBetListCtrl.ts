
module intranet.master {
    export interface ILotusBetListsScope extends intranet.common.IScopeBase {
        search: any;
        dataForCurrent: boolean;
        currentUserType: any;
        gridItems: any[];

        // 2=matched,3=unmatched
        betStatus: any;
        totalRows: any;

        isBetCountChanged: boolean;
        timer_position: any;
        eventTypeList: any[];
        marketTypeList: any[];

        liveGamesId: any;

        userPTtree: any[];

        userList: any[];
        promiseItem: any;
    }

    export class LotusBetListCtrl extends intranet.common.ControllerBase<ILotusBetListsScope>
        implements intranet.common.init.IInit {
        constructor($scope: ILotusBetListsScope,
            private toasterService: intranet.common.services.ToasterService,
            private betService: services.BetService,
            private $timeout: ng.ITimeoutService,
            protected $rootScope: any,
            private betHistoryService: services.BetHistoryService,
            private eventTypeService: services.EventTypeService,
            private commonDataService: common.services.CommonDataService,
            private ExportFactory: any,
            private $filter: any,
            private marketService: services.MarketService,
            private userService: services.UserService,
            private $stateParams: any,
            private settings: common.IBaseSettings) {
            super($scope);

            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    this.$scope.isBetCountChanged = true;
                }
            });


            this.$scope.$on('$destroy', () => {
                wsListner();
                this.$timeout.cancel(this.$scope.timer_position);
            });
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().startOf('day').format("DD MMM YYYY HH:mm:ss")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm:ss")),
                eventType: { id: '', name: 'All' },
                eventName: '',
                oddsfrom: '',
                oddsto: '',
                stakefrom: '',
                staketo: '',
                selectedUser: undefined,
                marketType: { id: '', displayName: 'All' },
            };

            this.$scope.totalRows = 0;
            this.$scope.betStatus = 2;
            this.$scope.liveGamesId = this.settings.LiveGamesId;
            this.$scope.dataForCurrent = true;
            this.$scope.userPTtree = [];
            this.$scope.userList = [];
        }

        public loadInitialData(): void {
            this.buildUserTreeForPT();
            this.getEventTypes();
            this.getMarketTypes();
            this.startTimer();
        }

        private buildUserTreeForPT(): void {
            if (this.$stateParams.usertype) {
                this.$scope.currentUserType = this.$stateParams.usertype;
                this.$scope.userPTtree = super.getUserTypeForPT(this.$stateParams.usertype);
                this.$scope.userPTtree = this.$scope.userPTtree.reverse();
            }
            else {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser) {
                    this.$scope.currentUserType = loggeduser.userType;
                    this.$scope.userPTtree = super.getUserTypeForPT(loggeduser.userType);
                    this.$scope.userPTtree = this.$scope.userPTtree.reverse();
                }
            }
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

        private getMarketTypes(): void {
            this.marketService.getAllMarketTypeMapping()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.marketTypeList = [];
                        angular.forEach(response.data, (d: any) => {
                            this.$scope.marketTypeList.push({ id: d.marketTypeCode, displayName: d.displayName });
                        });
                        this.$scope.marketTypeList.splice(0, 0, { id: '', displayName: 'All' });
                    }
                });
        }

        private rangeChanged(ranger: any, self: any, other: any): void {
            ranger[self] = !ranger[self];
            if (ranger[self]) { ranger[other] = false; }
        }

        private getMatchedBets(params: any): any {
            this.$scope.gridItems = [];
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                status: "matched",
                eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                marketTypeCode: this.$scope.search.marketType && this.$scope.search.marketType.id ? this.$scope.search.marketType.id : '',
                eventName: this.$scope.search.eventName,
                oddsfrom: this.$scope.search.oddsfrom,
                oddsto: this.$scope.search.oddsto,
                stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),

            };

            if (params && params.orderBy == '') {
                params.orderBy = 'createdon';
                params.orderByDesc = true;
            }

            if (this.$scope.search.selectedUser) {
                return this.betService.getLiveBets({ searchQuery: searchQuery, params: params, id: this.$scope.search.selectedUser.id });
            }
            else if (this.$stateParams.memberid) {
                return this.betService.getLiveBets({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
            } else {
                return this.betService.getLiveBets({ searchQuery: searchQuery, params: params });
            }

        }

        private getUnmatchedBets(params: any): any {
            this.$scope.gridItems = [];
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                status: "unmatched",
                eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                marketTypeCode: this.$scope.search.marketType && this.$scope.search.marketType.id ? this.$scope.search.marketType.id : '',
                eventName: this.$scope.search.eventName,
                oddsfrom: this.$scope.search.oddsfrom,
                oddsto: this.$scope.search.oddsto,
                stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),
            };

            if (params && params.orderBy == '') {
                params.orderBy = 'createdon';
                params.orderByDesc = true;
            }

            if (this.$scope.search.selectedUser) {
                return this.betService.getLiveBets({ searchQuery: searchQuery, params: params, id: this.$scope.search.selectedUser.id });
            }
            else if (this.$stateParams.memberid) {
                return this.betService.getLiveBets({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
            } else {
                return this.betService.getLiveBets({ searchQuery: searchQuery, params: params });
            }
        }

        private fetchLiveBetsData(): void {
            if (this.$scope.betStatus == 2) {
                var refreshCMD = "refreshGrid";
                refreshCMD = refreshCMD + "_kt-matchedbets-grid";
                this.$scope.$broadcast(refreshCMD);
            }
            if (this.$scope.betStatus == 3) {
                var refreshCMD = "refreshGrid";
                refreshCMD = refreshCMD + "_kt-unmatchedbets-grid";
                this.$scope.$broadcast(refreshCMD);
            }
        }

        private betSideChanged(status: any): void {
            this.$scope.betStatus = status;
            this.fetchLiveBetsData();
        }

        private startTimer(start: boolean = true): void {
            if (!start) {
                this.$timeout.cancel(this.$scope.timer_position);
            }
            else {
                this.$timeout.cancel(this.$scope.timer_position);
                var selectedInterval = 9;
                var startdelay = (() => {
                    if (selectedInterval > 0) {
                        selectedInterval = selectedInterval - 1;
                        this.$scope.timer_position = this.$timeout(() => {
                            startdelay()
                        }, 1000);
                    } else {
                        if (this.$scope.isBetCountChanged) {
                            this.$scope.isBetCountChanged = false;
                            this.fetchLiveBetsData();
                            this.$rootScope.$emit('master-balance-changed');
                        } this.startTimer();
                    }
                });
                this.$timeout(() => { startdelay() }, 1000);
            }
        }


        private getHistoryBets(params: any): any {
            this.$scope.gridItems = [];
            this.$scope.dataForCurrent = false;
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                marketTypeCode: this.$scope.search.marketType && this.$scope.search.marketType.id ? this.$scope.search.marketType.id : '',
                eventName: this.$scope.search.eventName,
                oddsfrom: this.$scope.search.oddsfrom,
                oddsto: this.$scope.search.oddsto,
                stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),
            };
            if (this.$scope.search.selectedUser) {
                return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params, id: this.$scope.search.selectedUser.id });
            }
            else if (this.$stateParams.memberid) {
                return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params, id: this.$stateParams.memberid });
            } else {
                return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params });
            }
        }

        private refreshHistoryGrid(): void {
            this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
        }


        private search(): void {
            this.$scope.totalRows = 0;
            if (this.$scope.dataForCurrent) { this.fetchLiveBetsData(); }
            else { this.refreshHistoryGrid(); }
        }

        private resetCriteria(): void {
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm")),
                eventType: { id: '', name: 'All' },
                eventName: '',
                oddsfrom: '',
                oddsto: '',
                stakefrom: '',
                staketo: '',
                selectedUser: undefined,
                marketType: { id: '', displayName: 'All' },
            };
            this.search();
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

        private exportDataToExcel(): void {
            if (this.$scope.dataForCurrent) {
                var searchQuery: any = {
                    fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    status: this.$scope.betStatus == 2 ? "matched" : "unmatched",
                    eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                    marketTypeCode: this.$scope.search.marketType && this.$scope.search.marketType.id ? this.$scope.search.marketType.id : '',
                    eventName: this.$scope.search.eventName,
                    oddsfrom: this.$scope.search.oddsfrom,
                    oddsto: this.$scope.search.oddsto,
                    stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                    staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),

                };
                var promise: any;
                if (this.$scope.search.selectedUser) {
                    promise = this.betService.getLiveBetsExport({ searchQuery: searchQuery, id: this.$scope.search.selectedUser.id });
                }
                else if (this.$stateParams.memberid) {
                    promise = this.betService.getLiveBetsExport({ searchQuery: searchQuery, id: this.$stateParams.memberid });
                } else {
                    promise = this.betService.getLiveBetsExport({ searchQuery: searchQuery });
                }
                if (promise) {
                    this.commonDataService.addPromise(promise);
                    promise.success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.prepareExcel(response.data);
                        }
                    });
                }
            }
            else {
                var searchQuery: any = {
                    fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                    marketTypeCode: this.$scope.search.marketType && this.$scope.search.marketType.id ? this.$scope.search.marketType.id : '',
                    eventName: this.$scope.search.eventName,
                    oddsfrom: this.$scope.search.oddsfrom,
                    oddsto: this.$scope.search.oddsto,
                    stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                    staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),
                };
                var promise: any;
                if (this.$scope.search.selectedUser) {
                    promise = this.betHistoryService.getHistoryBetsExport({ searchQuery: searchQuery, id: this.$scope.search.selectedUser.id });
                }
                else if (this.$stateParams.memberid) {
                    promise = this.betHistoryService.getHistoryBetsExport({ searchQuery: searchQuery, id: this.$stateParams.memberid });
                } else {
                    promise = this.betHistoryService.getHistoryBetsExport({ searchQuery: searchQuery });
                }
                if (promise) {
                    this.commonDataService.addPromise(promise);
                    promise.success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.prepareExcel(response.data);
                        }
                    });
                }
            }
        }

        private prepareExcel(gridData: any): void {
            if (gridData) {
                var table: string = '';
                var headerTD: string = '';
                var contentTD: string = '';
                var contentTR: string = '';

                if (this.$scope.dataForCurrent) {
                    angular.forEach(gridData, (g: any, index: any) => {
                        if (index == 0) {
                            headerTD += common.helpers.CommonHelper.wrapTD("Member");
                            headerTD += common.helpers.CommonHelper.wrapTD("Member ID");
                            headerTD += common.helpers.CommonHelper.wrapTD("Bet IP Address");
                            headerTD += common.helpers.CommonHelper.wrapTD("Sports");
                            headerTD += common.helpers.CommonHelper.wrapTD("Competition");
                            headerTD += common.helpers.CommonHelper.wrapTD("Event");
                            headerTD += common.helpers.CommonHelper.wrapTD("MarketID");
                            headerTD += common.helpers.CommonHelper.wrapTD("Market");
                            headerTD += common.helpers.CommonHelper.wrapTD("Selection ID");
                            headerTD += common.helpers.CommonHelper.wrapTD("Selection");
                            headerTD += common.helpers.CommonHelper.wrapTD("Bet ID");
                            headerTD += common.helpers.CommonHelper.wrapTD("1-Click");
                            headerTD += common.helpers.CommonHelper.wrapTD("In Play");
                            headerTD += common.helpers.CommonHelper.wrapTD("Type");
                            headerTD += common.helpers.CommonHelper.wrapTD("Odds Req.");
                            headerTD += common.helpers.CommonHelper.wrapTD("Avg. Matched Odds");
                            headerTD += common.helpers.CommonHelper.wrapTD("Stake Requested");
                            headerTD += common.helpers.CommonHelper.wrapTD("Stake Matched");
                            headerTD += common.helpers.CommonHelper.wrapTD("Stake Lapsed");
                            headerTD += common.helpers.CommonHelper.wrapTD("Stake Cancelled");
                            headerTD += common.helpers.CommonHelper.wrapTD("Potential Profit");
                            headerTD += common.helpers.CommonHelper.wrapTD("Liability");
                            headerTD += common.helpers.CommonHelper.wrapTD("Place");
                            headerTD += common.helpers.CommonHelper.wrapTD("Cancelled");
                            headerTD += common.helpers.CommonHelper.wrapTD("Last Matched");
                            headerTD += common.helpers.CommonHelper.wrapTD("Status");
                            angular.forEach(this.$scope.userPTtree, (p: any) => {
                                headerTD += common.helpers.CommonHelper.wrapTD(p.short + " PT");
                            });
                            table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                        }

                        contentTD = common.helpers.CommonHelper.wrapTD(g.user.username);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.user.name);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.remoteIp);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.market.event.eventType.name);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.market.event.competitionName);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.market.event.name);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.market.id);

                        if (g.market.event.eventType.id == this.settings.LiveGamesId)
                            contentTD += common.helpers.CommonHelper.wrapTD(g.market.name + " # " + g.market.roundId);
                        else
                            contentTD += common.helpers.CommonHelper.wrapTD(g.market.name);

                        contentTD += common.helpers.CommonHelper.wrapTD(g.runnerId);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.runnerName);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.betId);
                        contentTD += common.helpers.CommonHelper.wrapTD((g.betFrom == 3 ? 'Y' : 'N'));
                        contentTD += common.helpers.CommonHelper.wrapTD((g.inPlay == true ? 'Y' : 'N'));

                        if (g.bettingType == 7) { contentTD += common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Yes' : 'No')); }
                        else { contentTD += common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Back' : 'Lay')); }

                        contentTD += common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.price);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.avgPrice);
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.size));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeMatched));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeRemaining));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeCancelled));

                        var pProfit: any = 0;
                        if (g.bettingType == 7) { pProfit = math.divide(math.multiply(g.sizeMatched, g.percentage), 100); }
                        else if (g.bettingType == 8) { pProfit = g.sizeMatched; }
                        else {
                            if (g.side == 1) pProfit = math.multiply(g.avgPrice - 1, g.sizeMatched);
                            else pProfit = g.sizeMatched;
                        }
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(pProfit));

                        var liability: any = '';
                        if (g.side == 2) {
                            if (g.bettingType == 7) { liability = g.sizeMatched; }
                            else { liability = math.multiply(g.avgPrice - 1, g.sizeMatched); }
                        }
                        contentTD += common.helpers.CommonHelper.wrapTD(liability != '' ? this.$filter('toRate')(liability) : '');

                        contentTD += common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                        contentTD += common.helpers.CommonHelper.wrapTD('');
                        contentTD += common.helpers.CommonHelper.wrapTD(moment(g.updatedOn ? g.updatedOn : g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                        contentTD += common.helpers.CommonHelper.wrapTD('UNSETTLED');
                        angular.forEach(this.$scope.userPTtree, (p: any) => {
                            contentTD += common.helpers.CommonHelper.wrapTD(g.userPt[p.ptFieldName]);
                        });
                        contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                    });
                    table += common.helpers.CommonHelper.wrapTBody(contentTR);
                    table = common.helpers.CommonHelper.wrapTable(table);

                    this.ExportFactory.tableStringToExcel(table, 'Bet List - Current');
                } else {
                    angular.forEach(gridData, (g: any, index: any) => {
                        if (index == 0) {
                            headerTD += common.helpers.CommonHelper.wrapTD("Member");
                            headerTD += common.helpers.CommonHelper.wrapTD("Member ID");
                            headerTD += common.helpers.CommonHelper.wrapTD("Bet IP Address");
                            headerTD += common.helpers.CommonHelper.wrapTD("Sports");
                            headerTD += common.helpers.CommonHelper.wrapTD("Competition");
                            headerTD += common.helpers.CommonHelper.wrapTD("Event");
                            headerTD += common.helpers.CommonHelper.wrapTD("MarketID");
                            headerTD += common.helpers.CommonHelper.wrapTD("Market");
                            headerTD += common.helpers.CommonHelper.wrapTD("Selection ID");
                            headerTD += common.helpers.CommonHelper.wrapTD("Selection");
                            headerTD += common.helpers.CommonHelper.wrapTD("Bet ID");
                            headerTD += common.helpers.CommonHelper.wrapTD("1-Click");
                            headerTD += common.helpers.CommonHelper.wrapTD("In Play");
                            headerTD += common.helpers.CommonHelper.wrapTD("Type");
                            headerTD += common.helpers.CommonHelper.wrapTD("Odds Req.");
                            headerTD += common.helpers.CommonHelper.wrapTD("Avg. Matched Odds");
                            headerTD += common.helpers.CommonHelper.wrapTD("Stake Requested");
                            headerTD += common.helpers.CommonHelper.wrapTD("Stake Matched");
                            headerTD += common.helpers.CommonHelper.wrapTD("Stake Lapsed");
                            headerTD += common.helpers.CommonHelper.wrapTD("Stake Cancelled");
                            headerTD += common.helpers.CommonHelper.wrapTD("Stake Void");
                            headerTD += common.helpers.CommonHelper.wrapTD("Placed");
                            headerTD += common.helpers.CommonHelper.wrapTD("Cancelled");
                            headerTD += common.helpers.CommonHelper.wrapTD("Last Matched");
                            headerTD += common.helpers.CommonHelper.wrapTD("Status");
                            headerTD += common.helpers.CommonHelper.wrapTD("MEMBER Win/Loss");
                            angular.forEach(this.$scope.userPTtree, (p: any) => {
                                headerTD += common.helpers.CommonHelper.wrapTD(p.short + " Win/Loss");
                            });
                            table += common.helpers.CommonHelper.wrapTHead(common.helpers.CommonHelper.wrapTR(headerTD));
                        }

                        contentTD = common.helpers.CommonHelper.wrapTD(g.user.username);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.user.name);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.remoteIp);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.market.event.eventType.name);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.market.event.competitionName);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.market.event.name);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.marketId);

                        if (g.market.event.eventType.id == this.settings.LiveGamesId)
                            contentTD += common.helpers.CommonHelper.wrapTD(g.market.name + " # " + g.market.roundId);
                        else
                            contentTD += common.helpers.CommonHelper.wrapTD(g.market.name);

                        contentTD += common.helpers.CommonHelper.wrapTD(g.runnerId);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.runnerName);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.betId);
                        contentTD += common.helpers.CommonHelper.wrapTD((g.betFrom == 3 ? 'Y' : 'N'));
                        contentTD += common.helpers.CommonHelper.wrapTD((g.inPlay == true ? 'Y' : 'N'));

                        if (g.bettingType == 7) { contentTD += common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Yes' : 'No')); }
                        else { contentTD += common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Back' : 'Lay')); }

                        contentTD += common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.price);
                        contentTD += common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.avgPrice);
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.size));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeMatched));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeRemaining));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeCancelled));
                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeVoided));
                        contentTD += common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                        contentTD += common.helpers.CommonHelper.wrapTD('');
                        contentTD += common.helpers.CommonHelper.wrapTD(moment(g.updatedOn ? g.updatedOn : g.createdOn).format('DD/MM/YYYY HH:mm:ss'));

                        if (g.sizeCancelled > 0 || g.sizeVoided > 0)
                            contentTD += common.helpers.CommonHelper.wrapTD('VOID');
                        else if (g.pl > 0)
                            contentTD += common.helpers.CommonHelper.wrapTD('WON');
                        else
                            contentTD += common.helpers.CommonHelper.wrapTD('LOST');

                        contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.pl));

                        angular.forEach(this.$scope.userPTtree, (p: any) => {
                            contentTD += common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g[p.plFieldName]));
                        });
                        contentTR += common.helpers.CommonHelper.wrapTR(contentTD);
                    });
                    table += common.helpers.CommonHelper.wrapTBody(contentTR);
                    table = common.helpers.CommonHelper.wrapTable(table);

                    this.ExportFactory.tableStringToExcel(table, 'Bet List - Past');
                }
            }
        }
    }
    angular.module('intranet.master').controller('lotusBetListCtrl', LotusBetListCtrl);
}