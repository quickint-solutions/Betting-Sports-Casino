namespace intranet.common.directives {
    class KTRadiobuttonController
        extends common.ControllerBase<IKTRadiobuttonScope> {
        /* @ngInject */
        constructor($scope: IKTRadiobuttonScope) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            // attributes
            this.$scope.paramName = 'id';
        }

        public update(item, id) {
            if (this.$scope.updateValue) {
                this.$scope.item[this.$scope.paramName] = id;
            }

            if (this.$scope.notifyOnUpdate) {
                this.$scope.notifyOnUpdate({ selectedId: id });
            }
        }
    }

    angular.module('kt.components')
        .controller('KTRadiobuttonController', KTRadiobuttonController);

    angular.module('kt.components')
        .directive('ktRadiobutton', () => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    charLimit: '@',
                    notifyOnUpdate: '&?',
                    optionlist: '=', // array of options
                    paramName: '@?', // param name like id
                    item: '=', // last selected item
                    disableBy: '@',
                    disableNow: '@',
                    updateValue: '@?',
                    tabIndex: '@?'
                },
                controller: 'KTRadiobuttonController',
                templateUrl: 'app/common/components/radiobutton/radiobutton.html',
                link: (scope: IKTRadiobuttonScope, elem, attr: any) => {
                }
            };
        });

}
