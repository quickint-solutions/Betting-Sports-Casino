namespace intranet.common.directives {
    export interface IToolbarButtonScope extends ng.IScope {
        state: string;
        btnClass: string;
        hasPermission: boolean;
        setState: () => void;
        action: () => void;
        label: string;
    }

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
                link: (scope: IToolbarButtonScope, element, attrs, toolbarController) => {
                    scope.setState = () => {
                        if (scope.action) {
                            scope.$parent.$eval(scope.action);
                        }
                    };
                }
            };
        });
}