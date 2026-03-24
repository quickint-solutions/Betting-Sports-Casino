var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class ManageSportCtrl extends intranet.common.ControllerBase {
            constructor($scope, eventTypeService, commonDataService, toasterService, modalService, eventService, settings, userMarketService) {
                super($scope);
                this.eventTypeService = eventTypeService;
                this.commonDataService = commonDataService;
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.eventService = eventService;
                this.settings = settings;
                this.userMarketService = userMarketService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.inplayStatusList = [];
                this.$scope.userMarketStatus = [];
                this.$scope.search = {
                    inplay: '-1',
                    fromDate: new Date(moment().format("DD MMM YYYY HH:mm")),
                    toDate: new Date(moment().add(1, 'd').format("DD MMM YYYY HH:mm"))
                };
                this.$scope.liveGamesId = this.settings.LiveGamesId;
            }
            loadInitialData() {
                this.loadInplayAndUserMarketStatus();
                this.getEventTypes();
            }
            loadInplayAndUserMarketStatus() {
                this.$scope.inplayStatusList.push({ id: -1, name: '-- InPlay Status --' });
                this.$scope.inplayStatusList.push({ id: 1, name: 'In-Play' });
                this.$scope.inplayStatusList.push({ id: 0, name: 'Going In-Play' });
                var status = intranet.common.enums.UserMarketStatus;
                this.$scope.userMarketStatusList = intranet.common.helpers.Utility.enumToArray(status);
            }
            getMarketStatus(status) {
                return intranet.common.enums.MarketStatus[status];
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
            resetCriteria() {
                this.$scope.search.eventType = null;
                this.$scope.search.event = null;
                this.$scope.search.marketName = '';
                this.$scope.search.fromDate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.$scope.search.toDate = new Date(moment().add(1, 'd').format("DD MMM YYYY HH:mm"));
                this.$scope.search.inplay = '-1';
                this.refreshGrid();
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            setUserMarketParam(item) {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'master.market.update.modal.header';
                if (item.userMarket) {
                    modal.data = {
                        eventName: item.event.name,
                        marketName: item.name,
                        marketId: item.id,
                        userMarketStatus: item.userMarket.userMarketStatus,
                        maxBet: item.userMarket.maxBet,
                        maxLiability: item.userMarket.maxLiability,
                        maxProfit: item.userMarket.maxProfit,
                    };
                }
                modal.bodyUrl = this.settings.ThemeName + '/master/manage-sport/market-param-modal.html';
                modal.controller = 'marketParamModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
            }
            userMarketStatusChanged(status, item) {
                if (item.userMarket) {
                    var data = {
                        marketId: item.id,
                        userMarketStatus: item.userMarket.userMarketStatus,
                        maxBet: item.userMarket.maxBet,
                        maxLiability: item.userMarket.maxLiability,
                        maxProfit: item.userMarket.maxProfit,
                    };
                    this.userMarketService.updateUserMarketParams(data)
                        .success((response) => {
                        if (response.success) {
                            item.userMarket.userMarketStatus = status;
                        }
                        this.toasterService.showMessages(response.messages, 3000);
                    });
                }
            }
            getItems(params, filters) {
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
                var model = { params: params, searchQuery: searchquery };
                return this.userMarketService.getMarketList(model);
            }
        }
        master.ManageSportCtrl = ManageSportCtrl;
        angular.module('intranet.master').controller('manageSportCtrl', ManageSportCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageSportCtrl.js.map