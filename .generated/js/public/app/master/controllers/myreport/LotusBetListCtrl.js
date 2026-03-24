var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class LotusBetListCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, betService, $timeout, $rootScope, betHistoryService, eventTypeService, commonDataService, ExportFactory, $filter, marketService, userService, $stateParams, settings) {
                super($scope);
                this.toasterService = toasterService;
                this.betService = betService;
                this.$timeout = $timeout;
                this.$rootScope = $rootScope;
                this.betHistoryService = betHistoryService;
                this.eventTypeService = eventTypeService;
                this.commonDataService = commonDataService;
                this.ExportFactory = ExportFactory;
                this.$filter = $filter;
                this.marketService = marketService;
                this.userService = userService;
                this.$stateParams = $stateParams;
                this.settings = settings;
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
            initScopeValues() {
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
            loadInitialData() {
                this.buildUserTreeForPT();
                this.getEventTypes();
                this.getMarketTypes();
                this.startTimer();
            }
            buildUserTreeForPT() {
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
            getEventTypes() {
                this.eventTypeService.getEventTypes()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypeList = response.data;
                        this.$scope.eventTypeList.splice(0, 0, { id: '', name: 'All' });
                    }
                });
            }
            getMarketTypes() {
                this.marketService.getAllMarketTypeMapping()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.marketTypeList = [];
                        angular.forEach(response.data, (d) => {
                            this.$scope.marketTypeList.push({ id: d.marketTypeCode, displayName: d.displayName });
                        });
                        this.$scope.marketTypeList.splice(0, 0, { id: '', displayName: 'All' });
                    }
                });
            }
            rangeChanged(ranger, self, other) {
                ranger[self] = !ranger[self];
                if (ranger[self]) {
                    ranger[other] = false;
                }
            }
            getMatchedBets(params) {
                this.$scope.gridItems = [];
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
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
                }
                else {
                    return this.betService.getLiveBets({ searchQuery: searchQuery, params: params });
                }
            }
            getUnmatchedBets(params) {
                this.$scope.gridItems = [];
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
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
                }
                else {
                    return this.betService.getLiveBets({ searchQuery: searchQuery, params: params });
                }
            }
            fetchLiveBetsData() {
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
            betSideChanged(status) {
                this.$scope.betStatus = status;
                this.fetchLiveBetsData();
            }
            startTimer(start = true) {
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
                                startdelay();
                            }, 1000);
                        }
                        else {
                            if (this.$scope.isBetCountChanged) {
                                this.$scope.isBetCountChanged = false;
                                this.fetchLiveBetsData();
                                this.$rootScope.$emit('master-balance-changed');
                            }
                            this.startTimer();
                        }
                    });
                    this.$timeout(() => { startdelay(); }, 1000);
                }
            }
            getHistoryBets(params) {
                this.$scope.gridItems = [];
                this.$scope.dataForCurrent = false;
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
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
                }
                else {
                    return this.betHistoryService.getHistoryBets({ searchQuery: searchQuery, params: params });
                }
            }
            refreshHistoryGrid() {
                this.$scope.$broadcast('refreshGrid_kt-historybets-grid');
            }
            search() {
                this.$scope.totalRows = 0;
                if (this.$scope.dataForCurrent) {
                    this.fetchLiveBetsData();
                }
                else {
                    this.refreshHistoryGrid();
                }
            }
            resetCriteria() {
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
            searchUser(search) {
                if (search && search.length >= 3) {
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
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.userList = response.data;
                            if (this.$scope.userList && this.$scope.userList.length > 0) {
                                this.$scope.userList.forEach((u) => {
                                    u.extra = super.getUserTypesObj(u.userType);
                                });
                            }
                        });
                    }
                }
                else {
                    this.$scope.userList.splice(0);
                }
            }
            exportDataToExcel() {
                if (this.$scope.dataForCurrent) {
                    var searchQuery = {
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                        status: this.$scope.betStatus == 2 ? "matched" : "unmatched",
                        eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                        marketTypeCode: this.$scope.search.marketType && this.$scope.search.marketType.id ? this.$scope.search.marketType.id : '',
                        eventName: this.$scope.search.eventName,
                        oddsfrom: this.$scope.search.oddsfrom,
                        oddsto: this.$scope.search.oddsto,
                        stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                        staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),
                    };
                    var promise;
                    if (this.$scope.search.selectedUser) {
                        promise = this.betService.getLiveBetsExport({ searchQuery: searchQuery, id: this.$scope.search.selectedUser.id });
                    }
                    else if (this.$stateParams.memberid) {
                        promise = this.betService.getLiveBetsExport({ searchQuery: searchQuery, id: this.$stateParams.memberid });
                    }
                    else {
                        promise = this.betService.getLiveBetsExport({ searchQuery: searchQuery });
                    }
                    if (promise) {
                        this.commonDataService.addPromise(promise);
                        promise.success((response) => {
                            if (response.success) {
                                this.prepareExcel(response.data);
                            }
                        });
                    }
                }
                else {
                    var searchQuery = {
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                        eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                        marketTypeCode: this.$scope.search.marketType && this.$scope.search.marketType.id ? this.$scope.search.marketType.id : '',
                        eventName: this.$scope.search.eventName,
                        oddsfrom: this.$scope.search.oddsfrom,
                        oddsto: this.$scope.search.oddsto,
                        stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                        staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),
                    };
                    var promise;
                    if (this.$scope.search.selectedUser) {
                        promise = this.betHistoryService.getHistoryBetsExport({ searchQuery: searchQuery, id: this.$scope.search.selectedUser.id });
                    }
                    else if (this.$stateParams.memberid) {
                        promise = this.betHistoryService.getHistoryBetsExport({ searchQuery: searchQuery, id: this.$stateParams.memberid });
                    }
                    else {
                        promise = this.betHistoryService.getHistoryBetsExport({ searchQuery: searchQuery });
                    }
                    if (promise) {
                        this.commonDataService.addPromise(promise);
                        promise.success((response) => {
                            if (response.success) {
                                this.prepareExcel(response.data);
                            }
                        });
                    }
                }
            }
            prepareExcel(gridData) {
                if (gridData) {
                    var table = '';
                    var headerTD = '';
                    var contentTD = '';
                    var contentTR = '';
                    if (this.$scope.dataForCurrent) {
                        angular.forEach(gridData, (g, index) => {
                            if (index == 0) {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Member");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Member ID");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bet IP Address");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Sports");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Competition");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Event");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("MarketID");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Market");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Selection ID");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Selection");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bet ID");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("1-Click");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("In Play");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Type");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Odds Req.");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Avg. Matched Odds");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Requested");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Matched");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Lapsed");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Cancelled");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Potential Profit");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Liability");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Place");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Cancelled");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Last Matched");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Status");
                                angular.forEach(this.$scope.userPTtree, (p) => {
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD(p.short + " PT");
                                });
                                table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                            }
                            contentTD = intranet.common.helpers.CommonHelper.wrapTD(g.user.username);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user.name);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.remoteIp);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.event.eventType.name);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.event.competitionName);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.event.name);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.id);
                            if (g.market.event.eventType.id == this.settings.LiveGamesId)
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.name + " # " + g.market.roundId);
                            else
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.name);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.runnerId);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.runnerName);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.betId);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.betFrom == 3 ? 'Y' : 'N'));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.inPlay == true ? 'Y' : 'N'));
                            if (g.bettingType == 7) {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Yes' : 'No'));
                            }
                            else {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Back' : 'Lay'));
                            }
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.price);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.avgPrice);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.size));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeMatched));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeRemaining));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeCancelled));
                            var pProfit = 0;
                            if (g.bettingType == 7) {
                                pProfit = math.divide(math.multiply(g.sizeMatched, g.percentage), 100);
                            }
                            else if (g.bettingType == 8) {
                                pProfit = g.sizeMatched;
                            }
                            else {
                                if (g.side == 1)
                                    pProfit = math.multiply(g.avgPrice - 1, g.sizeMatched);
                                else
                                    pProfit = g.sizeMatched;
                            }
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(pProfit));
                            var liability = '';
                            if (g.side == 2) {
                                if (g.bettingType == 7) {
                                    liability = g.sizeMatched;
                                }
                                else {
                                    liability = math.multiply(g.avgPrice - 1, g.sizeMatched);
                                }
                            }
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(liability != '' ? this.$filter('toRate')(liability) : '');
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD('');
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.updatedOn ? g.updatedOn : g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD('UNSETTLED');
                            angular.forEach(this.$scope.userPTtree, (p) => {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.userPt[p.ptFieldName]);
                            });
                            contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                        });
                        table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                        table = intranet.common.helpers.CommonHelper.wrapTable(table);
                        this.ExportFactory.tableStringToExcel(table, 'Bet List - Current');
                    }
                    else {
                        angular.forEach(gridData, (g, index) => {
                            if (index == 0) {
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Member");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Member ID");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bet IP Address");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Sports");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Competition");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Event");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("MarketID");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Market");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Selection ID");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Selection");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Bet ID");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("1-Click");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("In Play");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Type");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Odds Req.");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Avg. Matched Odds");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Requested");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Matched");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Lapsed");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Cancelled");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Stake Void");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Placed");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Cancelled");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Last Matched");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("Status");
                                headerTD += intranet.common.helpers.CommonHelper.wrapTD("MEMBER Win/Loss");
                                angular.forEach(this.$scope.userPTtree, (p) => {
                                    headerTD += intranet.common.helpers.CommonHelper.wrapTD(p.short + " Win/Loss");
                                });
                                table += intranet.common.helpers.CommonHelper.wrapTHead(intranet.common.helpers.CommonHelper.wrapTR(headerTD));
                            }
                            contentTD = intranet.common.helpers.CommonHelper.wrapTD(g.user.username);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.user.name);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.remoteIp);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.event.eventType.name);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.event.competitionName);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.event.name);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.marketId);
                            if (g.market.event.eventType.id == this.settings.LiveGamesId)
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.name + " # " + g.market.roundId);
                            else
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.market.name);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.runnerId);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.runnerName);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.betId);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.betFrom == 3 ? 'Y' : 'N'));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.inPlay == true ? 'Y' : 'N'));
                            if (g.bettingType == 7) {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Yes' : 'No'));
                            }
                            else {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD((g.side == 1 ? 'Back' : 'Lay'));
                            }
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.price);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(g.bettingType == 7 ? g.percentage : g.avgPrice);
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.size));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeMatched));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeRemaining));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeCancelled));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.sizeVoided));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD('');
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(moment(g.updatedOn ? g.updatedOn : g.createdOn).format('DD/MM/YYYY HH:mm:ss'));
                            if (g.sizeCancelled > 0 || g.sizeVoided > 0)
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD('VOID');
                            else if (g.pl > 0)
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD('WON');
                            else
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD('LOST');
                            contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g.pl));
                            angular.forEach(this.$scope.userPTtree, (p) => {
                                contentTD += intranet.common.helpers.CommonHelper.wrapTD(this.$filter('toRate')(g[p.plFieldName]));
                            });
                            contentTR += intranet.common.helpers.CommonHelper.wrapTR(contentTD);
                        });
                        table += intranet.common.helpers.CommonHelper.wrapTBody(contentTR);
                        table = intranet.common.helpers.CommonHelper.wrapTable(table);
                        this.ExportFactory.tableStringToExcel(table, 'Bet List - Past');
                    }
                }
            }
        }
        master.LotusBetListCtrl = LotusBetListCtrl;
        angular.module('intranet.master').controller('lotusBetListCtrl', LotusBetListCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LotusBetListCtrl.js.map