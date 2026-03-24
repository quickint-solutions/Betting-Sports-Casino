
module intranet.home {
    export interface IProfitLossScope extends intranet.common.IScopeBase {
        search: { fromdate: any, todate: any };

        eventSummary: any[];
        plData: any[];
        gridData: any[];
        selectedEventType: any;

        betDetailItems: any;
        marketname: any;
        showBetDetail: any;
        betDetailTemplate: string;
        goBackLabel: any;

        liveGamesId: any;

        gridDataWithoutGroup: any[];
    }

    export class ProfitLossCtrl extends intranet.common.ControllerBase<IProfitLossScope>
        implements intranet.common.init.IInit {
        constructor($scope: IProfitLossScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private betHistoryService: services.BetHistoryService,
            private exportService: services.ExportService,
            private commonDataService: common.services.CommonDataService,
            private $q: ng.IQService,
            private $stateParams: any,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm"))
            };
            this.$scope.eventSummary = [];
            this.$scope.liveGamesId = this.settings.LiveGamesId;
            this.$scope.showBetDetail = false;
            this.$scope.betDetailTemplate = this.settings.ThemeName + '/template/market-pl-detail.html';
            this.$scope.gridDataWithoutGroup = [];
        }

        public loadInitialData(): void {
            //this.setDates(-2, 'y');
            this.getProfitLoss();
        }


        private viewCards(event: any, item: any): void {
            if (event) { event.stopPropagation(); }
            this.betHistoryService.getMarketById(item.marketId)
                .success((response: common.messaging.IResponse<any>) => {
                    this.commonDataService.viewCards(response.data);
                });
        }

        private setDates(num: any, sh: string): void {
            this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
            this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
            this.getProfitLoss();
        }

        private getBet(item: any, show: boolean = true): void {
            item.show = !item.show;
            this.$scope.marketname = item.eventName + ' - ' + item.marketName;
            this.$scope.goBackLabel = item.eventTypeName;
            if (show) {
                var promise: any;
                if (this.$stateParams.memberid) {
                    promise = this.betHistoryService.getplBetbyMarketIdUserId(item.marketId, this.$stateParams.memberid);
                }
                else {
                    promise = this.betHistoryService.getplBetbyMarketIdUserId(item.marketId);
                }

                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.betDetailItems = response.data;
                        item.betDetailItems = response.data;
                    }
                }).finally(() => { this.$scope.showBetDetail = true; });
            }
        }

        private getProfitLoss(): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
            };

            var promise: ng.IHttpPromise<any>;
            if (this.$stateParams.memberid) {
                searchQuery.userId = this.$stateParams.memberid;
            }
            promise = this.betHistoryService.getProfitLoss(searchQuery);

            promise.success((response: common.messaging.IResponse<any>) => {
                if (response && response.data) {
                    this.$scope.plData = response.data;
                    this.$scope.eventSummary = response.data.map((a: any) => { return { eventTypeId: a.eventTypeId, eventTypeName: a.eventTypeName, totalPl: a.totalPl }; });
                    if (this.$scope.eventSummary.length > 0) {
                        this.$scope.selectedEventType = this.$scope.eventSummary[0].eventTypeId;
                        this.changeMarketData();
                    }
                }
            });
        }


        private changeMarketData(id: any = '-1'): void {
            if (id != '-1') { this.$scope.selectedEventType = id; }
            var eventData = this.$scope.plData.filter((a: any) => { return a.eventTypeId == this.$scope.selectedEventType; }) || [];
            if (eventData.length > 0) {
                var d = eventData[0].data;
                this.$scope.gridData = common.helpers.CommonHelper.groupByDate(d, 'settleTime');

                // for fairbook
                this.$scope.gridDataWithoutGroup = eventData[0].data;
            }
        }

        private goback() {
            this.$scope.showBetDetail = false;
        }

        public formatWinner(winner: any, gametype: any): any {
            return this.commonDataService.formatLiveGameResult(winner, gametype);
        }
    }
    angular.module('intranet.home').controller('profitLossCtrl', ProfitLossCtrl);
}