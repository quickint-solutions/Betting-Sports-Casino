module intranet.master {

    export interface IManageSportScope extends intranet.common.IScopeBase {
        search: any;

        // for filters
        eventTypeList: any[];
        eventList: any[];
        inplayStatusList: any[];
        userMarketStatusList: any[];



        userMarketStatus: any[];
        liveGamesId: any;
    }

    export class ManageSportCtrl extends intranet.common.ControllerBase<IManageSportScope>
        implements common.init.IInit {
        constructor($scope: IManageSportScope,
            private eventTypeService: services.EventTypeService,
            private commonDataService: common.services.CommonDataService,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private eventService: services.EventService,
            private settings: common.IBaseSettings,
            private userMarketService: services.UserMarketService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.inplayStatusList = [];
            this.$scope.userMarketStatus = [];

            this.$scope.search = {
                inplay: '-1',
                fromDate: new Date(moment().format("DD MMM YYYY HH:mm")),
                toDate: new Date(moment().add(1, 'd').format("DD MMM YYYY HH:mm"))
            };
            this.$scope.liveGamesId = this.settings.LiveGamesId;
        }

        public loadInitialData(): void {
            this.loadInplayAndUserMarketStatus();
            this.getEventTypes();
        }

        private loadInplayAndUserMarketStatus(): void {
            this.$scope.inplayStatusList.push({ id: -1, name: '-- InPlay Status --' });
            this.$scope.inplayStatusList.push({ id: 1, name: 'In-Play' });
            this.$scope.inplayStatusList.push({ id: 0, name: 'Going In-Play' });

            var status: any = common.enums.UserMarketStatus;
            this.$scope.userMarketStatusList = common.helpers.Utility.enumToArray<common.enums.UserMarketStatus>(status);
        }

        public getMarketStatus(status: any): string {
            return common.enums.MarketStatus[status];
        }

        private getEventTypes(): void {
            this.eventTypeService.getEventTypes()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventTypeList = response.data;
                    }
                });
        }

        private getEvents(): void {
            this.$scope.search.event = null;
            this.eventService.searchEvent(this.$scope.search.eventType.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventList = response.data;
                    }
                });
        }

        private resetCriteria(): void {
            this.$scope.search.eventType = null;
            this.$scope.search.event = null;
            this.$scope.search.marketName = '';
            this.$scope.search.fromDate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.$scope.search.toDate = new Date(moment().add(1, 'd').format("DD MMM YYYY HH:mm"));
            this.$scope.search.inplay = '-1';
            this.refreshGrid();
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        private setUserMarketParam(item: any): void {
            var modal = new common.helpers.CreateModal();
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
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.refreshGrid();
                }
            });
        }

        private userMarketStatusChanged(status: any, item: any): void {
            if (item.userMarket) {
                var data = {
                    marketId: item.id,
                    userMarketStatus: item.userMarket.userMarketStatus,
                    maxBet: item.userMarket.maxBet,
                    maxLiability: item.userMarket.maxLiability,
                    maxProfit: item.userMarket.maxProfit,
                };
                this.userMarketService.updateUserMarketParams(data)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            item.userMarket.userMarketStatus = status;
                        }
                        this.toasterService.showMessages(response.messages, 3000);
                    });
            }
        }

        //callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchquery: any = {};
            if (this.$scope.search.eventType) { searchquery.eventTypeId = this.$scope.search.eventType.id; }
            if (this.$scope.search.event) { searchquery.eventId = this.$scope.search.event.id; }

            searchquery.marketName = this.$scope.search.marketName;
            searchquery.fromDate = common.helpers.Utility.fromDateUTC(this.$scope.search.fromDate);
            searchquery.toDate = common.helpers.Utility.toDateUTC(this.$scope.search.toDate);
            if (parseInt(this.$scope.search.inplay) != -1) { searchquery.inPlay = parseInt(this.$scope.search.inplay); }

            var model = { params: params, searchQuery: searchquery };
            return this.userMarketService.getMarketList(model);
        }

    }
    angular.module('intranet.master').controller('manageSportCtrl', ManageSportCtrl);
}