module intranet.mobile.account {
    export interface IMobileProfitLossScope extends intranet.common.IScopeBase {

        search: { fromdate: any, todate: any };

        eventSummary: any[];
        plData: any[];
        selectedEventType: any;

        gridData: any[];

        liveGamesId: any;

        dateDiff: any;
        totalItems: any;

        gridDataWithoutGroup: any[];
    }

    export class MobileProfitLossCtrl extends intranet.common.ControllerBase<IMobileProfitLossScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileProfitLossScope,
            private betHistoryService: services.BetHistoryService,
            private $filter: any,
            private exportService: services.ExportService,
            private commonDataService: common.services.CommonDataService,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().add(-6, 'd').format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
            this.$scope.liveGamesId = this.settings.LiveGamesId;
            this.$scope.totalItems = 0;
            this.$scope.gridDataWithoutGroup = [];
            this.$scope.eventSummary = [];

        }

        public loadInitialData(): void {

            //   this.setDates(-1, 'M');
            this.getProfitLoss();
        }


        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.getProfitLoss();
        }

        private viewCards(event: any, item: any): void {
            if (event) { event.stopPropagation(); }
            this.betHistoryService.getMarketById(item.marketId)
                .success((response: common.messaging.IResponse<any>) => {
                    this.commonDataService.viewCards(response.data);
                });
        }



        private getBet(item: any, show: boolean = true): void {
            item.show = !item.show;
            if (show) {
                item.inprogress = true;
                this.betHistoryService.getplBetbyMarketIdUserId(item.marketId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            item.betDetailItems = response.data;
                        }
                    }).finally(() => {
                        item.inprogress = false;
                    });
            }
        }

        private getProfitLoss(): any {
            var searchQuery = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
            };
            this.$scope.dateDiff = moment(searchQuery.toDate).diff(searchQuery.fromDate, 'days');

            this.betHistoryService.getProfitLoss(searchQuery)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response && response.data) {
                        if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'sports') {
                            var data: any[] = [];
                            angular.forEach(response.data, (d: any) => {
                                angular.forEach(d.data, (dp: any) => {
                                    dp.eventTypeId = d.eventTypeId;
                                });
                                data.push(d);
                            });
                            this.$scope.plData = data;
                            this.$scope.eventSummary = data.map((a: any) => { return { eventTypeId: a.eventTypeId, eventTypeName: a.eventTypeName, totalPl: a.totalPl }; });
                            if (this.$scope.eventSummary.length > 0) {
                                this.$scope.selectedEventType = this.$scope.eventSummary[0].eventTypeId;
                                this.changeMarketData();
                            }
                        }
                        else {
                            var data: any[] = [];
                            angular.forEach(response.data, (d: any) => {
                                angular.forEach(d.data, (dp: any) => {
                                    dp.eventTypeId = d.eventTypeId;
                                    data.push(dp);
                                });
                            });
                            data = this.$filter('orderBy')(data, 'settleTime', true);
                            this.$scope.totalItems = data.length;
                            this.$scope.gridData = common.helpers.CommonHelper.groupByDate(data, 'settleTime');

                            this.$scope.gridDataWithoutGroup = data;
                        }
                    } else {
                        this.$scope.totalItems = 0;
                        this.$scope.gridData = [];
                        this.$scope.gridDataWithoutGroup = [];
                    }

                });
        }

        private changeMarketData(id: any = '-1'): void {
            if (id != '-1') { this.$scope.selectedEventType = id; }
            var eventData = this.$scope.plData.filter((a: any) => { return a.eventTypeId == this.$scope.selectedEventType; }) || [];
            if (eventData.length > 0) {
                var d = eventData[0].data;
                this.$scope.gridData = common.helpers.CommonHelper.groupByDate(d, 'settleTime');
                this.$scope.totalItems = this.$scope.gridData.length;
            }
        }

        private exportProfitLoss(params: any, exportType: any): any {
            var searchQuery = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
            };
            return this.exportService.profitLoss({ exportType: exportType, searchQuery: searchQuery, params: params });
        }

        public formatWinner(winner: any, gametype): any {
            return this.commonDataService.formatLiveGameResult(winner, gametype);
        }
    }
    angular.module('intranet.mobile.account').controller('mobileProfitLossCtrl', MobileProfitLossCtrl);
}