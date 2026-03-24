var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTOdometerController extends intranet.common.ControllerBase {
                constructor($scope) {
                    super($scope);
                    this.$scope.$watch('value', (newVal) => {
                        this.$scope.myOdometer.update(newVal);
                    });
                }
            }
            angular.module('kt.components')
                .controller('KTOdometerController', KTOdometerController)
                .directive('ktOdometer', () => {
                return {
                    restrict: 'AE',
                    scope: {
                        value: '@'
                    },
                    controller: 'KTOdometerController',
                    link: function (scope, elm, attrs) {
                        var odometer, opts, odometerOptions;
                        odometerOptions = { duration: 1000, theme: 'minimal' };
                        opts = scope.$eval(attrs.odometerOptions) || {};
                        angular.extend(opts, odometerOptions);
                        opts.el = elm[0];
                        odometer = new Odometer(opts);
                        scope.myOdometer = odometer;
                    }
                };
            });
            angular.module('kt.components')
                .controller('KTOdometerController', KTOdometerController)
                .directive('iframeOnload', () => {
                return {
                    restrict: 'AE',
                    scope: {},
                    link: function (scope, element, attrs) {
                        element.on('load', function () {
                            console.log('load found');
                        });
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=odometer-controller.js.map