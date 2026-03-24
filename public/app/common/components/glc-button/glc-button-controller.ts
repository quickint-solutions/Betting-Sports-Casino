namespace intranet.common.directives {

    export interface IGlcButtonScope
        extends intranet.common.IScopeBase {
        action: () => void;
        btnClass: string;
        disabled: boolean;
        icon: string;
        label: string;
        execAction: () => void;

        spinnerImg: any;
        promiseTracker: any;
    }
    class GLCButtonController
        extends intranet.common.ControllerBase<IGlcButtonScope> {
        /* @ngInject */
        constructor($scope: IGlcButtonScope,
            private commonDataService: services.CommonDataService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                compile: (elem, attr: any) => {
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