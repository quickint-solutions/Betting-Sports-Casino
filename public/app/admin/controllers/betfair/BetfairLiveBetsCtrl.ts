module intranet.admin {

    export interface IBetfairLiveBetsScope extends intranet.common.IScopeBase {
        refreshIntervals: any[];
        timer: any;
        search: any;
        selectedInterval: any;
        btBtes: any;

        // for filter
        eventTypeList: any[];
        competitionList: any[];
        eventList: any[];
        marketList: any[];
        orderProjection: any[];
        orderBy: any[];
    }

    export class BetfairLiveBetsCtrl extends intranet.common.ControllerBase<IBetfairLiveBetsScope>
        implements common.init.IInit {
        constructor($scope: IBetfairLiveBetsScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private eventTypeService: services.EventTypeService,
            private competitionService: services.CompetitionService,
            private eventService: services.EventService,
            private marketService: services.MarketService,
            private userService: services.UserService,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private betService: services.BetService,
            private settings: common.IBaseSettings) {
            super($scope);

            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timer);
            });
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.refreshIntervals = [];
            this.$scope.orderBy = [];
            this.$scope.orderProjection = [];
            this.$scope.search = {};
        }

        public loadInitialData(): void {
            this.fillRefreshInterval();
            this.fillOrderProjection();
            this.fillOrderBy();

            this.getEventTypes();
            this.getBTBets();
        }

        private fillOrderProjection(): void {
            this.$scope.orderProjection.push({ name: 'ALL', value: 'ALL' });
            this.$scope.orderProjection.push({ name: 'EXECUTABLE', value: 'EXECUTABLE' });
            this.$scope.orderProjection.push({ name: 'EXECUTION COMPLETE', value: 'EXECUTION_COMPLETE' });
            this.$scope.search.orderProjection = 'ALL';
        }

        private fillOrderBy(): void {
            this.$scope.orderBy.push({ name: 'BY BET', value: 'BY_BET' });
            this.$scope.orderBy.push({ name: 'BY MARKET', value: 'BY_MARKET' });
            this.$scope.orderBy.push({ name: 'BY MATCH TIME', value: 'BY_MATCH_TIME' });
            this.$scope.orderBy.push({ name: 'BY PLACE TIME', value: 'BY_PLACE_TIME' });
            this.$scope.orderBy.push({ name: 'BY SETTLED TIME', value: 'BY_SETTLED_TIME' });
            this.$scope.orderBy.push({ name: 'BY VOID TIME', value: 'BY_VOID_TIME' });
            this.$scope.search.orderBy = 'BY_BET';
        }

        private fillRefreshInterval(): void {
            this.$scope.refreshIntervals.push({ name: '10 sec', value: 10 });
            this.$scope.refreshIntervals.push({ name: '15 sec', value: 15 });
            this.$scope.refreshIntervals.push({ name: '20 sec', value: 20 });
            this.$scope.refreshIntervals.push({ name: '25 sec', value: 25 });
            this.$scope.refreshIntervals.push({ name: '30 sec', value: 30 });
            this.$scope.refreshIntervals.push({ name: '60 sec', value: 60 });
            this.$scope.refreshIntervals.push({ name: 'Stop', value: 0 });
            this.$scope.selectedInterval = '10';
        }

        private getBetStatus(value:any): any{
            return common.enums.BetStatus[value];
        }


        private getEventTypes(): void {
            this.eventTypeService.getEventTypes()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventTypeList = response.data;
                    }
                });
        }

        private getCompetitions(): void {
            this.$scope.search.competition = null;
            this.competitionService.searchCompetitions(this.$scope.search.eventType.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.competitionList = response.data;
                        this.$scope.search.event = null;
                        this.$scope.search.market = null;
                    }
                });
        }

        private getEvents(): void {
            this.$scope.search.event = null;
            this.eventService.searchEvent(this.$scope.search.competition.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventList = response.data;
                        this.$scope.search.market = null;
                    }
                });
        }

        private getMarkets(): void {
            this.$scope.search.market = null;
            this.marketService.getMarketByEventId(this.$scope.search.event.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.marketList = response.data.filter((m: any) => { return m.sourceId; });
                    }
                });
        }


        private getBTBets(): void {
            if (this.$scope.timer) { this.$timeout.cancel(this.$scope.timer); }
            var searchQuery = {
                eventTypeId: this.$scope.search.eventType ? this.$scope.search.eventType.id : 0,
                competitionId: this.$scope.search.competition ? this.$scope.search.competition.id : 0,
                eventId: this.$scope.search.event ? this.$scope.search.event.id : 0,
                sourceId: this.$scope.search.market ? this.$scope.search.market.sourceId : '',
                marketId: this.$scope.search.market ? this.$scope.search.market.id : '',
                orderBy: this.$scope.search.orderBy,
                orderProjection: this.$scope.search.orderProjection
            };
            this.betService.getBTLiveBets(searchQuery)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.btBtes = response.data;
                    }
                }).finally(() => {
                    if (this.$scope.selectedInterval != 0 && !this.$scope.$$destroyed) {
                        this.$scope.timer = this.$timeout(() => {
                            this.getBTBets();
                        }, this.$scope.selectedInterval * 1000);
                    }
                });
        }


        private intervalChanged(): void {
            if (this.$scope.selectedInterval != 0) { this.getBTBets(); }
            else { this.$timeout.cancel(this.$scope.timer); }
        }

        private resetCriteria(): void {
            this.$scope.search.orderProjection = 'ALL';
            this.$scope.search.orderBy = 'BY_BET';
            this.$scope.selectedInterval = '10';
            this.$scope.search.eventType = null;
            this.$scope.search.competition = null;
            this.$scope.search.event = null;
            this.$scope.search.market = null;
            this.getBTBets();
        }
    }
    angular.module('intranet.admin').controller('betfairLiveBetsCtrl', BetfairLiveBetsCtrl);
}