var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class PlaceBetCtrl extends intranet.common.ControllerBase {
            constructor($scope, placeBetDataService, localStorageHelper, toasterService, settings, promiseTracker, accountService, $filter, $timeout, $rootScope, betService) {
                super($scope);
                this.placeBetDataService = placeBetDataService;
                this.localStorageHelper = localStorageHelper;
                this.toasterService = toasterService;
                this.settings = settings;
                this.promiseTracker = promiseTracker;
                this.accountService = accountService;
                this.$filter = $filter;
                this.$timeout = $timeout;
                this.$rootScope = $rootScope;
                this.betService = betService;
                var listenBetPlace = this.$rootScope.$on("bet-placed", () => {
                    this.getBetData();
                });
                var listenStakeConfig = this.$rootScope.$on(this.settings.StakeConfig, () => {
                    this.getStakeRange();
                });
                this.$scope.$on('$destroy', () => {
                    if (listenBetPlace) {
                        listenBetPlace();
                    }
                    if (listenStakeConfig) {
                        listenStakeConfig();
                    }
                });
                super.init(this);
            }
            initScopeValues() {
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
            loadInitialData() {
                this.getBetData();
                this.getStakeRange();
            }
            getStakeRange() {
                var result = this.localStorageHelper.get(this.settings.StakeConfig);
                if (result) {
                    angular.copy(result, this.$scope.stakeConfig);
                    if (this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'dimd' || this.settings.ThemeName == 'dimd2')
                        this.$scope.stakeConfig.stake.splice(3, 0, { isActive: true, stake: -1, isMax: true, name: 'MAX' });
                }
            }
            getBetData() {
                var model = this.placeBetDataService.getSharedData();
                if (model) {
                    this.$scope.backData = model.backData;
                    this.$scope.layData = model.layData;
                    this.$scope.isExpanded = false;
                    if (this.$scope.backData || this.$scope.layData) {
                        if (this.$scope.backData) {
                            this.$scope.backData.forEach((back) => {
                                angular.forEach(back.eventData, (e) => {
                                    this.backOddsChanged(e.marketId, e.runnerId, parseFloat(e.price));
                                });
                            });
                        }
                        this.$scope.$parent.selectedBetTab = 0;
                        this.$scope.confirmationMode = false;
                        this.calculateLiability(true);
                        this.$scope.isExpanded = true;
                    }
                    else {
                        this.sendBetDataForPPL(true);
                    }
                }
            }
            submitBet(confirmed = false) {
                if (this.$scope.needsToConfirm && !confirmed) {
                    this.$timeout(() => { document.getElementById('btn-bet-confirm').focus(); }, 10);
                    this.$scope.confirmationMode = true;
                }
                else {
                    var model = [];
                    angular.forEach(this.$scope.backData, (v) => {
                        v.eventData.forEach((e) => { e.betFrom = intranet.common.enums.BetFrom.Betslip; model.push(e); });
                    });
                    angular.forEach(this.$scope.layData, (v) => {
                        v.eventData.forEach((e) => { e.betFrom = intranet.common.enums.BetFrom.Betslip; model.push(e); });
                    });
                    var promise = this.betService.placeBets(model);
                    this.$scope.bet_loader.addPromise(promise);
                    var betDelay = 0;
                    angular.forEach(model, (m) => {
                        if (betDelay == 0) {
                            if (m.bettingType == intranet.common.enums.BettingType.ODDS || m.bettingType == intranet.common.enums.BettingType.BM) {
                                betDelay = m.betDelay;
                            }
                        }
                    });
                    if (betDelay > 0)
                        this.startDelayTimer(betDelay);
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.messages.splice(0);
                            this.$scope.confirmationMode = false;
                            if (response.data) {
                                response.data.forEach((r) => {
                                    if (r.orderStatus) {
                                        if (r.sizeRemaining > 0) {
                                            var runnername = model.filter((m) => { return m.runnerId == r.bet.runnerId; });
                                            var matched = this.$filter('toRate')(r.sizeMatched);
                                            var remaining = this.$filter('toRate')(r.sizeRemaining);
                                            var unMatchmsg = "Bet Unmatched. {0} - {1} - {2} at odds {3}";
                                            unMatchmsg = unMatchmsg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), runnername[0].runnerName, remaining, r.bet.price);
                                            this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Success, unMatchmsg, 5000);
                                        }
                                        else {
                                            var runnername = model.filter((m) => { return m.runnerId == r.bet.runnerId; });
                                            var matched = this.$filter('toRate')(r.sizeMatched);
                                            var placed = this.$filter('toRate')(r.bet.size);
                                            var msg = this.$filter('translate')('bet.matched.message');
                                            msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), runnername[0].runnerName, placed, r.bet.price, matched, r.avgPrice);
                                            this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Success, msg, 5000);
                                        }
                                        if (r.bet) {
                                            var bet = r.bet;
                                            if (bet.side == 1) {
                                                var bindex = -1;
                                                var eindex = -1;
                                                this.$scope.backData.forEach((b, bi) => {
                                                    b.eventData.forEach((e, ei) => {
                                                        if (e.marketId == bet.marketId && e.runnerId == bet.runnerId) {
                                                            bindex = bi;
                                                            eindex = ei;
                                                        }
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
                                                this.$scope.layData.forEach((l, li) => {
                                                    l.eventData.forEach((e, ei) => {
                                                        if (e.marketId == bet.marketId && e.runnerId == bet.runnerId) {
                                                            lindex = li;
                                                            eindex = ei;
                                                        }
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
                                        if (r.bet) {
                                            var bet = r.bet;
                                            var market = null;
                                            if (bet.side == 1) {
                                                this.$scope.backData.forEach((b) => {
                                                    b.eventData.forEach((e) => {
                                                        if (e.marketId == bet.marketId && e.runnerId == bet.runnerId) {
                                                            market = e;
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                this.$scope.layData.forEach((l) => {
                                                    l.eventData.forEach((e) => {
                                                        if (e.marketId == bet.marketId && e.runnerId == bet.runnerId) {
                                                            market = e;
                                                        }
                                                    });
                                                });
                                            }
                                            if (market) {
                                                if (r.message == 'Account is locked') {
                                                    this.$scope.messages.splice(0);
                                                    this.$scope.messages.push({ responseMessageType: intranet.common.messaging.ResponseMessageType.Validation, text: 'Member is not active. Please contact your upline.' });
                                                }
                                                else {
                                                    var msg = r.message.format(market.marketName, market.runnerName);
                                                    this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Error, msg);
                                                }
                                            }
                                        }
                                    }
                                });
                                var succeedMarkets = response.data.filter((r) => { return r.orderStatus == true; });
                                if (succeedMarkets.length > 0) {
                                    this.$rootScope.$broadcast('bet-submitted', { marketId: succeedMarkets[0].bet.marketId });
                                }
                            }
                            this.calculateLiability(true);
                        }
                        else {
                            if (response.messages) {
                                this.toasterService.showMessages(response.messages, 3000);
                            }
                        }
                    });
                }
            }
            startDelayTimer(betDelay = 0) {
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
                            startdelay();
                        }, 1200);
                    }
                    else {
                        stopdelay();
                    }
                });
                this.$timeout(() => { startdelay(); }, 1000);
            }
            showStake(side, parent, index) {
                this.$scope.focusStake = 'stake' + side + parent.toString() + index.toString();
            }
            hideStake() {
                this.$scope.focusStake = 'stake';
            }
            stakeClick(model, stake) {
                if (stake > 0) {
                    if (!model.size) {
                        model.size = 0;
                    }
                    model.size = math.add(math.number(model.size), math.number(stake));
                    this.calculateLiability();
                    this.sendBetDataForPPL();
                }
                else {
                    this.getMaxBalance(model);
                }
            }
            getMaxBalance(model) {
                this.accountService.getBalance()
                    .success((res) => {
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
            confirmationModeChanged() {
                this.localStorageHelper.set(this.settings.ThemeName + '_confirmbet', this.$scope.needsToConfirm);
            }
            backOddsChanged(marketId, runnerId, price) {
                this.removeErrorMessage(marketId + '_' + runnerId);
                if (this.$scope.layData) {
                    this.$scope.layData.forEach((lay) => {
                        var matched = lay.eventData.filter((e) => {
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
            addErrorMessage(ename, mname, rname, id) {
                var msg = this.$filter('translate')('common.odds.validation.message');
                msg = msg.format(ename, mname, rname);
                this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, id.toString()));
            }
            removeErrorMessage(id) {
                var filtered = [];
                this.$scope.messages.forEach((v, i) => {
                    if (v.propertyPath == id) {
                        filtered.push(i);
                    }
                });
                filtered.forEach((index) => { this.$scope.messages.splice(index); });
            }
            layOddsChanged(marketId, runnerId, price) {
                this.removeErrorMessage(marketId + '_' + runnerId);
                if (this.$scope.backData) {
                    this.$scope.backData.forEach((lay) => {
                        var matched = lay.eventData.filter((e) => {
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
            deleteBet(side, marketId, runnerId) {
                if (side == 1) {
                    if (this.$scope.backData) {
                        var index = -1, eventIndex = -1;
                        this.$scope.backData.forEach((back, ei) => {
                            back.eventData.forEach((e, i) => {
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
                        var index = -1, eventIndex = -1;
                        this.$scope.layData.forEach((lay, ei) => {
                            lay.eventData.forEach((e, i) => {
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
            deleteAllBets() {
                this.$scope.messages.splice(0);
                if (this.$scope.backData)
                    this.$scope.backData.splice(0);
                if (this.$scope.layData)
                    this.$scope.layData.splice(0);
                this.sendBetDataForPPL(true);
            }
            calculateLiability(sizeChanged = false) {
                this.$scope.betsList = [];
                this.$scope.isValid = true;
                var liability = 0;
                if (this.$scope.backData) {
                    this.$scope.backData.forEach((back) => {
                        back.eventData.forEach((e) => {
                            this.$scope.betsList.push({ marketId: e.marketId, runnerId: e.runnerId, price: e.price, size: e.size ? e.size : 0, side: 1, sectionId: e.sectionId });
                            if (e.size && e.size > 0) {
                                if (e.bettingType == 7 || e.bettingType == 2 || e.bettingType == 8) {
                                    liability = math.add(liability, math.number(e.size));
                                }
                                else {
                                    liability = math.add(liability, math.number(e.size));
                                }
                            }
                            else {
                                this.$scope.isValid = false;
                            }
                        });
                    });
                }
                if (this.$scope.layData) {
                    this.$scope.layData.forEach((lay) => {
                        lay.eventData.forEach((e) => {
                            this.$scope.betsList.push({ marketId: e.marketId, runnerId: e.runnerId, price: e.price, size: e.size ? e.size : 0, side: 2, sectionId: e.sectionId });
                            if (e.size && e.size > 0) {
                                if (e.bettingType == 7 || e.bettingType == 2) {
                                    liability = math.add(liability, math.number(e.size));
                                }
                                else {
                                    liability = liability + math.multiply(math.subtract(e.price, 1), e.size);
                                }
                            }
                            else {
                                this.$scope.isValid = false;
                            }
                        });
                    });
                }
                if (this.$scope.messages.some((v) => { return v.responseMessageType == 8; })) {
                    this.$scope.isValid = false;
                }
                this.$scope.liability = liability;
                if (sizeChanged) {
                    this.sendBetDataForPPL();
                }
            }
            sendBetDataForPPL(deleted = false) {
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
        home.PlaceBetCtrl = PlaceBetCtrl;
        angular.module('intranet.home').controller('placeBetCtrl', PlaceBetCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PlaceBetCtrl.js.map