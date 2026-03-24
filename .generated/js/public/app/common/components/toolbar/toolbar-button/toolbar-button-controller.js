var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            angular.module('kt.components')
                .directive('ktToolbarButton', ($parse) => {
                return {
                    require: '^ktToolbar',
                    restrict: 'EA',
                    replace: false,
                    scope: {
                        btnClass: '@?',
                        icon: '@',
                        label: '@',
                        action: '@',
                        hasPermission: '=?'
                    },
                    templateUrl: 'app/common/components/toolbar/toolbar-button/toolbar-button.html',
                    link: (scope, element, attrs, toolbarController) => {
                        scope.setState = () => {
                            if (scope.action) {
                                scope.$parent.$eval(scope.action);
                            }
                        };
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=toolbar-button-controller.js.map