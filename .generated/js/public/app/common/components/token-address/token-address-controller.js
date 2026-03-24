var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTTokenAddressController extends common.ControllerBase {
                constructor($scope, settings) {
                    super($scope);
                    var watched = this.$scope.$watch('address', (n, old) => {
                        if (n != old) {
                            this.changed();
                        }
                    });
                    this.$scope.$on('$destroy', () => {
                        watched();
                    });
                }
                changed() {
                    this.$scope.result = {};
                    if (this.$scope.char.length <= 0) {
                        this.$scope.char = 4;
                    }
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
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=token-address-controller.js.map