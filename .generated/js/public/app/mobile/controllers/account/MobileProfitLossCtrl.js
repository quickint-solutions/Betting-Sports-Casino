var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        var account;
        (function (account) {
            class MobileProfitLossCtrl extends intranet.common.ControllerBase {
                constructor($scope, betHistoryService, $filter, exportService, commonDataService, settings) {
                    super($scope);
                    this.betHistoryService = betHistoryService;
                    this.$filter = $filter;
                    this.exportService = exportService;
                    this.commonDataService = commonDataService;
                    this.settings = settings;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.search = {
                        fromdate: new Date(moment().add(-6, 'd').format("DD MMM YYYY HH:mm")),
                        todate: new Date(moment().format("DD MMM YYYY HH:mm"))
                    };
                    this.$scope.liveGamesId = this.settings.LiveGamesId;
                    this.$scope.totalItems = 0;
                    this.$scope.gridDataWithoutGroup = [];
                    this.$scope.eventSummary = [];
                }
                loadInitialData() {
                    this.getProfitLoss();
                }
                setDates(num, sh) {
                    this.$scope.search.fromdate = new Date(moment().add(num, sh).format("DD MMM YYYY HH:mm"));
                    this.$scope.search.todate = new Date(moment().format("DD MMM YYYY HH:mm"));
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
                getBet(item, show = true) {
                    item.show = !item.show;
                    if (show) {
                        item.inprogress = true;
                        this.betHistoryService.getplBetbyMarketIdUserId(item.marketId)
                            .success((response) => {
                            if (response.success) {
                                item.betDetailItems = response.data;
                            }
                        }).finally(() => {
                            item.inprogress = false;
                        });
                    }
                }
                getProfitLoss() {
                    var searchQuery = {
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    };
                    this.$scope.dateDiff = moment(searchQuery.toDate).diff(searchQuery.fromDate, 'days');
                    this.betHistoryService.getProfitLoss(searchQuery)
                        .success((response) => {
                        if (response && response.data) {
                            if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'sports') {
                                var data = [];
                                angular.forEach(response.data, (d) => {
                                    angular.forEach(d.data, (dp) => {
                                        dp.eventTypeId = d.eventTypeId;
                                    });
                                    data.push(d);
                                });
                                this.$scope.plData = data;
                                this.$scope.eventSummary = data.map((a) => { return { eventTypeId: a.eventTypeId, eventTypeName: a.eventTypeName, totalPl: a.totalPl }; });
                                if (this.$scope.eventSummary.length > 0) {
                                    this.$scope.selectedEventType = this.$scope.eventSummary[0].eventTypeId;
                                    this.changeMarketData();
                                }
                            }
                            else {
                                var data = [];
                                angular.forEach(response.data, (d) => {
                                    angular.forEach(d.data, (dp) => {
                                        dp.eventTypeId = d.eventTypeId;
                                        data.push(dp);
                                    });
                                });
                                data = this.$filter('orderBy')(data, 'settleTime', true);
                                this.$scope.totalItems = data.length;
                                this.$scope.gridData = intranet.common.helpers.CommonHelper.groupByDate(data, 'settleTime');
                                this.$scope.gridDataWithoutGroup = data;
                            }
                        }
                        else {
                            this.$scope.totalItems = 0;
                            this.$scope.gridData = [];
                            this.$scope.gridDataWithoutGroup = [];
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
                        this.$scope.totalItems = this.$scope.gridData.length;
                    }
                }
                exportProfitLoss(params, exportType) {
                    var searchQuery = {
                        fromDate: intranet.common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                        toDate: intranet.common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                    };
                    return this.exportService.profitLoss({ exportType: exportType, searchQuery: searchQuery, params: params });
                }
                formatWinner(winner, gametype) {
                    return this.commonDataService.formatLiveGameResult(winner, gametype);
                }
            }
            account.MobileProfitLossCtrl = MobileProfitLossCtrl;
            angular.module('intranet.mobile.account').controller('mobileProfitLossCtrl', MobileProfitLossCtrl);
        })(account = mobile.account || (mobile.account = {}));
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileProfitLossCtrl.js.map