namespace intranet.common.directives {

    export interface IKTGlcCoinScope extends common.IScopeBase {
        item: any;
        showSize: string;
        isBm: string;
    }

    class KTGlcCoinController extends ControllerBase<IKTGlcCoinScope>
    {
        /* @ngInject */
        constructor($scope: IKTGlcCoinScope,
            settings: common.IBaseSettings) {
            super($scope);


            this.$scope.showSize = 'true';
            this.$scope.isBm = 'false';
            super.init(this);
        }

        public initScopeValues(): void {
        }

    }

    angular.module('kt.components')
        .controller('KTGlcCoinController', KTGlcCoinController);

    angular.module('kt.components')
        .directive('ktGlc', (settings: common.IBaseSettings) => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    item: '=?',
                    showSize: '@?',
                    isBm: '@?'
                },
                templateUrl: settings.ThemeName.toLowerCase() == 'betfair' ?
                    'app/common/components/glc-coin/glc-coin-betfair.html'
                    : (settings.ThemeName.toLowerCase() == 'bking'
                        ? 'app/common/components/glc-coin/glc-coin-bking.html'
                        : (settings.ThemeName == 'sports' ?
                            'app/common/components/glc-coin/glc-coin-sports.html' :
                            (settings.ThemeName == 'dimd2' ? 'app/common/components/glc-coin/glc-dimd2.html' : 'app/common/components/glc-coin/glc-coin.html'))
                    )
                ,
                controller: 'KTGlcCoinController',
            };
        });
}