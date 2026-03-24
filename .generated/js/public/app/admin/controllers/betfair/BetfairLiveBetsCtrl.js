var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class BetfairLiveBetsCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, eventTypeService, competitionService, eventService, marketService, userService, $q, $timeout, betService, settings) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.eventTypeService = eventTypeService;
                this.competitionService = competitionService;
                this.eventService = eventService;
                this.marketService = marketService;
                this.userService = userService;
                this.$q = $q;
                this.$timeout = $timeout;
                this.betService = betService;
                this.settings = settings;
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer);
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.refreshIntervals = [];
                this.$scope.orderBy = [];
                this.$scope.orderProjection = [];
                this.$scope.search = {};
            }
            loadInitialData() {
                this.fillRefreshInterval();
                this.fillOrderProjection();
                this.fillOrderBy();
                this.getEventTypes();
                this.getBTBets();
            }
            fillOrderProjection() {
                this.$scope.orderProjection.push({ name: 'ALL', value: 'ALL' });
                this.$scope.orderProjection.push({ name: 'EXECUTABLE', value: 'EXECUTABLE' });
                this.$scope.orderProjection.push({ name: 'EXECUTION COMPLETE', value: 'EXECUTION_COMPLETE' });
                this.$scope.search.orderProjection = 'ALL';
            }
            fillOrderBy() {
                this.$scope.orderBy.push({ name: 'BY BET', value: 'BY_BET' });
                this.$scope.orderBy.push({ name: 'BY MARKET', value: 'BY_MARKET' });
                this.$scope.orderBy.push({ name: 'BY MATCH TIME', value: 'BY_MATCH_TIME' });
                this.$scope.orderBy.push({ name: 'BY PLACE TIME', value: 'BY_PLACE_TIME' });
                this.$scope.orderBy.push({ name: 'BY SETTLED TIME', value: 'BY_SETTLED_TIME' });
                this.$scope.orderBy.push({ name: 'BY VOID TIME', value: 'BY_VOID_TIME' });
                this.$scope.search.orderBy = 'BY_BET';
            }
            fillRefreshInterval() {
                this.$scope.refreshIntervals.push({ name: '10 sec', value: 10 });
                this.$scope.refreshIntervals.push({ name: '15 sec', value: 15 });
                this.$scope.refreshIntervals.push({ name: '20 sec', value: 20 });
                this.$scope.refreshIntervals.push({ name: '25 sec', value: 25 });
                this.$scope.refreshIntervals.push({ name: '30 sec', value: 30 });
                this.$scope.refreshIntervals.push({ name: '60 sec', value: 60 });
                this.$scope.refreshIntervals.push({ name: 'Stop', value: 0 });
                this.$scope.selectedInterval = '10';
            }
            getBetStatus(value) {
                return intranet.common.enums.BetStatus[value];
            }
            getEventTypes() {
                this.eventTypeService.getEventTypes()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypeList = response.data;
                    }
                });
            }
            getCompetitions() {
                this.$scope.search.competition = null;
                this.competitionService.searchCompetitions(this.$scope.search.eventType.id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.competitionList = response.data;
                        this.$scope.search.event = null;
                        this.$scope.search.market = null;
                    }
                });
            }
            getEvents() {
                this.$scope.search.event = null;
                this.eventService.searchEvent(this.$scope.search.competition.id)
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
                        this.$scope.marketList = response.data.filter((m) => { return m.sourceId; });
                    }
                });
            }
            getBTBets() {
                if (this.$scope.timer) {
                    this.$timeout.cancel(this.$scope.timer);
                }
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
                    .success((response) => {
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
            intervalChanged() {
                if (this.$scope.selectedInterval != 0) {
                    this.getBTBets();
                }
                else {
                    this.$timeout.cancel(this.$scope.timer);
                }
            }
            resetCriteria() {
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
        admin.BetfairLiveBetsCtrl = BetfairLiveBetsCtrl;
        angular.module('intranet.admin').controller('betfairLiveBetsCtrl', BetfairLiveBetsCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetfairLiveBetsCtrl.js.map