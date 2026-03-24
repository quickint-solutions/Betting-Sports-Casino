var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTDateController extends common.ControllerBase {
                constructor($scope, $rootScope, $filter, settings) {
                    super($scope);
                    this.$rootScope = $rootScope;
                    this.$filter = $filter;
                    this.formatDate();
                    this.$rootScope.$watch("timezone", () => {
                        this.$scope.timezone = this.$rootScope.timezone;
                        this.formatDate();
                    });
                    this.$scope.$watch("dateValue", () => {
                        this.formatDate();
                    });
                }
                formatDate() {
                    if (this.$scope.format) {
                        if (this.$scope.timezone)
                            this.$scope.destValue = this.$filter('date')(this.$scope.dateValue, this.$scope.format, this.$scope.timezone);
                        else
                            this.$scope.destValue = this.$filter('date')(this.$scope.dateValue, this.$scope.format);
                    }
                    else if (this.$scope.momentFormat) {
                        if (this.$scope.timezone)
                            this.$scope.destValue = moment(this.$scope.dateValue).zone(this.$scope.timezone).format(this.$scope.momentFormat);
                        else
                            this.$scope.destValue = moment(this.$scope.dateValue).format(this.$scope.momentFormat);
                    }
                }
            }
            angular.module('kt.components')
                .controller('KTDateController', KTDateController);
            angular.module('kt.components')
                .directive('ktDate', () => {
                return {
                    restrict: 'EA',
                    scope: {
                        dateValue: '=',
                        format: '@?',
                        momentFormat: '@?'
                    },
                    templateUrl: 'app/common/components/kt-date/kt-date.html',
                    controller: 'KTDateController',
                    link: (scope, elem, attr) => {
                        if (attr.format) {
                            scope.format = attr.format;
                        }
                        else if (attr.momentformat) {
                            scope.momentFormat = attr.momentformat;
                        }
                        else {
                            scope.format = 'dd-MM-yy HH:mm:ss';
                        }
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=kt-date-controller.js.map