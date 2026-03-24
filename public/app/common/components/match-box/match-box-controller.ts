namespace intranet.common.directives {
    class KTMatchController extends ControllerBase<IKTMatchBoxScope>{
        constructor($scope: IKTMatchBoxScope) {
            super($scope);
            this.init(this);
        }

        private initScopeValues() {
            if (this.$scope.refreshFunction) {

            }
        }

    }

    angular.module('kt.components').controller('KTMatchController', KTMatchController);

    angular.module('kt.components')
        .directive('ktMatchBox', () => {
            return {
                templateUrl: 'app/common/components/match-box/matchbox.html',
                controller: 'KTMatchController',
                scope: {
                    item: '=',
                    refreshFunction: '&?',
                },
                restrict: 'E',
                replace: true
            };
        });
}