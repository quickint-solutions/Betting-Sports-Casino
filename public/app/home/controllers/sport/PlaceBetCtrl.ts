module intranet.home {

    export interface IPlaceBetScope extends intranet.common.IScopeBase {
        backData: any[];
        layData: any[];
        focusStake: string;
        messages: any[];
        liability: number;
        isValid: boolean;
        stakeConfig: any;
        isExpanded: boolean;
        betsList: any[];
        $parent: any;
        betDelay: any;

        needsToConfirm: boolean;
        confirmationMode: boolean;

        bet_loader: any;
    }

    export class PlaceBetCtrl extends intranet.common.ControllerBase<IPlaceBetScope>
        implements intranet.common.init.IInit {
        constructor($scope: IPlaceBetScope,
            private placeBetDataService: common.services.PlaceBetDataService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings,
            private promiseTracker: any,
            private accountService: services.AccountService,
            private $filter: any,
            private $timeout: any,
            protected $rootScope: any,
            private betService: services.BetService) {
            super($scope);

            var listenBetPlace = this.$rootScope.$on("bet-placed", () => {
                this.getBetData();
            });

            var listenStakeConfig = this.$rootScope.$on(this.settings.StakeConfig, () => {
                this.getStakeRange();
            });

            this.$scope.$on('$destroy', () => {
                if (listenBetPlace) { listenBetPlace(); }
                if (listenStakeConfig) { listenStakeConfig(); }
            });
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.backData = [];
            this.$scope.layData = [];
            this.$scope.focusStake = 'stake';
            this.$scope.messages = [];
            this.$scope.liability = 0;
            this.$scope.stakeConfig = {};
            this.$scope.needsToConfirm = this.placeBetDataService.ignoreConfirmation(this.settings.ThemeName) ? false : ((this.localStorageHelper.get(this.settings.ThemeName + '_confirmbet') == undefined) ? true : this.localStorageHelper.get(this.settings.ThemeName + '_confirmbet'));
            this.$scope.confirmationMode = false;

            this.$scope.bet_loader = this.promiseTracker({ activationDelay: 500, minDuration: 750 });
        }

        public loadInitialData() {
            this.getBetData();
            this.getStakeRange();
        }

        private getStakeRange(): void {
            var result = this.localStorageHelper.get(this.settings.StakeConfig);
            if (result) {
                angular.copy(result, this.$scope.stakeConfig);
                //this.$scope.stakeConfig = result;
                if (this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'dimd' || this.settings.ThemeName == 'dimd2')
                    this.$scope.stakeConfig.stake.splice(3, 0, { isActive: true, stake: -1, isMax: true, name: 'MAX' })
            }
        }

        private getBetData(): void {
            var model = this.placeBetDataService.getSharedData();
            if (model) {
                this.$scope.backData = model.backData;
                this.$scope.layData = model.layData;
                this.$scope.isExpanded = false;
                if (this.$scope.backData || this.$scope.layData) {
                    if (this.$scope.backData) {
                        this.$scope.backData.forEach((back: any) => {
                            angular.forEach(back.eventData, (e: any) => {
                                this.backOddsChanged(e.marketId, e.runnerId, parseFloat(e.price));
                            });
                        });
                    }
                    this.$scope.$parent.selectedBetTab = 0;
                    this.$scope.confirmationMode = false;
                    this.calculateLiability(true);
                    this.$scope.isExpanded = true;
                } else {

                    this.sendBetDataForPPL(true);
                }
            }
        }

        private submitBet(confirmed: boolean = false): void {
            if (this.$scope.needsToConfirm && !confirmed) {
                this.$timeout(() => { document.getElementById('btn-bet-confirm').focus(); }, 10);
                this.$scope.confirmationMode = true;
            }
            else {
                var model: any[] = [];
                angular.forEach(this.$scope.backData, (v: any) => {
                    v.eventData.forEach((e: any) => { e.betFrom = common.enums.BetFrom.Betslip; model.push(e); });
                });
                angular.forEach(this.$scope.layData, (v: any) => {
                    v.eventData.forEach((e: any) => { e.betFrom = common.enums.BetFrom.Betslip; model.push(e); });
                });

                var promise = this.betService.placeBets(model);
                this.$scope.bet_loader.addPromise(promise);

                var betDelay = 0;
                angular.forEach(model, (m: any) => {
                    if (betDelay == 0) {
                        if (m.bettingType == common.enums.BettingType.ODDS || m.bettingType == common.enums.BettingType.BM) {
                            betDelay = m.betDelay;
                        }
                    }
                });
                if (betDelay > 0) this.startDelayTimer(betDelay);

                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.messages.splice(0);
                        this.$scope.confirmationMode = false;
                        if (response.data) {
                            response.data.forEach((r: any) => {
                                if (r.orderStatus) {
                                    // success
                                    if (r.sizeRemaining > 0) {
                                        var runnername = model.filter((m: any) => { return m.runnerId == r.bet.runnerId; })
                                        var matched = this.$filter('toRate')(r.sizeMatched);
                                        var remaining = this.$filter('toRate')(r.sizeRemaining);
                                        var unMatchmsg = "Bet Unmatched. {0} - {1} - {2} at odds {3}";
                                        unMatchmsg = unMatchmsg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), runnername[0].runnerName, remaining, r.bet.price);
                                        //msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), runnername[0].runnerName, matched, r.avgPrice, remaining, r.bet.price);
                                        this.toasterService.showToastMessage(common.helpers.ToastType.Success, unMatchmsg, 5000);
                                    }
                                    else {
                                        var runnername = model.filter((m: any) => { return m.runnerId == r.bet.runnerId; })
                                        var matched = this.$filter('toRate')(r.sizeMatched);
                                        var placed = this.$filter('toRate')(r.bet.size);
                                        var msg: any = this.$filter('translate')('bet.matched.message');
                                        msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), runnername[0].runnerName, placed, r.bet.price, matched, r.avgPrice);
                                        this.toasterService.showToastMessage(common.helpers.ToastType.Success, msg, 5000);
                                    }
                                    if (r.bet) {
                                        var bet = r.bet;
                                        if (bet.side == 1) {
                                            var bindex = -1;
                                            var eindex = -1;
                                            this.$scope.backData.forEach((b: any, bi: any) => {
                                                b.eventData.forEach((e: any, ei: any) => {
                                                    if (e.marketId == bet.marketId && e.runnerId == bet.runnerId) { bindex = bi; eindex = ei; }
                                                });
                                            });
                                            if (bindex >= 0) {
                                                this.$scope.backData[bindex].eventData.splice(eindex, 1);
                                                if (this.$scope.backData[bindex].eventData.length <= 0) {
                                                    this.$scope.backData.splice(bindex, 1);
                                                }
                                            }
                                        }
                                        else {
                                            var lindex = -1;
                                            var eindex = -1;
                                            this.$scope.layData.forEach((l: any, li: any) => {
                                                l.eventData.forEach((e: any, ei: any) => {
                                                    if (e.marketId == bet.marketId && e.runnerId == bet.runnerId) { lindex = li; eindex = ei; }
                                                });
                                            });
                                            if (lindex >= 0) {
                                                this.$scope.layData[lindex].eventData.splice(eindex, 1);
                                                if (this.$scope.layData[lindex].eventData.length <= 0) {
                                                    this.$scope.layData.splice(lindex, 1);
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    // failed
                                    if (r.bet) {
                                        var bet = r.bet;
                                        var market = null;
                                        if (bet.side == 1) {
                                            this.$scope.backData.forEach((b: any) => {
                                                b.eventData.forEach((e: any) => {
                                                    if (e.marketId == bet.marketId && e.runnerId == bet.runnerId) { market = e; }
                                                });
                                            });
                                        }
                                        else {
                                            this.$scope.layData.forEach((l: any) => {
                                                l.eventData.forEach((e: any) => {
                                                    if (e.marketId == bet.marketId && e.runnerId == bet.runnerId) { market = e; }
                                                });
                                            });
                                        }
                                        if (market) {
                                            if (r.message == 'Account is locked') {
                                                this.$scope.messages.splice(0);
                                                this.$scope.messages.push({ responseMessageType: common.messaging.ResponseMessageType.Validation, text: 'Member is not active. Please contact your upline.' });
                                            } else {
                                                var msg = r.message.format(market.marketName, market.runnerName);
                                                this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg);
                                            }
                                        }
                                    }
                                }
                            });
                            var succeedMarkets = response.data.filter((r: any) => { return r.orderStatus == true });
                            if (succeedMarkets.length > 0) {
                                this.$rootScope.$broadcast('bet-submitted', { marketId: succeedMarkets[0].bet.marketId });
                            }
                        }
                        // send data to PPL
                        this.calculateLiability(true);

                    } else {
                        if (response.messages) {
                            this.toasterService.showMessages(response.messages, 3000);
                        }
                    }
                });
            }
        }

        private startDelayTimer(betDelay: any = 0): void {
            var timer_betdelay;
            this.$scope.betDelay = betDelay > 0 ? betDelay : 0;
            var stopdelay = (() => {
                if (timer_betdelay) {
                    this.$timeout.cancel(timer_betdelay);
                }
            });
            var startdelay = (() => {
                if (this.$scope.betDelay > 0) {
                    this.$scope.betDelay = this.$scope.betDelay - 1;
                    timer_betdelay = this.$timeout(() => {
                        startdelay()
                    }, 1200);
                } else {
                    stopdelay();
                }
            });
            this.$timeout(() => { startdelay() }, 1000);
        }

        private showStake(side, parent, index: any): void {
            this.$scope.focusStake = 'stake' + side + parent.toString() + index.toString();
        }

        private hideStake(): void {
            this.$scope.focusStake = 'stake';
        }

        private stakeClick(model: any, stake: number): void {
            if (stake > 0) {
                if (!model.size) { model.size = 0; }
                model.size = math.add(math.number(model.size), math.number(stake));
                this.calculateLiability();
                this.sendBetDataForPPL();
            } else {
                this.getMaxBalance(model);
            }
        }

        private getMaxBalance(model: any): void {
            this.accountService.getBalance()
                .success((res: common.messaging.IResponse<any>) => {
                    if (res.success) {
                        var max = math.add(math.add(res.data.balance, res.data.creditLimit), res.data.exposure);
                        if (max > 0) {
                            model.size = this.$filter('toRateOnly')(max);
                            this.calculateLiability();
                            this.sendBetDataForPPL();
                        }
                    }
                });
        }

        private confirmationModeChanged(): void {
            this.localStorageHelper.set(this.settings.ThemeName + '_confirmbet', this.$scope.needsToConfirm);
        }


        private backOddsChanged(marketId: any, runnerId: any, price: any): void {
            this.removeErrorMessage(marketId + '_' + runnerId);
            if (this.$scope.layData) {
                this.$scope.layData.forEach((lay: any) => {
                    var matched = lay.eventData.filter((e: any) => {
                        return (e.marketId == marketId
                            && e.runnerId == runnerId
                            && parseFloat(e.price) >= parseFloat(price));
                    });
                    if (matched.length > 0) {
                        this.addErrorMessage(lay.name, matched[0].marketName, matched[0].runnerName, marketId + '_' + runnerId);
                    }
                });
            }
            this.calculateLiability(true);
        }

        private addErrorMessage(ename, mname, rname, id): void {
            var msg: string = this.$filter('translate')('common.odds.validation.message');
            msg = msg.format(ename, mname, rname);
            this.$scope.messages.push(new common.messaging.ResponseMessage(
                common.messaging.ResponseMessageType.Error,
                msg, id.toString()));
        }

        private removeErrorMessage(id: any): void {
            var filtered: any[] = [];
            this.$scope.messages.forEach((v: common.messaging.ResponseMessage, i: any) => {
                if (v.propertyPath == id) { filtered.push(i); }
            });
            filtered.forEach((index: any) => { this.$scope.messages.splice(index); });
        }

        private layOddsChanged(marketId: any, runnerId: any, price: any): void {
            this.removeErrorMessage(marketId + '_' + runnerId);
            if (this.$scope.backData) {
                this.$scope.backData.forEach((lay: any) => {
                    var matched = lay.eventData.filter((e: any) => {
                        return (e.marketId == marketId
                            && e.runnerId == runnerId
                            && parseFloat(e.price) <= parseFloat(price));
                    });
                    if (matched.length > 0) {
                        this.addErrorMessage(lay.name, matched[0].marketName, matched[0].runnerName, marketId + '_' + runnerId);
                    }
                });
            }
            this.calculateLiability(true);
        }

        private deleteBet(side: any, marketId: any, runnerId: any): void {
            if (side == 1) {
                if (this.$scope.backData) {
                    var index: number = -1, eventIndex: number = -1;
                    this.$scope.backData.forEach((back: any, ei: any) => {
                        back.eventData.forEach((e: any, i: any) => {
                            if (e.marketId == marketId
                                && e.runnerId == runnerId) {
                                index = i;
                                eventIndex = ei;
                            }
                        });
                    });
                    if (index > -1) {
                        this.removeErrorMessage(marketId + '_' + runnerId);
                        this.$scope.backData[eventIndex].eventData.splice(index, 1);
                        if (this.$scope.backData[eventIndex].eventData.length == 0) {
                            this.$scope.backData.splice(eventIndex, 1);
                        }
                    }
                }
            }
            else if (side == 2) {
                if (this.$scope.layData) {
                    var index: number = -1, eventIndex: number = -1;
                    this.$scope.layData.forEach((lay: any, ei: any) => {
                        lay.eventData.forEach((e: any, i: any) => {
                            if (e.marketId == marketId
                                && e.runnerId == runnerId) {
                                index = i;
                                eventIndex = ei;
                            }
                        });
                    });
                    if (index > -1) {
                        this.removeErrorMessage(marketId + '_' + runnerId);
                        this.$scope.layData[eventIndex].eventData.splice(index, 1);
                        if (this.$scope.layData[eventIndex].eventData.length == 0) {
                            this.$scope.layData.splice(eventIndex, 1);
                        }
                    }
                }
            }
            this.calculateLiability();
            this.sendBetDataForPPL();
        }

        private deleteAllBets(): void {
            this.$scope.messages.splice(0);
            if (this.$scope.backData) this.$scope.backData.splice(0);
            if (this.$scope.layData) this.$scope.layData.splice(0);
            this.sendBetDataForPPL(true);
        }

        private calculateLiability(sizeChanged: boolean = false): void {
            this.$scope.betsList = [];
            this.$scope.isValid = true;
            var liability: any = 0;
            if (this.$scope.backData) {
                this.$scope.backData.forEach((back: any) => {
                    back.eventData.forEach((e: any) => {
                        this.$scope.betsList.push({ marketId: e.marketId, runnerId: e.runnerId, price: e.price, size: e.size ? e.size : 0, side: 1, sectionId: e.sectionId });
                        if (e.size && e.size > 0) {
                            if (e.bettingType == 7 || e.bettingType == 2 || e.bettingType == 8) {
                                liability = math.add(liability, math.number(e.size));
                            }
                            else {
                                liability = math.add(liability, math.number(e.size));
                            }
                        }
                        else { this.$scope.isValid = false; }
                    });
                });
            }
            if (this.$scope.layData) {
                this.$scope.layData.forEach((lay: any) => {
                    lay.eventData.forEach((e: any) => {
                        this.$scope.betsList.push({ marketId: e.marketId, runnerId: e.runnerId, price: e.price, size: e.size ? e.size : 0, side: 2, sectionId: e.sectionId });
                        if (e.size && e.size > 0) {
                            if (e.bettingType == 7 || e.bettingType == 2) {
                                liability = math.add(liability, math.number(e.size));
                            }
                            else {
                                liability = liability + math.multiply(math.subtract(e.price, 1), e.size);
                            }
                        }
                        else { this.$scope.isValid = false; }
                    });
                });
            }

            if (this.$scope.messages.some((v: any) => { return v.responseMessageType == 8; })) {
                this.$scope.isValid = false;
            }
            this.$scope.liability = liability;
            if (sizeChanged) { this.sendBetDataForPPL(); }
        }

        private sendBetDataForPPL(deleted: any = false): void {
            if (deleted) {
                this.$scope.messages.splice(0);
                this.placeBetDataService.setPPLdata(null);
                this.$rootScope.$broadcast("catch-for-ppl");
            }
            else {
                this.placeBetDataService.setPPLdata({ bets: this.$scope.betsList });
                this.$rootScope.$broadcast("catch-for-ppl");
            }
        }
    }
    angular.module('intranet.home').controller('placeBetCtrl', PlaceBetCtrl);
}