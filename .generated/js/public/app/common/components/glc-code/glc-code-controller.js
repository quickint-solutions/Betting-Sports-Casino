var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTGlcCodeController extends common.ControllerBase {
                constructor($scope, settings) {
                    super($scope);
                    this.$scope.convertValue = true;
                    if ((settings.ThemeName != 'lotus' || settings.WebApp == 'gameok' || settings.WebApp == 'gameokin') && settings.ThemeName != 'dimd2') {
                        this.$scope.currencyCode = settings.CurrencyCode;
                    }
                    this.$scope.currencyFraction = settings.CurrencyFraction;
                    this.$scope.special = 'false';
                }
            }
            angular.module('kt.components')
                .controller('KTGlcCodeController', KTGlcCodeController);
            angular.module('kt.components')
                .directive('ktGlcCode', () => {
                return {
                    restrict: 'EA',
                    replace: true,
                    scope: {
                        item: '@?',
                        convertValue: '@?',
                        special: '@?'
                    },
                    templateUrl: 'app/common/components/glc-code/glc-code.html',
                    controller: 'KTGlcCodeController'
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=glc-code-controller.js.map