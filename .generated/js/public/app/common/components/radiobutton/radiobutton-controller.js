var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTRadiobuttonController extends common.ControllerBase {
                constructor($scope) {
                    super($scope);
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.paramName = 'id';
                }
                update(item, id) {
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
                        optionlist: '=',
                        paramName: '@?',
                        item: '=',
                        disableBy: '@',
                        disableNow: '@',
                        updateValue: '@?',
                        tabIndex: '@?'
                    },
                    controller: 'KTRadiobuttonController',
                    templateUrl: 'app/common/components/radiobutton/radiobutton.html',
                    link: (scope, elem, attr) => {
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=radiobutton-controller.js.map