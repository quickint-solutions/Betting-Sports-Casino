namespace intranet.common.directives {
    export interface IOdometerScope extends intranet.common.IScopeBase {
        myOdometer: any;
        value: any;
    }

    class KTOdometerController extends intranet.common.ControllerBase<IOdometerScope> {

        /* @ngInject */
        constructor($scope: IOdometerScope) {
            super($scope);

            this.$scope.$watch('value', (newVal) => {
                this.$scope.myOdometer.update(newVal);
            });
        }
    }


    angular.module('kt.components')
        .controller('KTOdometerController', KTOdometerController)
        .directive('ktOdometer', () => {
            return {
                restrict: 'AE',
                scope: {
                    value:'@'
                },
                controller: 'KTOdometerController',
                link: function (scope, elm, attrs:any) {
                    var odometer, opts, odometerOptions;
                    odometerOptions = { duration: 1000, theme: 'minimal' };
                    opts = scope.$eval(attrs.odometerOptions) || {};
                    angular.extend(opts, odometerOptions);
                    opts.el = elm[0];
                    odometer = new Odometer(opts);
                    scope.myOdometer = odometer;
                    //scope.$watch(attrs.odometer, function (newVal) {
                    //    odometer.update(newVal);
                    //});
                }
            };
        });

    angular.module('kt.components')
        .controller('KTOdometerController', KTOdometerController)
        .directive('iframeOnload', () => {
            return {
                restrict: 'AE',
                scope: {},
                
                link: function (scope, element:any, attrs) {
                    element.on('load', function () {
                        console.log('load found');
                        //  element[0].style.height = element[0].contentWindow.document.body.scrollHeight + 'px';
                        
                    })
                }
            };
        });
}