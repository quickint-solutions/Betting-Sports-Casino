var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTPriceLadderController extends common.ControllerBase {
                constructor($scope, $timeout, toasterService, settings, $filter) {
                    super($scope);
                    this.$timeout = $timeout;
                    this.toasterService = toasterService;
                    this.settings = settings;
                    this.$filter = $filter;
                    super.init(this);
                }
                initScopeValues() {
                    if (!this.$scope.minValue) {
                        this.$scope.minValue = 1.01;
                    }
                    if (!this.$scope.maxValue) {
                        this.$scope.maxValue = 1000;
                    }
                    this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
                }
                increment(showmsg = true) {
                    var odds = parseFloat(this.$scope.value);
                    var interval = 0, frm = 0, to = 0;
                    var modulo = 0;
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
                            frm = 1.01;
                            to = 1000;
                            interval = 0.01;
                        }
                    }
                    else if (this.$scope.ladderType == common.enums.PriceLadderType.Line_Range) {
                        if (this.$scope.minValue <= odds && odds < this.$scope.maxValue) {
                            frm = this.$scope.minValue;
                            to = this.$scope.maxValue;
                            interval = this.$scope.interval;
                        }
                    }
                    if (interval > 0) {
                        odds = math.round(odds * 100, 0);
                        interval = math.round(interval * 100, 0);
                        modulo = math.mod(odds, interval);
                        if (modulo > 0 && this.$scope.ladderType != common.enums.PriceLadderType.Line_Range) {
                            this.addWarning(frm, to, math.divide(interval, 100), showmsg);
                            interval = math.subtract(interval, modulo);
                        }
                        else {
                            this.removeOldWarnings();
                        }
                    }
                    return { interval: interval, odds: odds, modulo: modulo };
                }
                decrement() {
                    var odds = parseFloat(this.$scope.value);
                    var interval = 0, frm = 0, to = 0;
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
                            frm = 1.01;
                            to = 1000;
                            interval = 0.01;
                        }
                    }
                    else if (this.$scope.ladderType == common.enums.PriceLadderType.Line_Range) {
                        if (this.$scope.minValue < odds && odds <= this.$scope.maxValue) {
                            frm = this.$scope.minValue;
                            to = this.$scope.maxValue;
                            interval = this.$scope.interval;
                        }
                    }
                    if (interval > 0) {
                        odds = math.round(odds * 100, 0);
                        interval = math.round(interval * 100, 0);
                        var modulo = math.mod(odds, interval);
                        if (modulo > 0 && this.$scope.ladderType != common.enums.PriceLadderType.Line_Range) {
                            this.addWarning(frm, to, math.divide(interval, 100));
                            interval = modulo;
                        }
                        else {
                            this.removeOldWarnings();
                        }
                    }
                    return { interval: interval, odds: odds };
                }
                addWarning(frm, to, interval, showmsg = true) {
                    if (this.$scope.showToast && showmsg) {
                        var msg = this.$filter('translate')('common.odds.invalid.message');
                        msg = msg.format(frm, to, interval);
                        this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg, 3000);
                    }
                    else if (this.$scope.messages) {
                        this.removeOldWarnings();
                        var msg = this.$filter('translate')('common.odds.invalid.message');
                        msg = msg.format(frm, to, interval);
                        this.$scope.messages.push(new common.messaging.ResponseMessage(common.messaging.ResponseMessageType.Warning, msg, 'odds_warning'));
                    }
                }
                removeOldWarnings() {
                    if (this.$scope.messages) {
                        var filtered = [];
                        this.$scope.messages.forEach((v, i) => {
                            if (v.propertyPath == 'odds_warning') {
                                filtered.push(i);
                            }
                        });
                        filtered.forEach((index) => { this.$scope.messages.splice(index); });
                    }
                }
                up() {
                    var response = this.increment();
                    var odds = response.odds;
                    var interval = response.interval;
                    if (interval > 0) {
                        var addition = math.round(math.divide(math.add(odds, interval), 100), 2);
                        if (this.$scope.maxValue >= addition) {
                            this.$scope.value = common.helpers.Utility.isInt(addition) ? parseInt(addition) : addition;
                            this.callValueChanged();
                        }
                    }
                }
                down() {
                    var response = this.decrement();
                    var odds = response.odds;
                    var interval = response.interval;
                    if (interval > 0) {
                        var substraction = math.round(math.divide(math.subtract(odds, interval), 100), 2);
                        if (this.$scope.minValue <= substraction) {
                            this.$scope.value = common.helpers.Utility.isInt(substraction) ? parseInt(substraction) : substraction;
                            this.callValueChanged();
                        }
                    }
                }
                focused() {
                    if (this.$scope.onFocus) {
                        this.$scope.onFocus();
                    }
                }
                onLeave() {
                    var response = this.increment(false);
                    if (response.modulo > 0) {
                        this.up();
                    }
                    this.callValueChanged();
                }
                callValueChanged() {
                    if (this.$scope.valueChanged) {
                        this.$timeout(() => { this.$scope.valueChanged({ newvalue: this.$scope.value }), 1000; });
                    }
                }
            }
            angular.module('kt.components')
                .controller('KTPriceLadderController', KTPriceLadderController);
            angular.module('kt.components')
                .directive('ktPriceLadder', (settings) => {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        onFocus: '&?',
                        min: '@?',
                        max: '@?',
                        interval: '@?',
                        ladderType: '@',
                        value: '=',
                        valueChanged: '&?',
                        messages: '=?',
                        disable: '=?',
                        showToast: '@?',
                        disableArrow: '@?'
                    },
                    controller: 'KTPriceLadderController',
                    templateUrl: settings.ThemeName == 'bking' ?
                        'app/common/components/price-ladder/priceladder-bking.html' :
                        (settings.ThemeName == 'betfair' ? 'app/common/components/price-ladder/priceladder-betfair.html' :
                            (settings.ThemeName == 'dimd2' ? 'app/common/components/price-ladder/priceladder-dimd2.html'
                                : 'app/common/components/price-ladder/priceladder.html')),
                    compile: (elem, attr) => {
                        return {
                            pre: (scope, element, attrs) => {
                                if (attrs.min) {
                                    scope.minValue = parseFloat(attrs.min);
                                }
                                if (attrs.max) {
                                    scope.maxValue = parseFloat(attrs.max);
                                }
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
//# sourceMappingURL=price-ladder-controller.js.map