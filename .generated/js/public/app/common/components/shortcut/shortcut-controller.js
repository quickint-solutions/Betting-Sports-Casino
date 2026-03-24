var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTShortcutController extends intranet.common.ControllerBase {
                constructor($scope) {
                    super($scope);
                }
            }
            angular.module('kt.components')
                .controller('KTShortcutController', KTShortcutController)
                .directive('ktShortcut', () => {
                return {
                    restrict: 'A',
                    scope: {
                        keyPressed: '&?',
                    },
                    controller: 'KTShortcutController',
                    link: (scope, iElement, iAttrs) => {
                        jQuery(document).on('keyup', function (e) {
                            scope.$apply(scope.keyPressed({ e: e }));
                        });
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=shortcut-controller.js.map