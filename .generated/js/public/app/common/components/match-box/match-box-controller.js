var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTMatchController extends common.ControllerBase {
                constructor($scope) {
                    super($scope);
                    this.init(this);
                }
                initScopeValues() {
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
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=match-box-controller.js.map