
namespace intranet.common.directives {

    export interface IKTDateScope extends common.IScopeBase {
        dateValue: any;
        destValue: any;
        format: any;
        timezone: any;
        momentFormat: any
    }

    class KTDateController extends ControllerBase<IKTDateScope>
    {
        constructor($scope: IKTDateScope,
            protected $rootScope: any,
            private $filter: any,
            settings: common.IBaseSettings) {
            super($scope);

            this.formatDate();

            this.$rootScope.$watch("timezone", () => {
                this.$scope.timezone = this.$rootScope.timezone;
                this.formatDate();
            });
            this.$scope.$watch("dateValue", () => {
                this.formatDate();
            });
        }

        private formatDate() {
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
                link: (scope: IKTDateScope, elem, attr: any) => {
                    if (attr.format) { scope.format = attr.format; }
                    else if (attr.momentformat) { scope.momentFormat = attr.momentformat; }
                    else {
                        scope.format = 'dd-MM-yy HH:mm:ss';
                    }
                }

            };
        });
}