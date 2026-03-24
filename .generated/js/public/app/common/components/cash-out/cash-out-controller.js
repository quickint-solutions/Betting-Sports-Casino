var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTCashOutController extends common.ControllerBase {
                constructor($scope, $timeout, settings, $rootScope, $sce, commonDataService, betService, toasterService, $filter) {
                    super($scope);
                    this.$timeout = $timeout;
                    this.settings = settings;
                    this.$rootScope = $rootScope;
                    this.$sce = $sce;
                    this.commonDataService = commonDataService;
                    this.betService = betService;
                    this.toasterService = toasterService;
                    this.$filter = $filter;
                    var processWatcher = $scope.$watch('market', (newItem, oldItem) => {
                        if (newItem != oldItem) {
                            this.startProcess();
                        }
                    });
                    var listenEvent = this.$scope.$on('openbets-updated', () => {
                        this.startProcess();
                    });
                    this.$scope.$on('$destroy', () => {
                        processWatcher();
                        listenEvent();
                        this.$timeout.cancel(this.$scope.timer_calculator);
                    });
                    this.$scope.betProcessing = false;
                    this.$scope.isOpen = false;
                    this.$scope.tooltipHtml = '';
                    this.$scope.newBets = [];
                    this.$scope.CurrencyFraction = this.settings.CurrencyFraction;
                }
                startProcess() {
                    this.$timeout.cancel(this.$scope.timer_calculator);
                    if (this.settings.WebApp == 'abexch9' && this.$scope.market) {
                        this.$scope.market.noCaseout = true;
                    }
                    if (this.$scope.market
                        && this.$scope.market.noCaseout != true
                        && (this.$scope.market.sourceId > 0 || this.$scope.market.eventType.id == this.settings.LiveGamesId)
                        && (this.$scope.market.bettingType == common.enums.BettingType.ODDS ||
                            this.$scope.market.bettingType == common.enums.BettingType.BM || this.$scope.market.bettingType == common.enums.BettingType.ASIAN_HANDICAP_SINGLE_LINE)) {
                        this.$scope.isOpen = !(this.$scope.market.temporaryStatus == 3 || this.$scope.market.marketStatus == 3 || this.$scope.market.marketStatus == 4);
                        if (this.$scope.isOpen && this.$scope.market.eventType.id == this.settings.LiveGamesId) {
                            this.$scope.isOpen = !(this.$scope.market.temporaryStatus == 2);
                        }
                        var marketBets = this.commonDataService.openBets.filter((a) => { return a.marketId == this.$scope.market.id; });
                        if (marketBets.length > 0 && this.$scope.isOpen == true) {
                            this.$scope.newBets = [];
                            var localtooltip = '';
                            this.$scope.market.marketRunner.forEach((m) => {
                                m.backTotal = 0;
                                m.layTotal = 0;
                                m.backPL = 0;
                                m.layPL = 0;
                                marketBets[0].bets.forEach((b) => {
                                    if (m.runner.id == b.runnerId) {
                                        if (b.side == 1) {
                                            m.backTotal = math.multiply(b.price, b.sizeMatched);
                                            m.backPL = math.subtract(m.backTotal, b.sizeMatched);
                                        }
                                        if (b.side == 2) {
                                            m.layTotal = math.multiply(b.price, b.sizeMatched);
                                            m.layPL = math.subtract(m.layTotal, b.sizeMatched);
                                        }
                                    }
                                });
                                if (m.backTotal > 0 || m.layTotal > 0) {
                                    m.differance = math.subtract(m.backTotal, m.layTotal);
                                    if (m.differance > 0) {
                                        m.hedgeSide = 2;
                                        m.hedgeOdds = m.layPrice && m.layPrice.length > 0 ? m.layPrice[0].price : 0;
                                    }
                                    else {
                                        m.hedgeSide = 1;
                                        m.hedgeOdds = m.backPrice && m.backPrice.length > 0 ? m.backPrice[0].price : 0;
                                    }
                                    if (m.hedgeOdds > 0) {
                                        m.differance = math.abs(m.differance);
                                        m.hedgeStake = math.divide(m.differance, m.hedgeOdds);
                                        if (m.hedgeSide == 2) {
                                            m.hedgeValue = math.subtract(math.subtract(m.backPL, m.layPL), math.subtract(m.differance, m.hedgeStake));
                                        }
                                        else {
                                            m.hedgeValue = math.add(math.subtract(m.backPL, m.layPL), math.subtract(m.differance, m.hedgeStake));
                                        }
                                        if (this.$filter('toRateOnly')(m.hedgeStake) != 0) {
                                            this.$scope.newBets.push({ marketId: this.$scope.market.id, runnerName: m.runner.name, runnerId: m.runner.id, price: m.hedgeOdds, size: this.$filter('toRateOnly')(m.hedgeStake), side: m.hedgeSide });
                                            localtooltip = localtooltip + (localtooltip.length > 0 ? '</br>' : '') + (m.hedgeSide == 1 ? 'Back' : 'Lay') + ' on <b>' + m.runner.name + '</b> of <b>' + this.$filter('toRate')(m.hedgeStake) + '</b> @ <b>' + this.$filter('number')(m.hedgeOdds, 2) + '</b>';
                                        }
                                    }
                                }
                            });
                            if (localtooltip != this.$scope.tooltipHtml) {
                                this.$scope.tooltipHtml = this.$sce.trustAsHtml(localtooltip);
                            }
                            if (this.$scope.newBets.length > 0) {
                                var result = common.helpers.PotentialPLCalc.calcPLProjection(this.$scope.market, this.$scope.newBets);
                                this.$scope.profitLoss = result.marketRunner[0].pPL;
                            }
                        }
                        else {
                            this.$scope.newBets.splice(0);
                        }
                    }
                    this.$scope.timer_calculator = this.$timeout(() => { this.startProcess(); }, 1000);
                }
                betMessage(model, response) {
                    if (response.success) {
                        if (response.data) {
                            var bet = response.data;
                            if (bet.orderStatus) {
                                if (bet.sizeRemaining > 0) {
                                    var matched = this.$filter('toRate')(bet.sizeMatched);
                                    var remaining = this.$filter('toRate')(bet.sizeRemaining);
                                    var unMatchmsg = this.$filter('translate')('bet.unmatched.message');
                                    unMatchmsg = unMatchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), model.runnerName, matched, bet.avgPrice, remaining, model.price);
                                    this.toasterService.showToastMessage(common.helpers.ToastType.Error, unMatchmsg, 5000);
                                }
                                else {
                                    var matched = this.$filter('toRate')(bet.sizeMatched);
                                    var placed = this.$filter('toRate')(model.size);
                                    var Matchmsg = this.$filter('translate')('bet.matched.message');
                                    Matchmsg = Matchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), model.runnerName, placed, model.price, matched, bet.avgPrice);
                                    this.toasterService.showToastMessage(common.helpers.ToastType.Success, Matchmsg, 5000);
                                }
                                this.$rootScope.$broadcast('bet-submitted', { marketId: response.data.bet.marketId });
                            }
                            else {
                                var msg = bet.message.format('', '');
                                msg = msg.replace('(', '').replace(')', '');
                                this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg);
                            }
                        }
                    }
                    else {
                        if (response.messages) {
                            this.toasterService.showMessages(response.messages, 3000);
                        }
                    }
                }
                cashout() {
                    if (this.$scope.newBets.length > 0) {
                        this.$scope.betProcessing = true;
                        this.$scope.newBets.forEach((model, index) => {
                            this.$rootScope.$emit('place-bet-started', { marketId: this.$scope.market.id, eventTypeId: this.$scope.market.eventType.id });
                            model.betFrom = common.enums.BetFrom.Cashout;
                            this.betService.placeBet(model)
                                .success((response) => {
                                this.betMessage(model, response);
                            }).finally(() => {
                                this.$rootScope.$emit('place-bet-ended', { marketId: model.marketId });
                                if (index == this.$scope.newBets.length - 1) {
                                    this.$scope.betProcessing = false;
                                    this.$scope.newBets.splice(0);
                                }
                            });
                        });
                    }
                }
                hideme() {
                    this.$scope.market.noCaseout = true;
                }
            }
            angular.module('kt.components')
                .controller('KTCashOutController', KTCashOutController);
            angular.module('kt.components')
                .directive('ktCashOut', () => {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        market: '=',
                    },
                    controller: 'KTCashOutController',
                    templateUrl: 'app/common/components/cash-out/cash-out.html',
                    compile: (elem, attr) => {
                        return {
                            pre: (scope, element, attrs) => {
                            },
                            post: (scope, element, attrs) => {
                            }
                        };
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=cash-out-controller.js.map