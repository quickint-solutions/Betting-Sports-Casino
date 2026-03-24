var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTChartController extends common.ControllerBase {
                constructor($scope) {
                    super($scope);
                    super.init(this);
                }
                initScopeValues() {
                    var myChart = Highcharts.chart(this.$scope.chartId.toString(), this.$scope.options);
                }
            }
            angular.module('kt.components')
                .controller('KTChartController', KTChartController);
            angular.module('kt.components')
                .directive('ktChart', () => {
                return {
                    restrict: 'A',
                    scope: {
                        chartId: '@?',
                        options: '='
                    },
                    controller: 'KTChartController',
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=chart-controller.js.map