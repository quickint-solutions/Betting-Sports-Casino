namespace intranet.common.directives {

    export interface IButtonScope
        extends intranet.common.IScopeBase {
        action: () => void;
        btnClass: string;
        disabled: boolean;
        icon: string;
        label: string;
        execAction: () => void;
    }
    class KTButtonController
        extends intranet.common.ControllerBase<IButtonScope> {
        /* @ngInject */
        constructor($scope: IButtonScope) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                compile: (elem, attr: any) => {
                    if (attr.icon) {
                        elem.find('.icon-placeholder')
                            .addClass('fa')
                            .addClass('fa-' + attr.icon)
                            .removeClass('icon-placeholder');
                    } else {
                        elem.find('.icon-placeholder').remove();
                    }

                    return {
                        pre: (scope, element, attrs) => {
                        },
                        post: (scope: any, element, attrs) => {
                            scope.execAction = () => {
                                if (scope.action) {
                                    //Only execute the action if the button is not disabled
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

}