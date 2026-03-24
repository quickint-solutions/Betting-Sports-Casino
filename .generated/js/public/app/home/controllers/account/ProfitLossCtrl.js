var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class ProfitLossCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, betHistoryService, exportService, commonDataService, $q, $stateParams, settings) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.betHistoryService = betHistoryService;
                this.exportService = exportService;
                this.commonDataService = commonDataService;
                this.$q = $q;
                this.$stateParams = $stateParams;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
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
            loadInitialData() {
                this.getProfitLoss();
            }
            viewCards(event, item) {
                if (event) {
                    event.stopPropagation();
                }
                this.betHistoryService.getMarketById(item.marketId)
                    .success((response) => {
                    this.commonDataService.viewCards(response.data);
                });
            }
            setDates(num, sh) {
                this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
                this.getProfitLoss();
            }
            getBet(item, show = true) {
                item.show = !item.show;
                this.$scope.marketname = item.eventName + ' - ' + item.marketName;
                this.$scope.goBackLabel = item.eventTypeName;
                if (show) {
                    var promise;
                    if (this.$stateParams.memberid) {
                        promise = this.betHistoryService.getplBetbyMarketIdUserId(item.marketId, this.$stateParams.memberid);
                    }
                    else {
                        promise = this.betHistoryService.getplBetbyMarketIdUserId(item.marketId);
                    }
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.betDetailItems = response.data;
                            item.betDetailItems = response.data;
                        }
                    }).finally(() => { this.$scope.showBetDetail = true; });
                }
            }
            getProfitLoss() {
                var searchQuery = {
                    fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                    toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                };
                var promise;
                if (this.$stateParams.memberid) {
                    searchQuery.userId = this.$stateParams.memberid;
                }
                promise = this.betHistoryService.getProfitLoss(searchQuery);
                promise.success((response) => {
                    if (response && response.data) {
                        this.$scope.plData = response.data;
                        this.$scope.eventSummary = response.data.map((a) => { return { eventTypeId: a.eventTypeId, eventTypeName: a.eventTypeName, totalPl: a.totalPl }; });
                        if (this.$scope.eventSummary.length > 0) {
                            this.$scope.selectedEventType = this.$scope.eventSummary[0].eventTypeId;
                            this.changeMarketData();
                        }
                    }
                });
            }
            changeMarketData(id = '-1') {
                if (id != '-1') {
                    this.$scope.selectedEventType = id;
                }
                var eventData = this.$scope.plData.filter((a) => { return a.eventTypeId == this.$scope.selectedEventType; }) || [];
                if (eventData.length > 0) {
                    var d = eventData[0].data;
                    this.$scope.gridData = intranet.common.helpers.CommonHelper.groupByDate(d, 'settleTime');
                    this.$scope.gridDataWithoutGroup = eventData[0].data;
                }
            }
            goback() {
                this.$scope.showBetDetail = false;
            }
            formatWinner(winner, gametype) {
                return this.commonDataService.formatLiveGameResult(winner, gametype);
            }
        }
        home.ProfitLossCtrl = ProfitLossCtrl;
        angular.module('intranet.home').controller('profitLossCtrl', ProfitLossCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ProfitLossCtrl.js.map