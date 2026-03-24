namespace intranet.common.directives {

    export interface IKTPriceLadderScope
        extends common.IScopeBase {
        // attributes
        onFocus: any;
        minValue: number;
        maxValue: number;
        interval: number;
        ladderType: number;
        value: any;
        valueChanged: any;
        messages: any[];
        showToast: string;
        disableArrow: boolean;

        webImagePath: any;
    }

    class KTPriceLadderController
        extends common.ControllerBase<IKTPriceLadderScope> {
        /* @ngInject */
        constructor($scope: IKTPriceLadderScope,
            private $timeout: any,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings,
            private $filter: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            if (!this.$scope.minValue) { this.$scope.minValue = 1.01; }
            if (!this.$scope.maxValue) { this.$scope.maxValue = 1000; }
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
        }

        private increment(showmsg: boolean = true): any {
            var odds: any = parseFloat(this.$scope.value);
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
                    this.addWarning(frm, to, math.divide(interval, 100), showmsg);
                    interval = math.subtract(interval, modulo);
                } else { this.removeOldWarnings(); }
            }
            return { interval: interval, odds: odds, modulo: modulo };
        }

        private decrement(): any {
            var odds: any = parseFloat(this.$scope.value);
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
                } else { this.removeOldWarnings(); }
            }
            return { interval: interval, odds: odds };
        }

        private addWarning(frm, to, interval, showmsg: boolean = true): void {
            if (this.$scope.showToast && showmsg) {
                var msg: string = this.$filter('translate')('common.odds.invalid.message');
                msg = msg.format(frm, to, interval);
                this.toasterService.showToastMessage(helpers.ToastType.Error, msg, 3000);
            }
            else if (this.$scope.messages) {
                this.removeOldWarnings();
                var msg: string = this.$filter('translate')('common.odds.invalid.message');
                msg = msg.format(frm, to, interval);
                this.$scope.messages.push(new common.messaging.ResponseMessage(
                    messaging.ResponseMessageType.Warning,
                    msg, 'odds_warning'));
            }
        }

        private removeOldWarnings(): void {
            if (this.$scope.messages) {
                var filtered: any[] = [];
                this.$scope.messages.forEach((v: common.messaging.ResponseMessage, i: any) => {
                    if (v.propertyPath == 'odds_warning') { filtered.push(i); }
                });
                filtered.forEach((index: any) => { this.$scope.messages.splice(index); });
            }
        }


        // handle on UP click
        public up(): void {
            var response = this.increment();
            var odds: any = response.odds;
            var interval: any = response.interval;

            if (interval > 0) {
                var addition: any = math.round(math.divide(math.add(odds, interval), 100), 2);
                if (this.$scope.maxValue >= addition) {
                    this.$scope.value = helpers.Utility.isInt(addition) ? parseInt(addition) : addition;
                    this.callValueChanged();
                }
            }
        }

        // handle on DOWN click 
        public down(): void {
            var response = this.decrement();
            var odds: any = response.odds;
            var interval: any = response.interval;
            if (interval > 0) {
                var substraction: any = math.round(math.divide(math.subtract(odds, interval), 100), 2);
                if (this.$scope.minValue <= substraction) {
                    this.$scope.value = helpers.Utility.isInt(substraction) ? parseInt(substraction) : substraction;
                    this.callValueChanged();
                }
            }
        }

        // callback for on focus
        public focused() {
            if (this.$scope.onFocus) {
                this.$scope.onFocus();
            }
        }

        // callback for on blur
        public onLeave(): void {
            var response = this.increment(false);
            if (response.modulo > 0) {
                this.up();
            }
            this.callValueChanged();
        }

        private callValueChanged(): void {
            //if (!this.$scope.value || this.$scope.value == 0) {
            //    this.$scope.value = 1.01;
            //    if (this.$scope.ladderType == common.enums.PriceLadderType.Line_Range) {
            //        this.$scope.value = this.$scope.minValue;
            //    }
            //}
            if (this.$scope.valueChanged) {
                this.$timeout(() => { this.$scope.valueChanged({ newvalue: this.$scope.value }), 1000 });
            }
        }
    }

    angular.module('kt.components')
        .controller('KTPriceLadderController', KTPriceLadderController);

    angular.module('kt.components')
        .directive('ktPriceLadder', (settings: common.IBaseSettings) => {
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
                            : 'app/common/components/price-ladder/priceladder.html'))
                ,
                compile: (elem, attr: any) => {
                    return {
                        pre: (scope: IKTPriceLadderScope, element, attrs) => {
                            if (attrs.min) { scope.minValue = parseFloat(attrs.min); }
                            if (attrs.max) { scope.maxValue = parseFloat(attrs.max); }
                            //if (scope.ladderType == common.enums.PriceLadderType.Line_Range && !attrs.value) {
                            //    scope.value = scope.minValue;
                            //}
                        },
                        post: (scope: IKTPriceLadderScope, element, attrs: any) => {

                        }
                    };
                }
            };
        });
}