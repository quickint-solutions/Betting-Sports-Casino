var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ManageMarketCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, toasterService, settings, eventTypeService, commonDataService, eventService, $filter, marketService) {
                super($scope);
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.settings = settings;
                this.eventTypeService = eventTypeService;
                this.commonDataService = commonDataService;
                this.eventService = eventService;
                this.$filter = $filter;
                this.marketService = marketService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.inplayStatus = [];
                this.$scope.marketStatus = [];
                this.$scope.syncStatus = [];
                this.$scope.tempStatus = [];
                this.$scope.inplayStatusList = [];
                this.$scope.marketStatusList = [];
                this.$scope.bettingTypeList = [];
                this.$scope.all_marketStatus = [];
                this.$scope.all_tempStatus = [];
                this.$scope.all_selector = {};
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
                this.loadInplayAndSyncStatus();
                this.loadMarketStatus();
                this.loadBettingType();
                this.loadMarketSource();
                this.loadTemporaryStatus();
                this.getEventTypes();
            }
            loadInplayAndSyncStatus() {
                this.$scope.inplayStatus.push({ id: true, name: 'true' });
                this.$scope.inplayStatus.push({ id: false, name: 'false' });
                this.$scope.syncStatus.push({ id: true, name: 'true' });
                this.$scope.syncStatus.push({ id: false, name: 'false' });
                this.$scope.inplayStatusList.push({ id: -1, name: '-- InPlay Status --' });
                this.$scope.inplayStatusList.push({ id: 1, name: 'In-Play' });
                this.$scope.inplayStatusList.push({ id: 0, name: 'Going In-Play' });
            }
            loadMarketStatus() {
                var status = intranet.common.enums.MarketStatus;
                this.$scope.marketStatus = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.marketStatusList = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.all_marketStatus = intranet.common.helpers.Utility.enumToArray(status);
            }
            loadBettingType() {
                var betType = intranet.common.enums.BettingType;
                this.$scope.bettingTypeList = intranet.common.helpers.Utility.enumToArray(betType);
                this.$scope.bettingTypeList.splice(0, 0, { id: -1, name: '-- Betting Type --' });
            }
            loadMarketSource() {
                var eventsource = intranet.common.enums.EventSource;
                this.$scope.marketSourceList = intranet.common.helpers.Utility.enumToArray(eventsource);
                this.$scope.marketSourceList.splice(0, 0, { id: -1, name: '-- Source --' });
            }
            loadTemporaryStatus() {
                var status = intranet.common.enums.TemporaryStatus;
                this.$scope.tempStatus = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.all_tempStatus = intranet.common.helpers.Utility.enumToArray(status);
            }
            getBettingType(bettingType) {
                return intranet.common.enums.BettingType[bettingType];
            }
            getLadderType(ladderType) {
                return intranet.common.enums.PriceLadderType[ladderType];
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
                    }
                });
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
                    || item.gameType == intranet.common.enums.GameType.ClashOfKings
                    || item.gameType == intranet.common.enums.GameType.Card32
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
                if (item.gameType == intranet.common.enums.GameType.Patti3 || item.gameType == intranet.common.enums.GameType.Patti2
                    || item.gameType == intranet.common.enums.GameType.Poker || item.gameType == intranet.common.enums.GameType.Up7Down) {
                    return this.commonDataService.formatLiveGameResult(item.marketRunner.filter((m) => {
                        return m.status == intranet.common.enums.RunnerStatus.WINNER;
                    }), item.gameType);
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
            setNotification(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {
                    id: item.id,
                    notification: item.notification
                };
                modal.header = 'admin.market.notification.modal.header';
                modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-notification-modal.html';
                modal.controller = 'addNotificationModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults)
                    .then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
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
            temporaryStatusChanged(status, item) {
                this.marketService.changeTemporaryStatus(item.id, status)
                    .success((response) => {
                    if (response.success) {
                        item.temporaryStatus = status;
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'market.tempstatus.changed.success');
                    }
                    else {
                        this.toasterService.showMessages(response.messages);
                    }
                });
            }
            resetCriteria() {
                this.$scope.search.eventType = null;
                this.$scope.search.event = null;
                this.$scope.search.marketName = '';
                this.$scope.search.fromDate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.search.toDate = new Date(moment().add(1, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.search.inplay = '-1';
                this.$scope.search.status = '2';
                this.$scope.search.bettingType = '-1';
                this.$scope.search.source = '-1';
                this.refreshGrid();
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            editCloseMarket(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {
                    id: item.id,
                    name: item.name,
                    allowCommission: item.allowCommission
                };
                modal.header = 'Edit - ' + item.name;
                modal.bodyUrl = this.settings.ThemeName + '/admin/sport/edit-close-market-modal.html';
                modal.controller = 'editCloseMarketModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults)
                    .then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
            getItems(params, filters) {
                this.$scope.all_selector = {};
                var searchquery = {};
                if (this.$scope.search.eventType) {
                    searchquery.eventTypeId = this.$scope.search.eventType.id;
                }
                if (this.$scope.search.event) {
                    searchquery.eventId = this.$scope.search.event.id;
                }
                searchquery.marketName = this.$scope.search.marketName;
                searchquery.fromDate = intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromDate);
                searchquery.toDate = intranet.common.helpers.Utility.toDateUTC(this.$scope.search.toDate);
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
                var model = { params: params, searchQuery: searchquery };
                return this.marketService.searchMarket(model);
            }
            updateMarketRate(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.data = {
                    onlyRate: true,
                    volumeRate: item.volumeRate,
                    inPlayVolumeRate: item.inPlayVolumeRate,
                    maxBet: item.maxBet,
                    maxLiability: item.maxLiability,
                    maxProfit: item.maxProfit,
                    marketRuleId: item.marketRuleId,
                    allowLimit: item.allowLimit,
                    inPlayAllowLimit: item.inPlayAllowLimit,
                    temporaryStatus: item.temporaryStatus,
                    betOpenTime: item.betOpenTime,
                    betCloseTime: item.betCloseTime,
                    displayOrder: item.displayOrder,
                    allowBetUpTo: item.allowBetUpTo,
                    allowBetDownTo: item.allowBetDownTo,
                    limitOddsDiff: item.limitOddsDiff,
                    betDelay: item.betDelay,
                };
                var msg = this.$filter('translate')('admin.market.volumn.modal.header');
                msg = msg.format('"' + item.name + '"');
                modal.header = msg;
                modal.bodyUrl = this.settings.ThemeName + '/admin/betfair/bot-param-modal.html';
                modal.controller = 'botParamModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        var data = result.data;
                        data.id = item.id;
                        this.marketService.changeMarketParams(data)
                            .success((response) => {
                            this.refreshGrid();
                            this.toasterService.showMessages(response.messages, 3000);
                        });
                    }
                });
            }
            allMarketStatusChanged(selectedId) {
                if (selectedId != intranet.common.enums.MarketStatus.CLOSED) {
                    var data = this.$scope.gridItems.map((gd) => { return { marketId: gd.id, marketStatus: selectedId }; });
                    if (data.length > 0) {
                        this.marketService.changeMultiMarketStatus(data)
                            .success((response) => {
                            if (response.success) {
                                this.$scope.all_selector.marketStatus = selectedId;
                            }
                            this.refreshGrid();
                            this.toasterService.showMessages(response.messages);
                        });
                    }
                }
            }
            allTemporaryStatusChanged(selectedId) {
                var data = this.$scope.gridItems.map((gd) => { return { marketId: gd.id, temporaryStatus: selectedId }; });
                if (data.length > 0) {
                    this.marketService.changeMultiTempStatus(data)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.all_selector.temporaryStatus = selectedId;
                        }
                        this.refreshGrid();
                        this.toasterService.showMessages(response.messages);
                    });
                }
            }
            copy(txt) { console.log(txt); this.commonDataService.copyText(txt); }
        }
        admin.ManageMarketCtrl = ManageMarketCtrl;
        angular.module('intranet.admin').controller('manageMarketCtrl', ManageMarketCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageMarketCtrl.js.map