var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SALiveBetsCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, eventTypeService, eventService, marketService, modalService, userService, $filter, $q, commonDataService, $timeout, betService, settings) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.eventTypeService = eventTypeService;
                this.eventService = eventService;
                this.marketService = marketService;
                this.modalService = modalService;
                this.userService = userService;
                this.$filter = $filter;
                this.$q = $q;
                this.commonDataService = commonDataService;
                this.$timeout = $timeout;
                this.betService = betService;
                this.settings = settings;
                var newPageLoader = this.$scope.$on('newPageLoaded', (e, data) => {
                    if (e.targetScope.gridId === 'kt-matchedlivebets-grid') {
                        if (data && data.result.length > 0) {
                            data.result.forEach((item) => {
                                var diff = (item.price - item.avgPrice);
                                if (diff != 0) {
                                    if (diff < 0) {
                                        diff = math.abs(diff);
                                    }
                                    item.alert = math.round(diff, 2) >= 0.07;
                                }
                            });
                        }
                    }
                });
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        this.$scope.isBetCountChanged = true;
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_position);
                    newPageLoader();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.refreshIntervals = [];
                this.$scope.userPTtree = [];
                this.$scope.anyUserList = [];
                this.$scope.betStatus = [];
                this.$scope.agentList = [];
                this.$scope.adminList = [];
                this.$scope.superMasterList = [];
                this.$scope.masterList = [];
                this.$scope.userList = [];
                this.$scope.search = {
                    fromdate: new Date(moment().format("DD MMM YYYY")),
                    todate: new Date(moment().format("DD MMM YYYY")),
                    eventType: { id: '', name: 'All' },
                    oddsfrom: '',
                    oddsto: '',
                    stakefrom: '',
                    staketo: '',
                    status: '-1',
                    selectedUser: undefined,
                    marketType: { id: '', displayName: 'All' },
                };
                this.$scope.search.fromdate = new Date(moment().add(-7, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().add(1, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.liveGamesId = this.settings.LiveGamesId;
                this.$scope.listNewItems_Matched = [];
            }
            loadInitialData() {
                this.loadButtonItems();
                this.fillBetStatus();
                this.buildUserTreeForPT();
                this.getEventTypes();
                this.getMarketTypes();
                this.fillRefreshInterval();
                this.startTimer();
            }
            fillBetStatus() {
                this.$scope.betStatus.push({ id: -1, name: 'All' });
                this.$scope.betStatus.push({ id: 2, name: 'Matched' });
                this.$scope.betStatus.push({ id: 3, name: 'Unmatched' });
            }
            buildUserTreeForPT() {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser) {
                    this.$scope.userPTtree = super.getUserTypeForPT(loggeduser.userType);
                    this.$scope.userPTtree = this.$scope.userPTtree.reverse();
                }
            }
            fillRefreshInterval() {
                this.$scope.refreshIntervals.push({ name: '3 sec', value: 3 });
                this.$scope.refreshIntervals.push({ name: '5 sec', value: 5 });
                this.$scope.refreshIntervals.push({ name: '10 sec', value: 10 });
                this.$scope.refreshIntervals.push({ name: '15 sec', value: 15 });
                this.$scope.refreshIntervals.push({ name: '20 sec', value: 20 });
                this.$scope.refreshIntervals.push({ name: '25 sec', value: 25 });
                this.$scope.refreshIntervals.push({ name: '30 sec', value: 30 });
                this.$scope.refreshIntervals.push({ name: '60 sec', value: 60 });
                this.$scope.refreshIntervals.push({ name: 'Stop', value: 0 });
                this.$scope.selectedInterval = '10';
            }
            loadChildLevel(userlevel = 1, firstTime = false) {
                if (this.$scope.adminList.length <= 0 || !firstTime) {
                    var promise;
                    if (userlevel == 1) {
                        promise = this.userService.getAllChildMembers(-1);
                    }
                    else if (userlevel == 2) {
                        promise = this.userService.getAllChildMembers(this.$scope.search.admin.id);
                    }
                    else if (userlevel == 3) {
                        promise = this.userService.getAllChildMembers(this.$scope.search.superMaster.id);
                    }
                    else if (userlevel == 4) {
                        promise = this.userService.getAllChildMembers(this.$scope.search.master.id);
                    }
                    else if (userlevel == 5) {
                        promise = this.userService.getAllChildMembers(this.$scope.search.agent.id);
                    }
                    if (promise) {
                        promise.success((response) => {
                            if (response.success) {
                                if (userlevel == 1) {
                                    this.$scope.adminList = response.data;
                                    this.$scope.search.superMaster = null;
                                    this.$scope.search.master = null;
                                    this.$scope.search.agent = null;
                                    this.$scope.search.user = null;
                                }
                                else if (userlevel == 2) {
                                    this.$scope.superMasterList = response.data;
                                    this.$scope.search.master = null;
                                    this.$scope.search.agent = null;
                                    this.$scope.search.user = null;
                                }
                                else if (userlevel == 3) {
                                    this.$scope.masterList = response.data;
                                    this.$scope.search.agent = null;
                                    this.$scope.search.user = null;
                                }
                                else if (userlevel == 4) {
                                    this.$scope.agentList = response.data;
                                    this.$scope.search.user = null;
                                }
                                else if (userlevel == 5) {
                                    this.$scope.userList = response.data;
                                }
                            }
                        });
                    }
                }
            }
            getEventTypes() {
                this.eventTypeService.getEventTypes()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypeList = response.data;
                    }
                });
            }
            getEvents() {
                this.$scope.search.event = null;
                this.eventService.searchEvent(this.$scope.search.eventType.id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventList = response.data;
                        this.$scope.search.market = null;
                    }
                });
            }
            getMarkets() {
                this.$scope.search.market = null;
                this.marketService.getMarketByEventId(this.$scope.search.event.id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.marketList = response.data;
                    }
                });
            }
            getMarketTypes() {
                var bettingType = intranet.common.enums.BettingType;
                this.$scope.bettingTypeList = intranet.common.helpers.Utility.enumToArray(bettingType);
                this.$scope.bettingTypeList.splice(0, 0, { id: '', name: 'All' });
            }
            loadButtonItems() {
                this.$scope.listNewItems_Matched.push({
                    func: () => this.selectAllBets(),
                    name: 'Select All Bets',
                    cssClass: 'fa fa-check-square-o'
                });
                this.$scope.listNewItems_Matched.push({
                    func: () => this.deleteSelectedBets(),
                    name: 'Delete All',
                    cssClass: 'fa fa-trash'
                });
            }
            selectAllBets() {
                this.$scope.gridItems.forEach((g) => { g.isDelete = true; });
            }
            getMatchedBets(params) {
                var searchQuery = {
                    fromDate: this.$scope.search.fromdate,
                    toDate: this.$scope.search.todate,
                    status: "matched",
                    eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                    bettingType: this.$scope.search.bettingType && this.$scope.search.bettingType.id ? this.$scope.search.bettingType.id : '',
                    eventId: this.$scope.search.event && this.$scope.search.event.id ? this.$scope.search.event.id : '',
                    marketId: this.$scope.search.market && this.$scope.search.market.id ? this.$scope.search.market.id : '',
                    oddsfrom: this.$scope.search.oddsfrom,
                    oddsto: this.$scope.search.oddsto,
                    stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                    staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),
                };
                if (params && params.orderBy == '') {
                    params.orderBy = 'createdon';
                    params.orderByDesc = true;
                }
                var userId = 0;
                if (this.$scope.search.selectedUser) {
                    userId = this.$scope.search.selectedUser.id;
                }
                if (this.$scope.search.admin && this.$scope.search.admin.id) {
                    userId = this.$scope.search.admin.id;
                }
                if (this.$scope.search.superMaster && this.$scope.search.superMaster.id) {
                    userId = this.$scope.search.superMaster.id;
                }
                if (this.$scope.search.master && this.$scope.search.master.id) {
                    userId = this.$scope.search.master.id;
                }
                if (this.$scope.search.agent && this.$scope.search.agent.id) {
                    userId = this.$scope.search.agent.id;
                }
                if (this.$scope.search.user && this.$scope.search.user.id) {
                    userId = this.$scope.search.user.id;
                }
                if (userId != 0) {
                    return this.betService.getLiveBets({ searchQuery: searchQuery, params: params, id: userId });
                }
                else {
                    return this.betService.getLiveBets({ searchQuery: searchQuery, params: params });
                }
            }
            getUnmatchedBets(params) {
                var searchQuery = {
                    fromDate: this.$scope.search.fromdate,
                    toDate: this.$scope.search.todate,
                    status: "unmatched",
                    eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                    bettingType: this.$scope.search.bettingType && this.$scope.search.bettingType.id ? this.$scope.search.bettingType.id : '',
                    eventId: this.$scope.search.event && this.$scope.search.event.id ? this.$scope.search.event.id : '',
                    marketId: this.$scope.search.market && this.$scope.search.market.id ? this.$scope.search.market.id : '',
                    oddsfrom: this.$scope.search.oddsfrom,
                    oddsto: this.$scope.search.oddsto,
                    stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                    staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),
                };
                if (params && params.orderBy == '') {
                    params.orderBy = 'createdon';
                    params.orderByDesc = true;
                }
                var userId = 0;
                if (this.$scope.search.selectedUser) {
                    userId = this.$scope.search.selectedUser.id;
                }
                if (this.$scope.search.admin && this.$scope.search.admin.id) {
                    userId = this.$scope.search.admin.id;
                }
                if (this.$scope.search.superMaster && this.$scope.search.superMaster.id) {
                    userId = this.$scope.search.superMaster.id;
                }
                if (this.$scope.search.master && this.$scope.search.master.id) {
                    userId = this.$scope.search.master.id;
                }
                if (this.$scope.search.agent && this.$scope.search.agent.id) {
                    userId = this.$scope.search.agent.id;
                }
                if (this.$scope.search.user && this.$scope.search.user.id) {
                    userId = this.$scope.search.user.id;
                }
                if (userId != 0) {
                    return this.betService.getLiveBets({ searchQuery: searchQuery, params: params, id: userId });
                }
                else {
                    return this.betService.getLiveBets({ searchQuery: searchQuery, params: params });
                }
            }
            fetchLiveBetsData() {
                if (this.$scope.search.status == 2 || this.$scope.search.status == -1) {
                    var refreshCMD = "refreshGrid";
                    refreshCMD = refreshCMD + "_kt-matchedlivebets-grid";
                    this.$scope.$broadcast(refreshCMD);
                }
                if (this.$scope.search.status == 3 || this.$scope.search.status == -1) {
                    var refreshCMD = "refreshGrid";
                    refreshCMD = refreshCMD + "_kt-unmatchedlivebets-grid";
                    this.$scope.$broadcast(refreshCMD);
                }
            }
            intervalChanged() {
                if (this.$scope.selectedInterval != 0) {
                    this.startTimer();
                }
                else {
                    this.$timeout.cancel(this.$scope.timer_position);
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
                    status: '-1',
                    selectedUser: undefined,
                    bettingType: { id: '', name: 'All' },
                    event: null,
                    market: null
                };
                this.$scope.search.admin = null;
                this.$scope.search.superMaster = null;
                this.$scope.search.master = null;
                this.$scope.search.agent = null;
                this.$scope.search.user = null;
                this.$scope.selectedInterval = '10';
                this.$scope.search.fromdate = new Date(moment().add(-7, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().add(1, 'd').format("DD MMM YYYY HH:mm"));
                this.fetchLiveBetsData();
            }
            startTimer(start = true) {
                if (!start) {
                    this.$timeout.cancel(this.$scope.timer_position);
                }
                else {
                    this.$timeout.cancel(this.$scope.timer_position);
                    var selectedInterval = this.$scope.selectedInterval;
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
                            }
                            this.startTimer();
                        }
                    });
                    this.$timeout(() => { startdelay(); }, 1000);
                }
            }
            deleteSelectedBets() {
                var betsToDelete = this.$scope.gridItems.filter((g) => { return g.isDelete == true; });
                if (betsToDelete.length > 0) {
                    var modal = new intranet.common.helpers.CreateModal();
                    modal.header = 'common.voidbets.header';
                    modal.data = {
                        betIds: betsToDelete.map((b) => { return b.id; })
                    };
                    modal.bodyUrl = this.settings.ThemeName + '/admin/account/void-bets-modal.html';
                    modal.controller = 'voidBetsModalCtrl';
                    modal.SetModal();
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                        if (result.button == intranet.common.services.ModalResult.OK) {
                            this.fetchLiveBetsData();
                        }
                    });
                }
            }
            cancelBet(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'common.voidbets.header';
                modal.data = {
                    betId: item.id,
                    voidAmount: item.sizeMatched
                };
                modal.bodyUrl = this.settings.ThemeName + '/admin/account/void-bets-modal.html';
                modal.controller = 'voidBetsModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.fetchLiveBetsData();
                    }
                });
            }
            searchUser(search) {
                if (search && search.length >= 3) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.userService.findMembers(search);
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.anyUserList = response.data;
                            if (this.$scope.anyUserList && this.$scope.anyUserList.length > 0) {
                                this.$scope.anyUserList.forEach((u) => {
                                    u.extra = super.getUserTypesObj(u.userType);
                                });
                            }
                        });
                    }
                }
                else {
                    this.$scope.anyUserList.splice(0);
                }
            }
            betRate(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'Bet rate';
                modal.data = {};
                angular.copy(item, modal.data);
                modal.bodyUrl = this.settings.ThemeName + '/admin/account/sa-bet-rate-modal.html';
                modal.controller = 'sABetRateModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.fetchLiveBetsData();
                    }
                });
            }
        }
        admin.SALiveBetsCtrl = SALiveBetsCtrl;
        angular.module('intranet.admin').controller('sALiveBetsCtrl', SALiveBetsCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SALiveBetsCtrl.js.map