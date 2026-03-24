namespace intranet.common.directives {

    export interface IKTTokenAddressScope extends common.IScopeBase {
        address: string;
        char: any;
        result: any;
    }

    class KTTokenAddressController extends ControllerBase<IKTTokenAddressScope>
    {
        constructor($scope: IKTTokenAddressScope,
            settings: common.IBaseSettings) {
            super($scope);

            var watched = this.$scope.$watch('address', (n: any, old: any) => {
                if (n != old) {
                    this.changed();
                }
            });

            this.$scope.$on('$destroy', () => {
                watched();
            });

        }

        private changed() {
            this.$scope.result = {};
            if (this.$scope.char.length <= 0) { this.$scope.char = 4; }
            if (this.$scope.address && this.$scope.address.length > 0) {
                this.$scope.result.f = this.$scope.address.substr(0, this.$scope.char);
                this.$scope.result.c = this.$scope.address.substr(this.$scope.char, (this.$scope.address.length - (this.$scope.char * 2)));
                this.$scope.result.e = this.$scope.address.substr((this.$scope.address.length - this.$scope.char), this.$scope.char);
            }
        }
    }

    angular.module('kt.components')
        .controller('KTTokenAddressController', KTTokenAddressController);

    angular.module('kt.components')
        .directive('ktAddress', () => {
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    address: '=',
                    char: '@?'
                },
                templateUrl: 'app/common/components/token-address/token-address.html',
                controller: 'KTTokenAddressController'
            };
        });
}