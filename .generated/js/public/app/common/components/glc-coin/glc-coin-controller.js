var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTGlcCoinController extends common.ControllerBase {
                constructor($scope, settings) {
                    super($scope);
                    this.$scope.showSize = 'true';
                    this.$scope.isBm = 'false';
                    super.init(this);
                }
                initScopeValues() {
                }
            }
            angular.module('kt.components')
                .controller('KTGlcCoinController', KTGlcCoinController);
            angular.module('kt.components')
                .directive('ktGlc', (settings) => {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        item: '=?',
                        showSize: '@?',
                        isBm: '@?'
                    },
                    templateUrl: settings.ThemeName.toLowerCase() == 'betfair' ?
                        'app/common/components/glc-coin/glc-coin-betfair.html'
                        : (settings.ThemeName.toLowerCase() == 'bking'
                            ? 'app/common/components/glc-coin/glc-coin-bking.html'
                            : (settings.ThemeName == 'sports' ?
                                'app/common/components/glc-coin/glc-coin-sports.html' :
                                (settings.ThemeName == 'dimd2' ? 'app/common/components/glc-coin/glc-dimd2.html' : 'app/common/components/glc-coin/glc-coin.html'))),
                    controller: 'KTGlcCoinController',
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=glc-coin-controller.js.map