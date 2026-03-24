var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTButtonController extends intranet.common.ControllerBase {
                constructor($scope) {
                    super($scope);
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.btnClass = '';
                    this.$scope.label = '';
                }
            }
            angular
                .module('kt.components')
                .controller('KTButtonController', KTButtonController)
                .directive('ktButton', () => {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        action: '&',
                        btnClass: '@?',
                        disabled: '=?',
                        label: '@'
                    },
                    controller: 'KTButtonController',
                    templateUrl: 'app/common/components/button/button.html',
                    compile: (elem, attr) => {
                        if (attr.icon) {
                            elem.find('.icon-placeholder')
                                .addClass('fa')
                                .addClass('fa-' + attr.icon)
                                .removeClass('icon-placeholder');
                        }
                        else {
                            elem.find('.icon-placeholder').remove();
                        }
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
//# sourceMappingURL=button-controller.js.map