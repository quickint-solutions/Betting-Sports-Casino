var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class MarketCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, toasterService, settings, commonDataService, $stateParams, $timeout, $filter, marketService) {
                super($scope);
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.settings = settings;
                this.commonDataService = commonDataService;
                this.$stateParams = $stateParams;
                this.$timeout = $timeout;
                this.$filter = $filter;
                this.marketService = marketService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.listNewItems = [];
                this.$scope.inplayStatus = [];
                this.$scope.marketStatusList = [];
                this.$scope.syncStatus = [];
                this.$scope.inplayStatusList = [];
                this.$scope.statusList = [];
                this.$scope.bettingTypeList = [];
                this.$scope.marketSourceList = [];
                this.$scope.search = {
                    inplay: '-1',
                    status: '2',
                    bettingType: '-1',
                    source: '-1',
                    fromDate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    toDate: new Date(moment().add(1, 'd').format("DD MMM YYYY HH:mm"))
                };
                this.$scope.liveGamesId = this.settings.LiveGamesId;
            }
            loadInitialData() {
                this.loadFilterLists();
                this.loadButtonItems();
                this.loadInplayAndSyncStatus();
                this.loadMarketStatus();
            }
            loadFilterLists() {
                this.$scope.inplayStatusList.push({ id: -1, name: '-- InPlay Status --' });
                this.$scope.inplayStatusList.push({ id: 1, name: 'In-Play' });
                this.$scope.inplayStatusList.push({ id: 0, name: 'Going In-Play' });
                var betType = intranet.common.enums.BettingType;
                this.$scope.bettingTypeList = intranet.common.helpers.Utility.enumToArray(betType);
                this.$scope.bettingTypeList.splice(0, 0, { id: -1, name: '-- Betting Type --' });
                var eventsource = intranet.common.enums.EventSource;
                this.$scope.marketSourceList = intranet.common.helpers.Utility.enumToArray(eventsource);
                this.$scope.marketSourceList.splice(0, 0, { id: -1, name: '-- Source --' });
            }
            loadButtonItems() {
                this.$scope.listNewItems.push({
                    func: () => this.addMarket(),
                    name: 'market.addnew.button.label'
                });
                this.$scope.listNewItems.push({
                    func: () => this.addRunner(),
                    name: 'runner.addnew.button.label'
                });
                this.$scope.listNewItems.push({
                    func: () => this.selectAllMarkets(),
                    name: 'Select All Markets'
                });
                this.$scope.listNewItems.push({
                    func: () => this.deleteSelectedMarkets(),
                    name: 'Delete Selected'
                });
            }
            loadInplayAndSyncStatus() {
                this.$scope.inplayStatus.push({ id: true, name: 'true' });
                this.$scope.inplayStatus.push({ id: false, name: 'false' });
                this.$scope.syncStatus.push({ id: true, name: 'true' });
                this.$scope.syncStatus.push({ id: false, name: 'false' });
            }
            loadMarketStatus() {
                var status = intranet.common.enums.MarketStatus;
                this.$scope.marketStatusList = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.statusList = intranet.common.helpers.Utility.enumToArray(status);
            }
            getBettingType(bettingType) {
                return intranet.common.enums.BettingType[bettingType];
            }
            getLadderType(ladderType) {
                return intranet.common.enums.PriceLadderType[ladderType];
            }
            addMarket(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'admin.market.edit.modal.header';
                    modal.data = {
                        eventId: item.eventId,
                        id: item.id,
                        name: item.name,
                        bettingType: item.bettingType,
                        marketRunner: item.marketRunner,
                        minUnitValue: item.minUnitValue,
                        maxUnitValue: item.maxUnitValue,
                        priceLadderType: item.priceLadderType,
                        interval: item.interval,
                        marketUnit: item.marketUnit,
                        persistenceEnabled: item.persistenceEnabled,
                        eventName: this.$stateParams.eventname,
                        group: item.group,
                        allowCommission: item.allowCommission,
                        maxBet: item.maxBet,
                        maxLiability: item.maxLiability,
                        maxProfit: item.maxProfit,
                        marketRuleId: item.marketRuleId,
                        betOpenTime: item.betOpenTime,
                        betCloseTime: item.betCloseTime,
                        marketType: item.marketType,
                        displayOrder: item.displayOrder,
                        gameType: item.gameType,
                        allowBetUpTo: item.allowBetUpTo,
                        allowBetDownTo: item.allowBetDownTo,
                        betDelay: item.betDelay,
                        clarification: item.clarification,
                        limitOddsDiff: item.limitOddsDiff,
                        sourceId: item.sourceId
                    };
                }
                else {
                    modal.header = 'admin.market.add.modal.header';
                    modal.data = {
                        eventId: this.$stateParams.eventid,
                        eventName: this.$stateParams.eventname
                    };
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-market-modal.html';
                modal.controller = 'addMarketModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            copyMarket(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'admin.market.copy.modal.header';
                modal.data = {
                    eventId: item.eventId,
                    name: item.name,
                    bettingType: item.bettingType,
                    marketRunner: item.marketRunner,
                    minUnitValue: item.minUnitValue,
                    maxUnitValue: item.maxUnitValue,
                    priceLadderType: item.priceLadderType,
                    interval: item.interval,
                    marketUnit: item.marketUnit,
                    persistenceEnabled: item.persistenceEnabled,
                    eventName: this.$stateParams.eventname,
                    group: item.group,
                    allowCommission: item.allowCommission,
                    maxBet: item.maxBet,
                    maxLiability: item.maxLiability,
                    maxProfit: item.maxProfit,
                    marketRuleId: item.marketRuleId,
                    betOpenTime: item.betOpenTime,
                    betCloseTime: item.betCloseTime,
                    marketType: item.marketType,
                    displayOrder: item.displayOrder,
                    gameType: item.gameType,
                    allowBetUpTo: item.allowBetUpTo,
                    allowBetDownTo: item.allowBetDownTo,
                    betDelay: item.betDelay,
                    clarification: item.clarification,
                    limitOddsDiff: item.limitOddsDiff,
                };
                modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-market-modal.html';
                modal.controller = 'addMarketModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            deleteMarket(marketId) {
                this.marketService.deleteMarket(marketId)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
            }
            selectAllMarkets() {
                if (this.$scope.gridItems && this.$scope.gridItems.length > 0) {
                    this.$scope.gridItems.forEach((x) => { x.isDelete = true; });
                }
            }
            deleteSelectedMarkets() {
                var self = this;
                var deleteMarket = ((id, isLast) => {
                    self.marketService.deleteMarket(id)
                        .success((response) => {
                        if (isLast) {
                            this.$scope.$broadcast('refreshGrid');
                            this.toasterService.showMessages(response.messages, 5000);
                        }
                    });
                });
                if (this.$scope.gridItems && this.$scope.gridItems.length > 0) {
                    var marketIds = this.$scope.gridItems.filter((m) => { return m.isDelete == true; }).map((a) => { return a.id; }) || [];
                    angular.forEach(marketIds, (id, index) => {
                        this.$timeout(() => { deleteMarket(id, index == (marketIds.length - 1)); }, 1000);
                    });
                }
            }
            addRunner(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'admin.runner.add.modal.header';
                modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-runner-modal.html';
                modal.controller = 'addRunnerModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            getRunnerModal(item, reclose = false) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {
                    marketRunner: [],
                    bettingType: item.bettingType,
                    reclose: reclose,
                    gameType: item.gameType,
                    winner: item.winner,
                    marketId: item.id,
                };
                angular.copy(item.marketRunner, modal.data.marketRunner);
                var msg = this.$filter('translate')('admin.runner.status.modal.header');
                msg = msg.format('"' + item.name + ' # ' + item.id + '"');
                modal.header = msg;
                if (item.gameType == intranet.common.enums.GameType.Patti2 || item.gameType == intranet.common.enums.GameType.Patti3
                    || item.gameType == intranet.common.enums.GameType.PokerT20
                    || item.gameType == intranet.common.enums.GameType.Up7Down
                    || item.gameType == intranet.common.enums.GameType.Card32
                    || item.gameType == intranet.common.enums.GameType.ClashOfKings
                    || item.gameType == intranet.common.enums.GameType.DragonTiger) {
                    modal.bodyUrl = this.settings.ThemeName + '/admin/sport/game-runner-status-modal.html';
                    modal.controller = 'gameRunnerStatusModalCtrl';
                    modal.size = 'lg';
                }
                else {
                    modal.bodyUrl = this.settings.ThemeName + '/admin/sport/runner-status-modal.html';
                    modal.controller = 'runnerStatusModalCtrl';
                }
                modal.SetModal();
                return modal;
            }
            runnerStatus(item) {
                var modal = this.getRunnerModal(item, true);
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            viewCards(item) {
                this.commonDataService.viewCards(item);
            }
            getGameResult(item) {
                if (item.gameType == intranet.common.enums.GameType.Patti3 || item.gameType == intranet.common.enums.GameType.Patti2 || item.gameType == intranet.common.enums.GameType.Poker
                    || item.gameType == intranet.common.enums.GameType.Up7Down) {
                    return this.commonDataService.formatLiveGameResult(item.marketRunner.filter((m) => { return m.status == intranet.common.enums.RunnerStatus.WINNER; }), item.gameType);
                }
                else {
                    var rr = item.marketRunner.filter((m) => { return m.status == intranet.common.enums.RunnerStatus.WINNER; }) || [];
                    if (rr.length > 0) {
                        var name = rr[0].runner.name.split(' ');
                        if (name.length > 1) {
                            return name[1];
                        }
                        else {
                            return this.$filter('limitTo')(rr[0].runner.name, 1);
                        }
                    }
                }
            }
            inPlayStatusChanged(inplay, item) {
                this.marketService.changeInPlay(item.id, inplay)
                    .success((response) => {
                    if (response.success) {
                        item.inPlay = inplay;
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'market.inplay.changed.success');
                    }
                    else {
                        this.toasterService.showMessages(response.messages);
                    }
                });
            }
            marketStatusChanged(status, item) {
                if (status == intranet.common.enums.MarketStatus.CLOSED) {
                    var modal = this.getRunnerModal(item);
                    this.modalService.showWithOptions(modal.options, modal.modalDefaults)
                        .then((result) => {
                        if (result.button == intranet.common.services.ModalResult.OK) {
                            item.marketStatus = status;
                        }
                    });
                }
                else {
                    this.marketService.changeStatus(item.id, status)
                        .success((response) => {
                        if (response.success) {
                            item.marketStatus = status;
                            this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'market.status.changed.success');
                        }
                        else {
                            this.toasterService.showMessages(response.messages);
                        }
                    });
                }
            }
            syncDataStatusChanged(syncData, item) {
                this.marketService.changeSyncData(item.id, syncData)
                    .success((response) => {
                    if (response.success) {
                        item.syncData = syncData;
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'market.syncdata.changed.success');
                    }
                    else {
                        this.toasterService.showMessages(response.messages);
                    }
                });
            }
            getItems(params, filters) {
                var searchquery = {};
                searchquery.marketName = this.$scope.search.marketName;
                searchquery.fromDate = intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromDate);
                searchquery.toDate = intranet.common.helpers.Utility.toDateUTC(this.$scope.search.toDate);
                if (this.$scope.search.marketId != '') {
                    searchquery.marketId = this.$scope.search.marketId;
                }
                if (this.$scope.search.sourceId != '') {
                    searchquery.sourceId = this.$scope.search.sourceId;
                }
                if (parseInt(this.$scope.search.inplay) != -1) {
                    searchquery.inPlay = parseInt(this.$scope.search.inplay);
                }
                if (parseInt(this.$scope.search.status) != -1) {
                    searchquery.status = parseInt(this.$scope.search.status);
                }
                if (parseInt(this.$scope.search.bettingType) != -1) {
                    searchquery.bettingType = parseInt(this.$scope.search.bettingType);
                }
                if (parseInt(this.$scope.search.source) != -1) {
                    searchquery.source = parseInt(this.$scope.search.source);
                }
                var model = { params: params, id: this.$stateParams.eventid, searchQuery: searchquery };
                return this.marketService.getMarketList(model);
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.$scope.search.sourceId = '';
                this.$scope.search.marketId = '';
                this.$scope.search.marketName = '';
                this.$scope.search.fromDate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.search.toDate = new Date(moment().add(1, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.search.inplay = '-1';
                this.$scope.search.status = '2';
                this.$scope.search.bettingType = '-1';
                this.$scope.search.source = '-1';
                this.refreshGrid();
            }
            copy(txt) { this.commonDataService.copyText(txt); }
        }
        admin.MarketCtrl = MarketCtrl;
        angular.module('intranet.admin').controller('marketCtrl', MarketCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MarketCtrl.js.map