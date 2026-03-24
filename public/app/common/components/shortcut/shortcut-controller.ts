namespace intranet.common.directives {
    export interface IShortcutScope
        extends intranet.common.IScopeBase {
        keyPressed: any;
    }

    class KTShortcutController extends intranet.common.ControllerBase<IShortcutScope> {

        /* @ngInject */
        constructor($scope: IShortcutScope) {
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
                link: (scope: IShortcutScope, iElement, iAttrs) => {
                    jQuery(document).on('keyup', function (e) {
                        scope.$apply(scope.keyPressed({ e: e }));
                    });
                }
            };
        });
}