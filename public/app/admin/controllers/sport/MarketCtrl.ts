module intranet.admin {

    export interface IMarketScope extends intranet.common.IScopeBase {
        listNewItems: any[];
        gridItems: any[];

        inplayStatus: any[];
        marketStatusList: any[];

        search: any;
        inplayStatusList: any[];
        statusList: any[];
        bettingTypeList: any[];
        marketSourceList: any[];

        syncStatus: any[];
        liveGamesId: any;
    }

    export class MarketCtrl extends intranet.common.ControllerBase<IMarketScope>
        implements common.init.IInit {
        constructor($scope: IMarketScope,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings,
            private commonDataService: common.services.CommonDataService,
            private $stateParams: any,
            private $timeout: ng.ITimeoutService,
            private $filter: any,
            private marketService: services.MarketService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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

        public loadInitialData(): void {
            this.loadFilterLists();
            this.loadButtonItems();
            this.loadInplayAndSyncStatus();
            this.loadMarketStatus();
        }

        private loadFilterLists(): void {
            this.$scope.inplayStatusList.push({ id: -1, name: '-- InPlay Status --' });
            this.$scope.inplayStatusList.push({ id: 1, name: 'In-Play' });
            this.$scope.inplayStatusList.push({ id: 0, name: 'Going In-Play' });

            var betType: any = common.enums.BettingType;
            this.$scope.bettingTypeList = common.helpers.Utility.enumToArray<common.enums.BettingType>(betType);
            this.$scope.bettingTypeList.splice(0, 0, { id: -1, name: '-- Betting Type --' });

            var eventsource: any = common.enums.EventSource;
            this.$scope.marketSourceList = common.helpers.Utility.enumToArray<common.enums.EventSource>(eventsource);
            this.$scope.marketSourceList.splice(0, 0, { id: -1, name: '-- Source --' });
        }

        private loadButtonItems(): void {
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

        private loadInplayAndSyncStatus(): void {
            this.$scope.inplayStatus.push({ id: true, name: 'true' });
            this.$scope.inplayStatus.push({ id: false, name: 'false' });

            this.$scope.syncStatus.push({ id: true, name: 'true' });
            this.$scope.syncStatus.push({ id: false, name: 'false' });
        }

        private loadMarketStatus(): void {
            var status: any = common.enums.MarketStatus;
            this.$scope.marketStatusList = common.helpers.Utility.enumToArray<common.enums.MarketStatus>(status);
            this.$scope.statusList = common.helpers.Utility.enumToArray<common.enums.MarketStatus>(status);
        }

        public getBettingType(bettingType: any): string {
            return common.enums.BettingType[bettingType];
        }

        public getLadderType(ladderType: any): string {
            return common.enums.PriceLadderType[ladderType];
        }


        private addMarket(item: any = null): void {
            var modal = new common.helpers.CreateModal();
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

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }

        private copyMarket(item: any): void {
            var modal = new common.helpers.CreateModal();

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

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }

        private deleteMarket(marketId: any): void {
            this.marketService.deleteMarket(marketId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
        }
        private selectAllMarkets(): void {
            if (this.$scope.gridItems && this.$scope.gridItems.length > 0) {
                this.$scope.gridItems.forEach((x: any) => { x.isDelete = true; });
            }
        }
        private deleteSelectedMarkets(): void {
            var self = this;
            var deleteMarket = ((id: any, isLast: boolean) => {
                self.marketService.deleteMarket(id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (isLast) {
                            this.$scope.$broadcast('refreshGrid');
                            this.toasterService.showMessages(response.messages, 5000);
                        }
                    });
            });

            if (this.$scope.gridItems && this.$scope.gridItems.length > 0) {
                var marketIds = this.$scope.gridItems.filter((m: any) => { return m.isDelete == true; }).map((a: any) => { return a.id; }) || [];
                angular.forEach(marketIds, (id: any, index: any) => {
                    this.$timeout(() => { deleteMarket(id, index == (marketIds.length - 1)); }, 1000);
                });
            }
        }

        private addRunner(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'admin.runner.add.modal.header';
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-runner-modal.html';
            modal.controller = 'addRunnerModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
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
                || item.gameType == common.enums.GameType.Card32
                || item.gameType == common.enums.GameType.ClashOfKings
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
            if (item.gameType == common.enums.GameType.Patti3 || item.gameType == common.enums.GameType.Patti2 || item.gameType == common.enums.GameType.Poker
                || item.gameType == common.enums.GameType.Up7Down) {
                return this.commonDataService.formatLiveGameResult(item.marketRunner.filter((m: any) => { return m.status == common.enums.RunnerStatus.WINNER }), item.gameType);
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

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var searchquery: any = {};
            searchquery.marketName = this.$scope.search.marketName;
            searchquery.fromDate = common.helpers.Utility.fromDateUTC(this.$scope.search.fromDate);
            searchquery.toDate = common.helpers.Utility.toDateUTC(this.$scope.search.toDate);
            if (this.$scope.search.marketId != '') { searchquery.marketId = this.$scope.search.marketId; }
            if (this.$scope.search.sourceId != '') { searchquery.sourceId = this.$scope.search.sourceId; }
            if (parseInt(this.$scope.search.inplay) != -1) { searchquery.inPlay = parseInt(this.$scope.search.inplay); }
            if (parseInt(this.$scope.search.status) != -1) { searchquery.status = parseInt(this.$scope.search.status); }
            if (parseInt(this.$scope.search.bettingType) != -1) { searchquery.bettingType = parseInt(this.$scope.search.bettingType); }
            if (parseInt(this.$scope.search.source) != -1) { searchquery.source = parseInt(this.$scope.search.source); }

            var model = { params: params, id: this.$stateParams.eventid, searchQuery: searchquery };
            return this.marketService.getMarketList(model);
        }

        private refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        private resetCriteria(): void {
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

        private copy(txt) { this.commonDataService.copyText(txt); }
    }

    angular.module('intranet.admin').controller('marketCtrl', MarketCtrl);
}