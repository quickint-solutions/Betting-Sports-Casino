namespace intranet.common.directives {

    export interface IKTChartScope extends common.IScopeBase {
        chartId: any;
        options: any;
    }

    class KTChartController extends ControllerBase<IKTChartScope>
    {
        /* @ngInject */
        constructor($scope: IKTChartScope) {
            super($scope);


            super.init(this);
        }

        public initScopeValues(): void {
            var myChart = Highcharts.chart(this.$scope.chartId.toString(), this.$scope.options);
        }


    }

    angular.module('kt.components')
        .controller('KTChartController', KTChartController);

    angular.module('kt.components')
        .directive('ktChart', () => {
            return {
                restrict: 'A',
                scope: {
                    chartId: '@?',
                    options: '='
                },
                controller: 'KTChartController',
            };
        });
}