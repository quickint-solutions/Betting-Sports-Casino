var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTInlineRadarController extends common.ControllerBase {
                constructor($scope, localStorageHelper, promiseTracker, toasterService, commonDataService, $rootScope, betService, $filter, settings) {
                    super($scope);
                    this.localStorageHelper = localStorageHelper;
                    this.promiseTracker = promiseTracker;
                    this.toasterService = toasterService;
                    this.commonDataService = commonDataService;
                    this.$rootScope = $rootScope;
                    this.betService = betService;
                    this.$filter = $filter;
                    this.settings = settings;
                    var listenEvent = this.$rootScope.$on('openbets-updated', () => {
                        this.getOpenBetsByMarketId();
                    });
                    this.$scope.currencyFraction = settings.CurrencyFraction;
                    this.$scope.$on('$destroy', () => {
                        listenEvent();
                    });
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.openBetsForMarket = [];
                    this.$scope.showFullOption = false;
                    this.$scope.market.prepareRadarView = (() => { this.prepareRadarView(); });
                }
                loadInitialData() {
                    this.startView();
                }
                startView() {
                    var rconfig;
                    var result = this.localStorageHelper.get(this.settings.StakeConfig);
                    if (result) {
                        rconfig = result.stake.filter((a) => { return a.isActive; });
                    }
                    this.$scope.market.marketRunner.forEach((r) => {
                        r.radar_processor = this.promiseTracker({ activationDelay: 100, minDuration: 750 });
                        r.stakeConfig = { stakeList: [] = [] };
                        angular.copy(rconfig, r.stakeConfig.stakeList);
                        if (r.stakeConfig.stakeList.length > 0) {
                            r.selectedStake = r.stakeConfig.stakeList[2].stake;
                        }
                    });
                    this.getOpenBetsByMarketId();
                }
                getOpenBetsByMarketId() {
                    this.betService.getOpenBetsByMarketId(this.$scope.market.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.openBetsForMarket = response.data;
                            this.prepareRadarView();
                        }
                    });
                }
                prepareRadarView() {
                    var marketbets = [];
                    angular.copy(this.$scope.openBetsForMarket, marketbets);
                    this.$scope.market.marketRunner.forEach((r) => {
                        if (!r.radarData) {
                            r.radarData = [];
                        }
                        var tempRadarData = [];
                        if (r.backPrice && r.layPrice) {
                            r.backPrice.forEach((b) => {
                                tempRadarData.push({ odds: b.price, backSize: b.size, backMatched: 0, backUnmatched: 0, layMatched: 0, layUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                            });
                            r.layPrice.forEach((l) => {
                                tempRadarData.push({ odds: l.price, laySize: l.size, backMatched: 0, backUnmatched: 0, layMatched: 0, layUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                            });
                            if (marketbets.length > 0) {
                                var runnerBets = marketbets.filter((mb) => { return mb.runnerId == r.runner.id; });
                                if (runnerBets.length > 0) {
                                    runnerBets.forEach((rb) => {
                                        if (rb.sizeMatched > 0 && rb.avgPrice > 0) {
                                            var oddindex = tempRadarData.map((t) => { return t.odds; }).indexOf(rb.avgPrice);
                                            if (rb.side == 1) {
                                                if (oddindex > -1) {
                                                    tempRadarData[oddindex].backMatched = math.add(tempRadarData[oddindex].backMatched, rb.sizeMatched);
                                                }
                                                else {
                                                    tempRadarData.push({ odds: rb.avgPrice, backMatched: rb.sizeMatched, backUnmatched: 0, layMatched: 0, layUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                                                }
                                            }
                                            else {
                                                if (oddindex > -1) {
                                                    tempRadarData[oddindex].layMatched = math.add(tempRadarData[oddindex].layMatched, rb.sizeMatched);
                                                }
                                                else {
                                                    tempRadarData.push({ odds: rb.avgPrice, layMatched: rb.sizeMatched, layUnmatched: 0, backMatched: 0, backUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                                                }
                                            }
                                        }
                                        if (rb.sizeRemaining > 0 && rb.price > 0) {
                                            var oddindex = tempRadarData.map((t) => { return t.odds; }).indexOf(rb.price);
                                            if (rb.side == 1) {
                                                if (oddindex > -1) {
                                                    tempRadarData[oddindex].backUnmatched = math.add(tempRadarData[oddindex].backUnmatched, rb.sizeRemaining);
                                                    tempRadarData[oddindex].backBetIds = rb.ids;
                                                }
                                                else {
                                                    tempRadarData.push({ odds: rb.price, backMatched: 0, backUnmatched: rb.sizeRemaining, layMatched: 0, layUnmatched: 0, backBetIds: [] = rb.ids, layBetIds: [] = [] });
                                                }
                                            }
                                            else {
                                                if (oddindex > -1) {
                                                    tempRadarData[oddindex].layUnmatched = math.add(tempRadarData[oddindex].layUnmatched, rb.sizeRemaining);
                                                    tempRadarData[oddindex].layBetIds = rb.ids;
                                                }
                                                else {
                                                    tempRadarData.push({ odds: rb.price, layMatched: 0, layUnmatched: rb.sizeRemaining, backMatched: 0, backUnmatched: 0, backBetIds: [] = [], layBetIds: [] = rb.ids });
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                            if (tempRadarData.length > 0) {
                                tempRadarData = tempRadarData.sort((a, b) => { return a.odds < b.odds ? -1 : 1; });
                                var min = tempRadarData[0].odds;
                                var max = tempRadarData[tempRadarData.length - 1].odds;
                                var oddsRange = common.helpers.CommonHelper.getOddsRangeByLadder(min, max, this.$scope.market.interval, this.$scope.market.priceLadderType);
                                oddsRange.forEach((o, index) => {
                                    if (tempRadarData.map((t) => { return t.odds; }).indexOf(o) <= -1) {
                                        tempRadarData.splice(index, 0, { odds: o, backSize: 0, backMatched: 0, backUnmatched: 0, layMatched: 0, layUnmatched: 0 });
                                    }
                                });
                                tempRadarData = tempRadarData.sort((a, b) => { return a.odds > b.odds ? -1 : 1; });
                                if (r.radarData.length > 0) {
                                    tempRadarData.forEach((tm) => {
                                        var found = false;
                                        var oddindex = r.radarData.map((rd) => { return rd.odds; }).indexOf(tm.odds);
                                        if (tm.odds > 0 || tm.layMatched > 0 || tm.layUnmatched > 0 || tm.backMatched > 0 || tm.backUnmatched > 0
                                            || tm.backSize > 0 || tm.laySize > 0) {
                                            if (oddindex > -1) {
                                                found = true;
                                                r.radarData[oddindex].layMatched = tm.layMatched;
                                                r.radarData[oddindex].layUnmatched = tm.layUnmatched;
                                                r.radarData[oddindex].backMatched = tm.backMatched;
                                                r.radarData[oddindex].backUnmatched = tm.backUnmatched;
                                                r.radarData[oddindex].backBetIds = tm.backBetIds;
                                                r.radarData[oddindex].layBetIds = tm.layBetIds;
                                                r.radarData[oddindex].backSize = tm.backSize;
                                                r.radarData[oddindex].laySize = tm.laySize;
                                            }
                                        }
                                        if (!found) {
                                            r.radarData.push({
                                                odds: tm.odds,
                                                layMatched: tm.layMatched,
                                                layUnmatched: tm.layUnmatched,
                                                backMatched: tm.backMatched,
                                                backUnmatched: tm.backUnmatched,
                                                backBetIds: tm.backBetIds,
                                                layBetIds: tm.layBetIds,
                                                backSize: tm.backSize,
                                                laySize: tm.laySize
                                            });
                                        }
                                    });
                                    r.radarData = r.radarData.sort((a, b) => { return a.odds > b.odds ? -1 : 1; });
                                    var toRemove = [];
                                    r.radarData.forEach((rd) => {
                                        var findex = common.helpers.Utility.IndexOfObject(tempRadarData, 'odds', rd.odds);
                                        if (findex == -1) {
                                            rd.backSize = 0;
                                            rd.laySize = 0;
                                            rd.layUnmatched = 0;
                                            rd.backUnmatched = 0;
                                        }
                                    });
                                }
                                else {
                                    angular.copy(tempRadarData, r.radarData);
                                }
                            }
                        }
                    });
                }
                placeBMBet(side, r, price, percentage = 100) {
                    var betmodel = new common.helpers.BetModal(this.$scope.market, side, r.runner.id, price, r.runner.name, false, '', percentage);
                    var model = betmodel.model;
                    if (r.selectedStake == undefined || r.selectedStake <= 0) {
                        this.toasterService.showToastMessage(common.helpers.ToastType.Error, "Please select stake", 1000);
                    }
                    else {
                        model.size = r.selectedStake;
                        model.betFrom = common.enums.BetFrom.Radar;
                        var promise = this.betService.placeBet(model);
                        r.radar_processor.addPromise(promise);
                        promise.success((response) => {
                            if (response.success) {
                                if (response.data) {
                                    var r = response.data;
                                    if (r.orderStatus) {
                                        if (r.sizeRemaining > 0) {
                                            var matched = this.$filter('toRate')(r.sizeMatched);
                                            var remaining = this.$filter('toRate')(r.sizeRemaining);
                                            var unMatchmsg = "Bet Unmatched. {0} - {1} - {2} at odds {3}";
                                            unMatchmsg = unMatchmsg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), model.runnerName, remaining, r.bet.price);
                                            this.toasterService.showToastMessage(common.helpers.ToastType.Success, unMatchmsg, 5000);
                                        }
                                        else {
                                            var matched = this.$filter('toRate')(r.sizeMatched);
                                            var placed = this.$filter('toRate')(r.bet.size);
                                            var msg = this.$filter('translate')('bet.matched.message');
                                            msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), model.runnerName, placed, r.bet.price, matched, r.avgPrice);
                                            this.toasterService.showToastMessage(common.helpers.ToastType.Success, msg, 5000);
                                        }
                                    }
                                    else {
                                        var msg = r.message.format(model.marketName, model.runnerName);
                                        this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg, 1500);
                                    }
                                }
                            }
                            else {
                                if (response.messages) {
                                    this.toasterService.showMessages(response.messages, 3000);
                                }
                            }
                        }).finally(() => {
                        });
                    }
                }
                cancelBet(r, betids) {
                    if (betids.length > 0) {
                        var promise = this.betService.cancelAllBets(betids);
                        r.radar_processor.addPromise(promise);
                        promise.success((response) => {
                            if (response.messages) {
                                this.toasterService.showMessages(response.messages, 1500);
                            }
                        });
                    }
                }
                cancelAllBets(r) {
                    var ids = [];
                    var bets = (this.$scope.openBetsForMarket.filter((ob) => { return ob.runnerId == r.runner.id; }) || []);
                    bets.forEach((b) => {
                        if (b.ids && b.ids.length > 0) {
                            b.ids.forEach((id) => { ids.push(id); });
                        }
                    });
                    if (ids.length > 0) {
                        var promise = this.betService.cancelAllBets(ids);
                        r.radar_processor.addPromise(promise);
                        promise.success((response) => {
                            if (response.success) {
                                this.getOpenBetsByMarketId();
                            }
                            if (response.messages) {
                                this.toasterService.showMessages(response.messages, 1500);
                            }
                        });
                    }
                }
                openRadaraView() {
                    this.commonDataService.openRadarView(this.$scope.market.id);
                }
            }
            angular.module('kt.components')
                .controller('KTInlineRadarController', KTInlineRadarController);
            angular.module('kt.components')
                .directive('ktInlineRadar', () => {
                return {
                    restrict: 'EA',
                    replace: true,
                    scope: {
                        market: '=',
                        showFullOption: '@?'
                    },
                    templateUrl: 'app/common/components/inline-radar/inline-radar.html',
                    controller: 'KTInlineRadarController'
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=inline-radar-controller.js.map