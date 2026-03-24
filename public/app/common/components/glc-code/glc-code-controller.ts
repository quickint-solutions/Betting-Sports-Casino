namespace intranet.common.directives {

    export interface IKTGlcCodeScope extends common.IScopeBase {
        item: any;
        currencyCode: string;
        currencyFraction: string;
        convertValue: boolean;
        special: any;
    }

    class KTGlcCodeController extends ControllerBase<IKTGlcCodeScope>
    {
        constructor($scope: IKTGlcCodeScope,
            settings: common.IBaseSettings) {
            super($scope);
            this.$scope.convertValue = true;

            if ((settings.ThemeName != 'lotus' || settings.WebApp == 'gameok' || settings.WebApp == 'gameokin') && settings.ThemeName != 'dimd2') {
                this.$scope.currencyCode = settings.CurrencyCode;
            }
            this.$scope.currencyFraction = settings.CurrencyFraction;
            this.$scope.special = 'false';
        }

    }

    angular.module('kt.components')
        .controller('KTGlcCodeController', KTGlcCodeController);

    angular.module('kt.components')
        .directive('ktGlcCode', () => {
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    item: '@?',
                    convertValue: '@?',
                    special: '@?'
                },
                templateUrl: 'app/common/components/glc-code/glc-code.html',
                controller: 'KTGlcCodeController'
            };
        });
}