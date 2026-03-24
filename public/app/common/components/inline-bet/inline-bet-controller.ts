namespace intranet.common.directives {

    export interface IKTInlineBetScope extends common.IScopeBase {
        marketId: any;
        runnerId: any;
        minValue: number;
        maxValue: number;
        interval: number;
        ladderType: number;
        bettingType: number;
        gameType: any;
        price: any;
        size: any;
        side: any;
        stakeConfig: { stake: any, defaultStake: number };
        removeInlineBet: any;
        placeBetLabel: any;
        percentage: any;
        sectionId: any;
        canChange: any;
        maxBet: any;
        minBet: any;
        betDelay: any;
        temporaryStatus: any;
        maxProfit: any;

        eventName: any;
        marketName: any;
        runnerName: any;
        eventTypeId: any;
        confirmBet: any;
        isMobile: any;

        valueFocus: any;
        confirmRequired: boolean;

        betId: any;
        disableOdds: any;
        betSize: any;

        animateLoader: boolean;
    }

    class KTInlineBetController
        extends common.ControllerBase<IKTInlineBetScope> {
        /* @ngInject */
        constructor($scope: IKTInlineBetScope,
            protected $rootScope: any,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private toasterService: intranet.common.services.ToasterService,
            private placeBetDataService: common.services.PlaceBetDataService,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private betService: intranet.services.BetService,
            private $filter: any) {
            super($scope);

            var listenStakeConfig = this.$rootScope.$on(this.settings.StakeConfig, () => {
                this.getStakeRange();
            });

            this.$scope.$on('$destroy', () => {
                if (listenStakeConfig) { listenStakeConfig(); }
            });

            super.init(this);
        }

        private getStakeRange(): void {
            var result = this.localStorageHelper.get(this.settings.StakeConfig);
            if (this.$scope.betSize) {
                this.$scope.size = this.$filter('toRateOnly')(this.$scope.betSize);
                this.sendPPLdata();
            }
            if (result && result.stake && result.stake.length > 0) {
                this.$scope.stakeConfig = result;
                if (!this.$scope.betSize && result.defaultStake > 0) {
                    this.$scope.size = result.defaultStake;
                    this.sendPPLdata();
                }

            }
        }

        public initScopeValues(): void {
            if (!this.$scope.minValue) { this.$scope.minValue = 1.01; }
            if (!this.$scope.maxValue) { this.$scope.maxValue = 1000; }
            this.$scope.stakeConfig = { stake: [], defaultStake: 0 };
            this.$scope.placeBetLabel = 0;
            this.getStakeRange();

            this.$scope.confirmBet = this.placeBetDataService.ignoreConfirmation(this.settings.ThemeName) ? false : ((this.localStorageHelper.get(this.settings.ThemeName + '_confirmbet') == undefined) ? true : this.localStorageHelper.get(this.settings.ThemeName + '_confirmbet'));
            this.$scope.valueFocus = 2
            if (this.$scope.betId) { this.$scope.valueFocus = 1; }
            this.$scope.confirmRequired = this.settings.ThemeName == 'lotus';
            this.$scope.disableOdds = this.$scope.canChange == 'false';
        }

        // Price related functions
        private increment(showmsg: boolean = true): any {
            var odds: any = parseFloat(this.$scope.price);
            var interval: any = 0, frm: any = 0, to: any = 0;
            var modulo: any = 0;

            if (this.$scope.ladderType == common.enums.PriceLadderType.Classic) {

                var range = common.helpers.Utility.GetPriceLadderUPRange(odds);
                if (range) {
                    frm = range.min;
                    to = range.max;
                    interval = range.interval;
                }
            }
            else if (this.$scope.ladderType == common.enums.PriceLadderType.Finest) {
                if (odds >= 1.01 && odds <= 1000) {
                    frm = 1.01; to = 1000;
                    interval = 0.01;
                }
            }
            else if (this.$scope.ladderType == common.enums.PriceLadderType.Line_Range) {
                if (this.$scope.minValue <= odds && odds < this.$scope.maxValue) {
                    frm = this.$scope.minValue; to = this.$scope.maxValue;
                    interval = this.$scope.interval;
                }
            }

            if (interval > 0) {
                odds = math.round(odds * 100, 0);
                interval = math.round(interval * 100, 0);
                modulo = math.mod(odds, interval);
                if (modulo > 0 && this.$scope.ladderType != common.enums.PriceLadderType.Line_Range) {
                    if (showmsg) { this.addWarning(frm, to, math.divide(interval, 100)); }
                    interval = math.subtract(interval, modulo);
                }
            }
            return { interval: interval, odds: odds, modulo: modulo };
        }

        private decrement(): any {
            var odds: any = parseFloat(this.$scope.price);
            var interval: any = 0, frm: any = 0, to: any = 0;

            if (this.$scope.ladderType == common.enums.PriceLadderType.Classic) {
                var range = common.helpers.Utility.GetPriceLadderDOWNRange(odds);
                if (range) {
                    frm = range.min;
                    to = range.max;
                    interval = range.interval;
                }
            }
            else if (this.$scope.ladderType == common.enums.PriceLadderType.Finest) {
                if (odds >= 1.01 && odds <= 1000) {
                    frm = 1.01; to = 1000;
                    interval = 0.01;
                }
            }
            else if (this.$scope.ladderType == common.enums.PriceLadderType.Line_Range) {
                if (this.$scope.minValue < odds && odds <= this.$scope.maxValue) {
                    frm = this.$scope.minValue; to = this.$scope.maxValue;
                    interval = this.$scope.interval;
                }
            }

            if (interval > 0) {
                odds = math.round(odds * 100, 0);
                interval = math.round(interval * 100, 0);
                var modulo: any = math.mod(odds, interval);
                if (modulo > 0 && this.$scope.ladderType != common.enums.PriceLadderType.Line_Range) {
                    this.addWarning(frm, to, math.divide(interval, 100));
                    interval = modulo;
                }
            }
            return { interval: interval, odds: odds };
        }

        private addWarning(frm, to, interval): void {
            var msg: string = this.$filter('translate')('common.odds.invalid.message');
            msg = msg.format(frm, to, interval);
            this.toasterService.showToast(helpers.ToastType.Warning, msg, 5000);
        }

        public up(): void {
            var response = this.increment();
            var odds: any = response.odds;
            var interval: any = response.interval;

            if (interval > 0) {
                var addition: any = math.round(math.divide(math.add(odds, interval), 100), 2);
                if (this.$scope.maxValue >= addition) {
                    this.$scope.price = helpers.Utility.isInt(addition) ? parseInt(addition) : addition;
                    this.callValueChanged();
                }
            }
        }

        public down(): void {
            var response = this.decrement();
            var odds: any = response.odds;
            var interval: any = response.interval;
            if (interval > 0) {
                var substraction: any = math.round(math.divide(math.subtract(odds, interval), 100), 2);
                if (this.$scope.minValue <= substraction) {
                    this.$scope.price = helpers.Utility.isInt(substraction) ? parseInt(substraction) : substraction;
                    this.callValueChanged();
                }
            }
        }

        public priceLeave(): void {

            var response = this.increment(false);
            if (response.modulo > 0) {
                this.up();
            }
            this.callValueChanged();
        }

        // Size related functions
        public sizeChanged(): void { this.sendPPLdata(); }

        public downSize(): void {
            if (this.$scope.size) {
                var len = this.$scope.size.toString().length;
                if (len > 2) {
                    var digit = len - 1;
                    var newValue: any = "1";
                    newValue = parseInt(newValue.rpad("0", digit));

                    if (parseInt(this.$scope.size) - newValue <= 0) {
                        if (len > 3) {
                            if (parseInt(this.$scope.size) - (newValue / 10) > 0) {
                                this.$scope.size = parseInt(this.$scope.size) - (newValue / 10);
                            } else {
                                this.$scope.size = this.$scope.stakeConfig.defaultStake;
                            }
                        }
                        else {
                            this.$scope.size = this.$scope.stakeConfig.defaultStake;
                        }
                    }
                    else {
                        this.$scope.size = parseInt(this.$scope.size) - newValue;
                    }
                }
                else {
                    this.$scope.size = parseInt(this.$scope.size) - 10;
                }
            } else {
                this.$scope.size = this.$scope.stakeConfig.defaultStake;
            }
            this.sizeChanged();
        }

        public upSize(): void {
            if (this.$scope.size) {
                var len = this.$scope.size.toString().length;
                if (len > 2) {
                    var digit = len - 1;
                    var newValue = "1";
                    this.$scope.size = parseInt(this.$scope.size) + parseInt(newValue.rpad("0", digit));
                }
                else {
                    this.$scope.size = parseInt(this.$scope.size) + 10;
                }
            } else {
                this.$scope.size = this.$scope.stakeConfig.defaultStake;
            }
            if (this.$scope.size == 0) { this.$scope.size = 10; }
            this.sizeChanged();
        }

        public stakeClick(stake: any, clear: boolean = false): void {
            if (clear) { this.$scope.size = 0; } else {
                this.$scope.size = math.add(this.$scope.size ? this.$scope.size : 0, stake);
            }
            this.sizeChanged();
        }

        // Generic functions
        private callValueChanged(): void {
            //if (!this.$scope.price || this.$scope.price == 0) {
            //    this.$scope.price = 1.01;
            //    if (this.$scope.ladderType == common.enums.PriceLadderType.Line_Range) {
            //        this.$scope.price = this.$scope.minValue;
            //    }
            //}
            this.sendPPLdata();
        }

        private sendPPLdata(): void {
            var forPPL = {
                marketId: this.$scope.marketId,
                runnerId: this.$scope.runnerId,
                price: this.$scope.price,
                size: this.$scope.size ? this.$scope.size : 0,
                side: this.$scope.side,
                sectionId: this.$scope.sectionId,
            };

            if (this.$scope.bettingType == common.enums.BettingType.SESSION || this.$scope.bettingType == common.enums.BettingType.LINE) {
                if (this.$scope.side == 1) {
                    this.$scope.placeBetLabel = math.round(((forPPL.size * this.$scope.percentage) / 100), 2);
                }
                else {
                    this.$scope.placeBetLabel = forPPL.size * -1;
                }
            }
            else if (this.$scope.bettingType == common.enums.BettingType.SCORE_RANGE) {
                this.$scope.placeBetLabel = forPPL.size;
            }
            else if (this.$scope.bettingType == common.enums.BettingType.ASIAN_HANDICAP_SINGLE_LINE) {
                if (this.$scope.side == 1) {
                    this.$scope.placeBetLabel = forPPL.size * -1;
                }
                else {
                    var calc = math.round(math.multiply(math.subtract(this.$scope.price, 1), forPPL.size), 2);
                    this.$scope.placeBetLabel = forPPL.size;
                }
            }
            else {
                var calc = math.round(math.multiply(math.subtract(this.$scope.price, 1), forPPL.size), 2);
                this.$scope.placeBetLabel = (this.$scope.side == 1 ? calc : math.multiply(calc, -1));
            }

            this.placeBetDataService.pushPPL(forPPL);
            this.$rootScope.$broadcast("catch-for-ppl");
        }

        private cancelInlineBet(): void {
            if (this.$scope.removeInlineBet) { this.$scope.removeInlineBet(); }
        }

        private submitBet(): void {
            if (this.$scope.isMobile == true && this.$scope.confirmBet == true) {

                // confirm bet before placing
                var modal = new common.helpers.CreateModal();
                modal.header = 'confirm.bet.modal.header';
                modal.data = {
                    price: this.$scope.price,
                    side: this.$scope.side,
                    size: this.$scope.size,
                    eventName: this.$scope.eventName,
                    marketName: this.$scope.marketName,
                    runnerName: this.$scope.runnerName,
                    pl: this.$scope.placeBetLabel
                }

                if (this.settings.ThemeName == 'lotus') {
                    modal.options.actionButton = '';
                    modal.options.closeButton = '';
                    modal.bodyUrl = 'app/common/components/inline-bet/confirm-bet-modal-lotus.html';
                }
                else {
                    modal.options.actionButton = 'Place Bet';
                    modal.bodyUrl = 'app/common/components/inline-bet/confirm-bet-modal.html';
                }

                modal.controller = 'confirmBetCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.processBet();
                    }
                });

            } else {
                this.processBet();
            }
        }

        private processBet(): void {
            var model = {
                marketId: this.$scope.marketId,
                runnerId: this.$scope.runnerId,
                price: this.$scope.price,
                size: this.$scope.size,
                side: this.$scope.side,
                percentage: this.$scope.percentage,
                betFrom: common.enums.BetFrom.Inline,
                sectionId: this.$scope.sectionId
            };
            this.$scope.animateLoader = true;
            this.playLottie();
            this.$rootScope.$emit('place-bet-started', { marketId: model.marketId, eventTypeId: this.$scope.eventTypeId, bettingType: this.$scope.bettingType, betDelay: this.$scope.betDelay });
            this.betService.placeBet(model)
                .success((response: common.messaging.IResponse<any>) => {
                    this.betMessage(model, response);
                }).finally(() => {
                    this.$rootScope.$emit('place-bet-ended', { marketId: model.marketId });
                    this.$scope.animateLoader = false;
                });
        }

        private updateBet(): void {
            if (this.$scope.isMobile == true && this.$scope.confirmBet == true) {

                // confirm bet before placing
                var modal = new common.helpers.CreateModal();
                modal.header = 'confirm.bet.modal.header';
                modal.data = {
                    price: this.$scope.price,
                    side: this.$scope.side,
                    size: this.$scope.size,
                    eventName: this.$scope.eventName,
                    marketName: this.$scope.marketName,
                    runnerName: this.$scope.runnerName,
                    betFrom: common.enums.BetFrom.Inline,
                    pl: this.$scope.placeBetLabel
                }
                modal.options.actionButton = 'Place Bet';
                modal.bodyUrl = 'app/common/components/inline-bet/confirm-bet-modal.html';
                modal.controller = 'confirmBetCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.processUpdateBet();
                    }
                });

            } else {
                this.processUpdateBet();
            }
        }

        private processUpdateBet(): void {
            var model = { betId: this.$scope.betId, price: this.$scope.price, betFrom: common.enums.BetFrom.Inline };
            this.$rootScope.$emit('place-bet-started', { marketId: this.$scope.marketId, eventTypeId: this.$scope.eventTypeId, bettingType: this.$scope.bettingType, betDelay: this.$scope.betDelay });
            this.betService.updateBet(model)
                .success((response: common.messaging.IResponse<any>) => {
                    this.betMessage(model, response);
                }).finally(() => { this.$rootScope.$emit('place-bet-ended', { marketId: this.$scope.marketId }); });
        }

        private betMessage(model: any, response: common.messaging.IResponse<any>): void {
            if (response.success) {
                if (response.data) {
                    var bet = response.data;
                    if (bet.orderStatus) {
                        this.cancelInlineBet();
                        if (bet.sizeRemaining > 0) {
                            var matched = this.$filter('toRate')(bet.sizeMatched);
                            var remaining = this.$filter('toRate')(bet.sizeRemaining);
                            var unMatchmsg = "Bet Unmatched. {0} - {1} - {2} at odds {3}"
                            unMatchmsg = unMatchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), this.$scope.runnerName, remaining, bet.avgPrice);
                            this.toasterService.showToastMessage(common.helpers.ToastType.Success, unMatchmsg, 5000);
                        }
                        else {
                            var matched = this.$filter('toRate')(bet.sizeMatched);
                            var placed = this.$filter('toRate')(model.size);
                            var Matchmsg = this.$filter('translate')('bet.matched.message');
                            Matchmsg = Matchmsg.format((model.side == 1 ? 'BACK' : 'LAY'), this.$scope.runnerName, placed, model.price, matched, bet.avgPrice);
                            this.toasterService.showToastMessage(common.helpers.ToastType.Success, Matchmsg, 5000);
                        }
                        this.$rootScope.$broadcast('bet-submitted', { marketId: response.data.bet.marketId });
                    } else {
                        var msg: string = bet.message.format('', '');
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

        private confirmBetOptionChanged(): void {
            this.localStorageHelper.set(this.settings.ThemeName + '_confirmbet', this.$scope.confirmBet);
        }

        // number keypad
        private numberClick(number: any): void {
            if (this.$scope.valueFocus == 1) {
                if (number == '.') {
                    if (this.$scope.price && this.$scope.price.toString().length > 0 && this.$scope.price.toString().indexOf('.') < 0) {
                        this.$scope.price = this.$scope.price.toString() + number;
                    }
                }
                else {
                    if (this.$scope.price) {
                        this.$scope.price = this.$scope.price.toString() + number;
                    } else {
                        this.$scope.price = number;
                    }
                    this.priceLeave();
                }
            } else {
                if (number == '.') {
                    if (this.$scope.size != undefined && this.$scope.size.toString().length > 0 && this.$scope.size.toString().indexOf('.') < 0) {
                        this.$scope.size = this.$scope.size.toString() + number;
                    }
                }
                else {
                    if (this.$scope.size) {
                        this.$scope.size = this.$scope.size.toString() + number;
                    } else {
                        this.$scope.size = number;
                    }
                    this.sizeChanged();
                }
            }
        }

        private backSpace(): void {
            if (this.$scope.valueFocus == 1) {
                if (this.$scope.price) {
                    this.$scope.price = this.$scope.price.toString().slice(0, this.$scope.price.toString().length - 1);
                }
                this.priceLeave();
            } else {
                if (this.$scope.size) {
                    this.$scope.size = this.$scope.size.toString().slice(0, this.$scope.size.toString().length - 1);
                }
                this.sizeChanged();
            }
        }

        private playLottie() {
            if (this.settings.ThemeName == 'sports') {
                var animation = bodymovin.loadAnimation({
                    animationData: common.helpers.CommonHelper.GetBetLoadingJson(),
                    container: document.getElementById('bet-loading'), // required
                    // path: 'data.json', // required
                    renderer: 'svg', // required
                    loop: true, // optional
                    autoplay: true, // optional
                    name: "Demo Animation", // optional
                });
            }
        }
    }

    angular.module('kt.components')
        .controller('KTInlineBetController', KTInlineBetController);

    angular.module('kt.components')
        .directive('ktInlineBet', (settings: common.IBaseSettings) => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    marketId: '@',
                    runnerId: '@',
                    min: '@?',
                    max: '@?',
                    interval: '@?',
                    ladderType: '@',
                    price: '@',
                    side: '@',
                    percentage: '@?',
                    removeInlineBet: '&',
                    bettingType: '@',
                    gameType: '@?',
                    eventName: '@?',
                    marketName: '@?',
                    runnerName: '@?',
                    eventTypeId: '@?',
                    betId: '@?',
                    betSize: '@?',
                    sectionId: '@?',
                    canChange: '@?',
                    maxBet: '@?',
                    minBet: '@?',
                    betDelay: '@?',
                    temporaryStatus: '@?',
                    maxProfit: '@?'
                },
                controller: 'KTInlineBetController',
                templateUrl: ((element, attrs) => {
                    if (attrs.mobile) {
                        if (settings.ThemeName == 'lotus') {
                            return 'app/common/components/inline-bet/inline-bet-mini-lotus.html'
                        }
                        else if (settings.ThemeName == 'bking') {
                            return 'app/common/components/inline-bet/inline-bet-mini-bking.html'
                        }
                        else if (settings.ThemeName == 'sports') {
                            return 'app/common/components/inline-bet/inline-bet-sports.html'
                        }
                        else {
                            return 'app/common/components/inline-bet/inline-bet-mini.html'
                        }
                    }
                    else if (settings.ThemeName == 'sports') {
                        return 'app/common/components/inline-bet/inline-bet-sports.html'
                    }
                    else {
                        return 'app/common/components/inline-bet/inline-bet.html'
                    }
                }),
                compile: (elem, attr: any) => {
                    return {
                        pre: (scope: IKTInlineBetScope, element, attrs) => {
                            if (attrs.mobile) { scope.isMobile = true; }
                            if (attrs.min) { scope.minValue = parseFloat(attrs.min); }
                            if (attrs.max) { scope.maxValue = parseFloat(attrs.max); }
                            if (attrs.maxProfit) { scope.maxProfit = parseFloat(attrs.maxProfit); }
                            // if (scope.ladderType == common.enums.PriceLadderType.Line_Range && !attrs.price) {
                            //scope.price = scope.minValue;
                            // }
                        },
                        post: (scope: IKTInlineBetScope, element, attrs: any) => {

                        }
                    };
                }
            };
        });

    angular.module('kt.components')
        .directive('stringToNumber', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel: any) {
                    ngModel.$parsers.push(function (value) {
                        return '' + value;
                    });
                    ngModel.$formatters.push(function (value) {
                        return parseFloat(value);
                    });
                }
            };
        });
}