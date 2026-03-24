module intranet.admin {

    export interface IManageMarketScope extends intranet.common.IScopeBase {
        search: any;
        gridItems: any;

        // toggle buttons
        inplayStatus: any[];
        marketStatus: any[];
        syncStatus: any[];
        tempStatus: any[];

        // for filters
        eventTypeList: any[];
        eventList: any[];
        inplayStatusList: any[];
        marketStatusList: any[];
        bettingTypeList: any[];
        marketSourceList: any[];

        liveGamesId: any;

        all_marketStatus: any[];
        all_tempStatus: any[];
        all_selector: any;
    }

    export class ManageMarketCtrl extends intranet.common.ControllerBase<IManageMarketScope>
        implements common.init.IInit {
        constructor($scope: IManageMarketScope,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings,
            private eventTypeService: services.EventTypeService,
            private commonDataService: common.services.CommonDataService,
            private eventService: services.EventService,
            private $filter: any,
            private marketService: services.MarketService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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

        public loadInitialData(): void {
            this.loadInplayAndSyncStatus();
            this.loadMarketStatus();
            this.loadBettingType();
            this.loadMarketSource();
            this.loadTemporaryStatus();

            this.getEventTypes();
            //this.getEvents();
        }

        private loadInplayAndSyncStatus(): void {
            this.$scope.inplayStatus.push({ id: true, name: 'true' });
            this.$scope.inplayStatus.push({ id: false, name: 'false' });

            this.$scope.syncStatus.push({ id: true, name: 'true' });
            this.$scope.syncStatus.push({ id: false, name: 'false' });

            this.$scope.inplayStatusList.push({ id: -1, name: '-- InPlay Status --' });
            this.$scope.inplayStatusList.push({ id: 1, name: 'In-Play' });
            this.$scope.inplayStatusList.push({ id: 0, name: 'Going In-Play' });
        }

        private loadMarketStatus(): void {
            var status: any = common.enums.MarketStatus;
            this.$scope.marketStatus = common.helpers.Utility.enumToArray<common.enums.MarketStatus>(status);
            this.$scope.marketStatusList = common.helpers.Utility.enumToArray<common.enums.MarketStatus>(status);
            this.$scope.all_marketStatus = common.helpers.Utility.enumToArray<common.enums.MarketStatus>(status);
        }

        private loadBettingType(): void {
            var betType: any = common.enums.BettingType;
            this.$scope.bettingTypeList = common.helpers.Utility.enumToArray<common.enums.BettingType>(betType);
            this.$scope.bettingTypeList.splice(0, 0, { id: -1, name: '-- Betting Type --' });
        }

        private loadMarketSource(): void {
            var eventsource: any = common.enums.EventSource;
            this.$scope.marketSourceList = common.helpers.Utility.enumToArray<common.enums.EventSource>(eventsource);
            this.$scope.marketSourceList.splice(0, 0, { id: -1, name: '-- Source --' });
        }

        private loadTemporaryStatus(): void {
            var status: any = common.enums.TemporaryStatus;
            this.$scope.tempStatus = common.helpers.Utility.enumToArray<common.enums.TemporaryStatus>(status);
            this.$scope.all_tempStatus = common.helpers.Utility.enumToArray<common.enums.TemporaryStatus>(status);
        }

        public getBettingType(bettingType: any): string {
            return common.enums.BettingType[bettingType];
        }

        public getLadderType(ladderType: any): string {
            return common.enums.PriceLadderType[ladderType];
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


        private getRunnerModal(item: any, reclose: boolean = false): any {
            var modal = new common.helpers.CreateModal();
            modal.data = {
                marketRunner: [],
                bettingType: item.bettingType,
                reclose: reclose,
                gameType: item.gameType,
                winner: item.winner,
                marketId: item.id,
            };
            angular.copy(item.marketRunner, modal.data.marketRunner);

            var msg: string = this.$filter('translate')('admin.runner.status.modal.header');
            msg = msg.format('"' + item.name + ' # ' + item.id + '"');
            modal.header = msg;

            if (item.gameType == common.enums.GameType.Patti2 || item.gameType == common.enums.GameType.Patti3
                || item.gameType == common.enums.GameType.PokerT20
                || item.gameType == common.enums.GameType.Up7Down
                || item.gameType == common.enums.GameType.ClashOfKings
                || item.gameType == common.enums.GameType.Card32
                || item.gameType == common.enums.GameType.DragonTiger) {
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

        private runnerStatus(item: any): void {
            var modal = this.getRunnerModal(item, true);
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }

        private viewCards(item: any): void {
            this.commonDataService.viewCards(item);
        }

        private getGameResult(item: any): any {
            if (item.gameType == common.enums.GameType.Patti3 || item.gameType == common.enums.GameType.Patti2
                || item.gameType == common.enums.GameType.Poker || item.gameType == common.enums.GameType.Up7Down) {
                return this.commonDataService.formatLiveGameResult(
                    item.marketRunner.filter((m: any) => {
                        return m.status == common.enums.RunnerStatus.WINNER
                    }), item.gameType);
            }
            else {
                var rr = item.marketRunner.filter((m: any) => { return m.status == common.enums.RunnerStatus.WINNER }) || [];
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

        private setNotification(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.data = {
                id: item.id,
                notification: item.notification
            }
            modal.header = 'admin.market.notification.modal.header';
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-notification-modal.html';
            modal.controller = 'addNotificationModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults)
                .then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
        }

        private inPlayStatusChanged(inplay: any, item: any): void {
            this.marketService.changeInPlay(item.id, inplay)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        item.inPlay = inplay;
                        this.toasterService.showToast(common.helpers.ToastType.Success, 'market.inplay.changed.success');
                    } else {
                        this.toasterService.showMessages(response.messages);
                    }
                });
        }

        private marketStatusChanged(status: any, item: any): void {
            if (status == common.enums.MarketStatus.CLOSED) {
                var modal = this.getRunnerModal(item);
                this.modalService.showWithOptions(modal.options, modal.modalDefaults)
                    .then((result: any) => {
                        if (result.button == common.services.ModalResult.OK) {
                            item.marketStatus = status;
                        }
                    });
            }
            else {
                this.marketService.changeStatus(item.id, status)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            item.marketStatus = status;
                            this.toasterService.showToast(common.helpers.ToastType.Success, 'market.status.changed.success');
                        } else {
                            this.toasterService.showMessages(response.messages);
                        }
                    });
            }
        }

        private syncDataStatusChanged(syncData: any, item: any): void {
            this.marketService.changeSyncData(item.id, syncData)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        item.syncData = syncData;
                        this.toasterService.showToast(common.helpers.ToastType.Success, 'market.syncdata.changed.success');
                    } else {
                        this.toasterService.showMessages(response.messages);
                    }
                });
        }

        private temporaryStatusChanged(status: any, item: any): void {
            this.marketService.changeTemporaryStatus(item.id, status)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        item.temporaryStatus = status;
                        this.toasterService.showToast(common.helpers.ToastType.Success, 'market.tempstatus.changed.success');
                    } else {
                        this.toasterService.showMessages(response.messages);
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
            this.$scope.search.status = '2';
            this.$scope.search.bettingType = '-1';
            this.$scope.search.source = '-1';
            this.refreshGrid();
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        private editCloseMarket(item:any): void {
            var modal = new common.helpers.CreateModal();
            modal.data = {
                id: item.id,
                name: item.name,
                allowCommission: item.allowCommission
            }
            modal.header = 'Edit - '+item.name;
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/edit-close-market-modal.html';
            modal.controller = 'editCloseMarketModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults)
                .then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.refreshGrid();
                    }
                });
        }


        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            this.$scope.all_selector = {};

            var searchquery: any = {};
            if (this.$scope.search.eventType) { searchquery.eventTypeId = this.$scope.search.eventType.id; }
            if (this.$scope.search.event) { searchquery.eventId = this.$scope.search.event.id; }

            searchquery.marketName = this.$scope.search.marketName;
            searchquery.fromDate = common.helpers.Utility.fromDateUTC(this.$scope.search.fromDate);
            searchquery.toDate = common.helpers.Utility.toDateUTC(this.$scope.search.toDate);
            if (parseInt(this.$scope.search.inplay) != -1) { searchquery.inPlay = parseInt(this.$scope.search.inplay); }
            if (parseInt(this.$scope.search.status) != -1) { searchquery.status = parseInt(this.$scope.search.status); }
            if (parseInt(this.$scope.search.bettingType) != -1) { searchquery.bettingType = parseInt(this.$scope.search.bettingType); }
            if (parseInt(this.$scope.search.source) != -1) { searchquery.source = parseInt(this.$scope.search.source); }

            var model = { params: params, searchQuery: searchquery };
            return this.marketService.searchMarket(model);
        }

        private updateMarketRate(item: any) {
            var modal = new common.helpers.CreateModal();
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
            var msg: string = this.$filter('translate')('admin.market.volumn.modal.header');
            msg = msg.format('"' + item.name + '"');
            modal.header = msg;
            modal.bodyUrl = this.settings.ThemeName + '/admin/betfair/bot-param-modal.html';
            modal.controller = 'botParamModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    var data = result.data;
                    data.id = item.id;
                    this.marketService.changeMarketParams(data)
                        .success((response: common.messaging.IResponse<any>) => {
                            this.refreshGrid();
                            this.toasterService.showMessages(response.messages, 3000);
                        });
                }
            });
        }

        private allMarketStatusChanged(selectedId: any): void {
            if (selectedId != common.enums.MarketStatus.CLOSED) {
                var data: any[] = this.$scope.gridItems.map((gd: any) => { return { marketId: gd.id, marketStatus: selectedId } });
                if (data.length > 0) {
                    this.marketService.changeMultiMarketStatus(data)
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.$scope.all_selector.marketStatus = selectedId;
                            }
                            this.refreshGrid();
                            this.toasterService.showMessages(response.messages);
                        });
                }
            }
        }

        private allTemporaryStatusChanged(selectedId: any): void {
            var data = this.$scope.gridItems.map((gd: any) => { return { marketId: gd.id, temporaryStatus: selectedId } });
            if (data.length > 0) {
                this.marketService.changeMultiTempStatus(data)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.all_selector.temporaryStatus = selectedId;
                        }
                        this.refreshGrid();
                        this.toasterService.showMessages(response.messages);
                    });
            }
        }

        private copy(txt) { console.log(txt); this.commonDataService.copyText(txt); }
    }

    angular.module('intranet.admin').controller('manageMarketCtrl', ManageMarketCtrl);
}