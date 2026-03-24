var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class GLCButtonController extends intranet.common.ControllerBase {
                constructor($scope, commonDataService) {
                    super($scope);
                    this.commonDataService = commonDataService;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.btnClass = '';
                    this.$scope.label = '';
                    this.$scope.promiseTracker = this.commonDataService.commonPromiseTracker;
                    this.$scope.spinnerImg = this.commonDataService.spinnerImg;
                }
            }
            angular
                .module('kt.components')
                .controller('GLCButtonController', GLCButtonController)
                .directive('glcButton', () => {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        action: '&',
                        btnClass: '@?',
                        label: '@'
                    },
                    controller: 'GLCButtonController',
                    templateUrl: 'app/common/components/glc-button/glc-button.html',
                    compile: (elem, attr) => {
                        return {
                            pre: (scope, element, attrs) => {
                            },
                            post: (scope, element, attrs) => {
                                scope.execAction = () => {
                                    if (scope.action) {
                                        if (!scope.disabled || scope.disabled === false) {
                                            scope.action();
                                        }
                                    }
                                };
                            }
                        };
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=glc-button-controller.js.map