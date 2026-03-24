namespace intranet.common.directives {

    export interface IKTInlineRadarScope extends common.IScopeBase {
        currencyCode: string;
        currencyFraction: string;
        convertValue: boolean;
        market: any;
        showFullOption: boolean;

        openBetsForMarket: any[];
    }

    class KTInlineRadarController extends ControllerBase<IKTInlineRadarScope>
        implements intranet.common.init.IInit {
        constructor($scope: IKTInlineRadarScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private promiseTracker: any,
            private toasterService: common.services.ToasterService,
            private commonDataService: services.CommonDataService,
            protected $rootScope: any,
            private betService: intranet.services.BetService,
            private $filter: any,
            private settings: common.IBaseSettings) {
            super($scope);

            var listenEvent = this.$rootScope.$on('openbets-updated', () => {
                this.getOpenBetsByMarketId();
            });

            this.$scope.currencyFraction = settings.CurrencyFraction;
            this.$scope.$on('$destroy', () => {
                listenEvent();
            });

            super.init(this);
        }
        public initScopeValues() {
            this.$scope.openBetsForMarket = [];
            this.$scope.showFullOption = false;
            this.$scope.market.prepareRadarView = (() => { this.prepareRadarView(); });
        }

        public loadInitialData() {
            this.startView();
        }

        private startView() {
            var rconfig;
            var result = this.localStorageHelper.get(this.settings.StakeConfig);
            if (result) { rconfig = result.stake.filter((a: any) => { return a.isActive; }); }
            this.$scope.market.marketRunner.forEach((r: any) => {
                r.radar_processor = this.promiseTracker({ activationDelay: 100, minDuration: 750 });
                r.stakeConfig = { stakeList: [] = [] };
                angular.copy(rconfig, r.stakeConfig.stakeList);
                if (r.stakeConfig.stakeList.length > 0) {
                    r.selectedStake = r.stakeConfig.stakeList[2].stake;
                }
            });
            this.getOpenBetsByMarketId();
        }

        private getOpenBetsByMarketId() {
            this.betService.getOpenBetsByMarketId(this.$scope.market.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.openBetsForMarket = response.data;
                        this.prepareRadarView();
                    }
                });
        }

        private prepareRadarView() {
            var marketbets: any[] = [];
            angular.copy(this.$scope.openBetsForMarket, marketbets);
            this.$scope.market.marketRunner.forEach((r: any) => {
                if (!r.radarData) { r.radarData = []; }
                var tempRadarData = [];
                if (r.backPrice && r.layPrice) {
                    r.backPrice.forEach((b: any) => {
                        tempRadarData.push({ odds: b.price, backSize: b.size, backMatched: 0, backUnmatched: 0, layMatched: 0, layUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                    });
                    r.layPrice.forEach((l: any) => {
                        tempRadarData.push({ odds: l.price, laySize: l.size, backMatched: 0, backUnmatched: 0, layMatched: 0, layUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                    });

                    if (marketbets.length > 0) {
                        var runnerBets: any[] = marketbets.filter((mb: any) => { return mb.runnerId == r.runner.id });
                        if (runnerBets.length > 0) {
                            runnerBets.forEach((rb: any) => {
                                if (rb.sizeMatched > 0 && rb.avgPrice > 0) {
                                    var oddindex = tempRadarData.map((t: any) => { return t.odds }).indexOf(rb.avgPrice);
                                    if (rb.side == 1) {
                                        if (oddindex > -1) {
                                            tempRadarData[oddindex].backMatched = math.add(tempRadarData[oddindex].backMatched, rb.sizeMatched);
                                        } else {
                                            tempRadarData.push({ odds: rb.avgPrice, backMatched: rb.sizeMatched, backUnmatched: 0, layMatched: 0, layUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                                        }
                                    } else {
                                        if (oddindex > -1) {
                                            tempRadarData[oddindex].layMatched = math.add(tempRadarData[oddindex].layMatched, rb.sizeMatched);
                                        } else {
                                            tempRadarData.push({ odds: rb.avgPrice, layMatched: rb.sizeMatched, layUnmatched: 0, backMatched: 0, backUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                                        }
                                    }
                                }
                                if (rb.sizeRemaining > 0 && rb.price > 0) {
                                    var oddindex = tempRadarData.map((t: any) => { return t.odds }).indexOf(rb.price);
                                    if (rb.side == 1) {
                                        if (oddindex > -1) {
                                            tempRadarData[oddindex].backUnmatched = math.add(tempRadarData[oddindex].backUnmatched, rb.sizeRemaining);
                                            tempRadarData[oddindex].backBetIds = rb.ids;
                                        } else {
                                            tempRadarData.push({ odds: rb.price, backMatched: 0, backUnmatched: rb.sizeRemaining, layMatched: 0, layUnmatched: 0, backBetIds: [] = rb.ids, layBetIds: [] = [] });
                                        }
                                    } else {
                                        if (oddindex > -1) {
                                            tempRadarData[oddindex].layUnmatched = math.add(tempRadarData[oddindex].layUnmatched, rb.sizeRemaining);
                                            tempRadarData[oddindex].layBetIds = rb.ids;
                                        } else {
                                            tempRadarData.push({ odds: rb.price, layMatched: 0, layUnmatched: rb.sizeRemaining, backMatched: 0, backUnmatched: 0, backBetIds: [] = [], layBetIds: [] = rb.ids });
                                        }
                                    }
                                }
                            });
                        }
                    }

                    if (tempRadarData.length > 0) {
                        tempRadarData = tempRadarData.sort((a, b) => { return a.odds < b.odds ? -1 : 1 });
                        var min = tempRadarData[0].odds;
                        var max = tempRadarData[tempRadarData.length - 1].odds;

                        var oddsRange = common.helpers.CommonHelper.getOddsRangeByLadder(min, max, this.$scope.market.interval, this.$scope.market.priceLadderType);
                        oddsRange.forEach((o: any, index: any) => {
                            if (tempRadarData.map((t: any) => { return t.odds }).indexOf(o) <= -1) {
                                tempRadarData.splice(index, 0, { odds: o, backSize: 0, backMatched: 0, backUnmatched: 0, layMatched: 0, layUnmatched: 0 });
                            }
                        });
                        // sort decending
                        tempRadarData = tempRadarData.sort((a, b) => { return a.odds > b.odds ? -1 : 1 });
                        if (r.radarData.length > 0) {
                            tempRadarData.forEach((tm: any) => {
                                var found = false;
                                var oddindex = r.radarData.map((rd: any) => { return rd.odds }).indexOf(tm.odds);

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
                                    })
                                }
                            });

                            // sort decending
                            r.radarData = r.radarData.sort((a, b) => { return a.odds > b.odds ? -1 : 1 });
                            //// remove old odds
                            var toRemove: any[] = [];
                            r.radarData.forEach((rd: any) => {
                                var findex = common.helpers.Utility.IndexOfObject(tempRadarData, 'odds', rd.odds);
                                //if (findex == -1) { toRemove.push(rd.odds); }
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

        private placeBMBet(side: any, r: any, price: any, percentage: any = 100) {
            var betmodel = new common.helpers.BetModal(this.$scope.market, side, r.runner.id, price, r.runner.name, false, '', percentage);
            var model: any = betmodel.model;
            if (r.selectedStake == undefined || r.selectedStake <= 0) {
                this.toasterService.showToastMessage(common.helpers.ToastType.Error, "Please select stake", 1000);
            } else {
                model.size = r.selectedStake;
                model.betFrom = common.enums.BetFrom.Radar;
                var promise = this.betService.placeBet(model);
                r.radar_processor.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data) {
                            var r = response.data;
                            if (r.orderStatus) {
                                // success
                                if (r.sizeRemaining > 0) {
                                    var matched = this.$filter('toRate')(r.sizeMatched);
                                    var remaining = this.$filter('toRate')(r.sizeRemaining);
                                    var unMatchmsg = "Bet Unmatched. {0} - {1} - {2} at odds {3}";
                                    unMatchmsg = unMatchmsg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), model.runnerName, remaining, r.bet.price);
                                    //msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), runnername[0].runnerName, matched, r.avgPrice, remaining, r.bet.price);
                                    this.toasterService.showToastMessage(common.helpers.ToastType.Success, unMatchmsg, 5000);
                                }
                                else {
                                    var matched = this.$filter('toRate')(r.sizeMatched);
                                    var placed = this.$filter('toRate')(r.bet.size);
                                    var msg: any = this.$filter('translate')('bet.matched.message');
                                    msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), model.runnerName, placed, r.bet.price, matched, r.avgPrice);
                                    this.toasterService.showToastMessage(common.helpers.ToastType.Success, msg, 5000);
                                }
                            }
                            else {
                                var msg = r.message.format(model.marketName, model.runnerName);
                                this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg, 1500);
                            }
                        }
                    } else {
                        if (response.messages) {
                            this.toasterService.showMessages(response.messages, 3000);
                        }
                    }
                }).finally(() => {
                    // this.$rootScope.$emit('bet-submitted', { marketId: this.$scope.radarMarket.id });
                });
            }
        }

        private cancelBet(r: any, betids: any[]): void {
            if (betids.length > 0) {
                var promise = this.betService.cancelAllBets(betids);
                r.radar_processor.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    // if (response.success) { this.getOpenBets(); }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 1500);
                    }
                });
            }
        }

        private cancelAllBets(r: any): void {
            var ids: any[] = [];
            var bets = (this.$scope.openBetsForMarket.filter((ob: any) => { return ob.runnerId == r.runner.id }) || []);
            bets.forEach((b: any) => {
                if (b.ids && b.ids.length > 0) {
                    b.ids.forEach((id: any) => { ids.push(id); });
                }
            });
            if (ids.length > 0) {
                var promise = this.betService.cancelAllBets(ids);
                r.radar_processor.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.getOpenBetsByMarketId(); }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 1500);
                    }
                });
            }
        }

        public openRadaraView(): void {
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
}