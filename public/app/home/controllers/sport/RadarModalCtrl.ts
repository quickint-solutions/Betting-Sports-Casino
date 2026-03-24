module intranet.home {

    export interface IRadarModalScope extends intranet.common.IBetScopeBase {
        fullMarket: any;
        openBets: any;
        stakeConfig: any;

        lastBet: any;
        radar_processor: any;
    }

    export class RadarModalCtrl extends intranet.common.BetControllerBase<IRadarModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IRadarModalScope,
            private $stateParams: any,
            private marketOddsService: services.MarketOddsService,
            public $timeout: ng.ITimeoutService,
            public toasterService: intranet.common.services.ToasterService,
            public $rootScope: any,
            private $state: any,
            public $compile: any,
            private $filter: any,
            public WSSocketService: any,
            private promiseTracker: any,
            private marketService: services.MarketService,
            private commentaryService: services.CommentaryService,
            public placeBetDataService: common.services.PlaceBetDataService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public commonDataService: common.services.CommonDataService,
            private localCacheHelper: common.helpers.LocalCacheHelper,
            private exposureService: services.ExposureService,
            public settings: common.IBaseSettings,
            public betService: services.BetService) {
            super($scope);

            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    this.$rootScope.$emit("balance-changed");
                    this.getOpenBets();
                }
            });
            var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                if (response.success) {
                    this.setMarketOdds(response.data);
                }
            });
            this.$scope.$on('$destroy', () => {
                wsListner();
                wsListnerMarketOdds();
            });

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.openBets = [];
        }

        public loadInitialData() {
            var result = this.localStorageHelper.get(this.settings.StakeConfig);
            if (result) { this.$scope.stakeConfig = result.stake.filter((a: any) => { return a.isActive; }); }
            this.getFullmarket();
        }

        // market calls
        public getFullmarket(): void {
            this.marketOddsService.getFullMarketById(this.$stateParams.marketid)
                .success((response: common.messaging.IResponse<any>) => {
                    this.$scope.fullMarket = response.data;
                    if (this.$scope.fullMarket) {
                        if (this.$scope.fullMarket.bettingType == common.enums.BettingType.ODDS) {
                            this.checkAccess();
                        }
                    }
                }).finally(() => { this.subscribeOdds(); this.getOpenBets(); });
        }

        private checkAccess(): void {
            this.$scope.fullMarket.marketRunner.forEach((r: any) => {
                r.radar_processor = this.promiseTracker({ activationDelay: 100, minDuration: 750 });
                var rconfig = this.$scope.stakeConfig;
                r.stakeConfig = { stakeList: [] = [] };
                angular.copy(rconfig, r.stakeConfig.stakeList);
                if (r.stakeConfig.stakeList.length > 0) {
                    r.stakeConfig.selectedStake = r.stakeConfig.stakeList[2].stake;
                    r.stakeConfig.stakeList[2].selected = true;
                }
            });
        }


        public subscribeOdds(): void {
            var mids: any[] = [];
            if (this.$scope.fullMarket.id) {
                mids.push(this.$scope.fullMarket.id);
            }
            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });
        }

        private setMarketOdds(responseData: any[]): void {
            responseData.forEach((data: any) => {
                if (this.$scope.fullMarket && this.$scope.fullMarket.id == data.id) {
                    this.setOddsInMarket(this.$scope.fullMarket, data);
                    this.prepareView();
                }
            });
        }

        // bets calls
        private getOpenBets(): void {
            this.betService.getOpenBetsByMarketId(this.$scope.fullMarket.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.openBets = response.data;
                        this.prepareView();
                    }
                }).finally(() => { this.getExposure(); });
        }

        private getExposure(): void {
            this.exposureService.getExposure()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
        }
        private cancelBet(r: any, betids: any[]): void {
            if (betids.length > 0) {
                var promise = this.betService.cancelAllBets(betids);
                r.radar_processor.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.getOpenBets(); }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 1500);
                    }
                });
            }
        }

        private cancelAllBets(r: any): void {
            var ids: any[] = [];
            var bets = (this.$scope.openBets.filter((ob: any) => { return ob.runnerId == r.runner.id }) || []);
            bets.forEach((b: any) => {
                if (b.ids && b.ids.length > 0) {
                    b.ids.forEach((id: any) => { ids.push(id); });
                }
            });
            if (ids.length > 0) {
                var promise = this.betService.cancelAllBets(ids);
                r.radar_processor.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.getOpenBets(); }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 1500);
                    }
                });
            }
        }

        // prepare view for radar
        private prepareView(): void {
            var marketbets: any[] = [];
            angular.copy(this.$scope.openBets, marketbets);

            this.$scope.fullMarket.marketRunner.forEach((r: any) => {
                if (!r.radarData) { r.radarData = []; }
                var tempRadarData = [];
                if (r.backPrice) {
                    r.backPrice.forEach((b: any) => {
                        tempRadarData.push({ odds: b.price, backSize: b.size, backMatched: 0, backUnmatched: 0, layMatched: 0, layUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                    });
                }
                if (r.layPrice) {
                    r.layPrice.forEach((l: any) => {
                        tempRadarData.push({ odds: l.price, laySize: l.size, backMatched: 0, backUnmatched: 0, layMatched: 0, layUnmatched: 0, backBetIds: [] = [], layBetIds: [] = [] });
                    });
                }

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
                    var oddsRange = common.helpers.CommonHelper.getOddsRangeByLadder(min, max, this.$scope.fullMarket.interval, this.$scope.fullMarket.priceLadderType);
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
                        //toRemove.forEach((o: any) => {
                        //    var findex = common.helpers.Utility.IndexOfObject(r.radarData, 'odds', o);
                        //    if (findex > -1) { r.radarData.splice(findex, 1); }
                        //});

                    } else {
                        angular.copy(tempRadarData, r.radarData);
                    }


                }
            });
        }

        public placeBet(side: any, r: any, price: any, percentage: any = 100): void {
            var betmodel = new common.helpers.BetModal(this.$scope.fullMarket, side, r.runner.id, price, r.runner.name, false, '', percentage);
            var model: any = betmodel.model;
            if (r.stakeConfig.selectedStake == undefined || r.stakeConfig.selectedStake <= 0) {
                this.toasterService.showToastMessage(common.helpers.ToastType.Error, "Please select stake", 1000);
            }
            else {
                model.size = r.stakeConfig.selectedStake;
                model.betFrom = common.enums.BetFrom.Radar;
                var promise = this.betService.placeBet(model);
                r.radar_processor.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data) {
                            var bet = response.data;
                            if (bet.orderStatus) {
                                this.$scope.lastBet = bet;
                                console.log(this.$scope.lastBet);
                                if (bet.sizeRemaining > 0) {
                                    var matched = this.$filter('toRate')(bet.sizeMatched);
                                    var remaining = this.$filter('toRate')(bet.sizeRemaining);
                                    var unMatchmsg = this.$filter('translate')('bet.unmatched.message');
                                    unMatchmsg = unMatchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), r.runner.name, matched, bet.avgPrice, remaining, model.price);
                                    this.toasterService.showToastMessage(common.helpers.ToastType.Error, unMatchmsg, 1500);
                                } else {
                                    var matched = this.$filter('toRate')(bet.sizeMatched);
                                    var placed = this.$filter('toRate')(model.size);
                                    var Matchmsg = this.$filter('translate')('bet.matched.message');
                                    Matchmsg = Matchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), r.runner.name, placed, model.price, matched, bet.avgPrice);
                                    this.toasterService.showToastMessage(common.helpers.ToastType.Success, Matchmsg, 1500);
                                }
                            } else {
                                var msg = bet.message.format(model.marketName, model.runnerName);
                                this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg, 1500);
                            }
                        }
                    }
                    else {
                        if (response.messages) {
                            this.toasterService.showMessages(response.messages, 1500);
                        }
                    }
                });
            }

        }

        // stake management
        private selectOneClickStake(runner: any, stake: any): void {
            runner.stakeConfig.selectedStake = stake.stake;
            runner.stakeConfig.stakeList.forEach((s: any) => {
                if (s.id == stake.id) { s.selected = true; }
                else { s.selected = false; }
            });
        }

        private oneClickStakeChanged(runner: any): void {
            var selectedstake = runner.stakeConfig.stakeList.filter((s: any) => { return s.selected == true; });
            if (selectedstake.length > 0) { runner.stakeConfig.selectedStake = selectedstake[0].stake; }
            angular.forEach(this.$scope.fullMarket.marketRunner, (m: any) => {
                m.stakeConfig.stakeList = runner.stakeConfig.stakeList;
                if (selectedstake.length > 0) { m.stakeConfig.selectedStake = selectedstake[0].stake; }
            });
        }


        private increment(value): any {
            var odds: any = parseFloat(value);
            var interval: any = 0, frm: any = 0, to: any = 0;
            var modulo: any = 0;


            var range = common.helpers.Utility.GetPriceLadderUPRange(odds);
            if (range) {
                frm = range.min;
                to = range.max;
                interval = range.interval;
            }

            if (interval > 0) {
                odds = math.round(odds * 100, 0);
                interval = math.round(interval * 100, 0);
                modulo = math.mod(odds, interval);
                if (modulo > 0) {
                    interval = math.subtract(interval, modulo);
                }
            }
            return { interval: interval, odds: odds, modulo: modulo };
        }

        private onRunnerPriceChange(runner: any): void {
            var betmodel = null;
            if (runner.priceValue) {
                var price = runner.priceValue;

                var onlyBack = (price.match(new RegExp("[*]", "g")) || []).length > 0;
                var onlyLay = (price.match(new RegExp("[-]", "g")) || []).length > 0;
                price = price.replace('*', '').replace('-', '');


                if (onlyBack || onlyLay) {
                    price = math.add(math.divide(price, 100), 1);
                    var backmodel = this.increment(price);
                    if (backmodel.modulo > 0) {
                        var addition: any = math.round(math.divide(math.add(backmodel.odds, backmodel.interval), 100), 2);
                        if (1000 >= addition) {
                            price = common.helpers.Utility.isInt(addition) ? parseInt(addition) : addition;
                        }
                    }

                    if (onlyBack) { betmodel = { backPrice: price }; }
                    if (onlyLay) { betmodel = { layPrice: price }; }
                }
                else {

                    var hasPLUS = (price.match(new RegExp("[+]", "g")) || []).length > 0;
                    var multiplBy = 100;

                    if (hasPLUS) {
                        var arr = price.split('+');
                        var length = 0;
                        if (hasPLUS) { length = (price.match(new RegExp("[+]", "g")) || []).length; }

                        if (length > 1) {
                            betmodel = {
                                layPrice: length,
                                backPrice: arr[0]
                            };
                        } else if (arr.length == 2) {
                            if (arr[1]) {
                                betmodel = {
                                    layPrice: arr[1],
                                    backPrice: arr[0]
                                };
                            } else {
                                betmodel = {
                                    layPrice: 1,
                                    backPrice: arr[0]
                                };
                            }
                        }
                    }

                    if (betmodel) {
                        betmodel.backPrice = math.round(math.add(math.divide(betmodel.backPrice, multiplBy), 1), 2);
                        var backmodel = this.increment(betmodel.backPrice);
                        if (backmodel.modulo > 0) {
                            var addition: any = math.round(math.divide(math.add(backmodel.odds, backmodel.interval), 100), 2);
                            if (1000 >= addition) {
                                betmodel.backPrice = common.helpers.Utility.isInt(addition) ? parseInt(addition) : addition;
                            }
                        }

                        var layprice = betmodel.backPrice;
                        for (var i = 0; i < betmodel.layPrice; i++) {
                            var laymodel = this.increment(layprice);
                            if (laymodel.interval > 0) {
                                var addition: any = math.round(math.divide(math.add(laymodel.odds, laymodel.interval), 100), 2);
                                if (1000 >= addition) {
                                    layprice = common.helpers.Utility.isInt(addition) ? parseInt(addition) : addition;
                                }
                            }
                        }
                        betmodel.layPrice = betmodel.backPrice;
                        betmodel.backPrice = layprice;
                    }
                }
            }

            runner.betModel = betmodel;
        }

        private placeManualBet(r: any): void {
            if (r.betModel && r.betModel.backPrice > 1) {
                this.placeBet(1, r, r.betModel.backPrice);
            }
            if (r.betModel && r.betModel.layPrice > 1) {
                this.placeBet(2, r, r.betModel.layPrice);
            }
            r.priceValue = 0;
            this.onRunnerPriceChange(r);
        }
    }

    angular.module('intranet.home').controller('radarModalCtrl', RadarModalCtrl);
}