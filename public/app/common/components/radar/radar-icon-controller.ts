namespace intranet.common.directives {

    export interface IKTRadarIconScope extends common.IScopeBase {
        market: any;
        available: any;
    }

    class KTRadarIconController extends ControllerBase<IKTRadarIconScope>
    {
        /* @ngInject */
        constructor($scope: IKTRadarIconScope,
            private commonDataService: common.services.CommonDataService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings) {
            super($scope);

            var marketWatch = this.$scope.$watch('market.source', (newval) => {
                this.initScopeValues();
            });

            this.$scope.$on('$destroy', () => {
                marketWatch();
            });

            super.init(this);
        }

        public initScopeValues(): void {
            if (this.$scope.market) {
                if (this.$scope.market.source == common.enums.EventSource.Betfair
                    && this.$scope.market.bettingType == common.enums.BettingType.ODDS
                    && this.settings.IsBetfairLabel == true) {
                    this.$scope.available = 1;
                }
            }
            //var result = this.localStorageHelper.get(this.settings.UserData);
            //if (result) {
            //    if (result.user.userType == common.enums.UserType.Radar) {
            //        this.$scope.available = 1;
            //    }
            //}

            // for testing
            //this.$scope.available = 1;
        }

        public openRadaraView(): void {
            this.commonDataService.openRadarView(this.$scope.market.id);
        }

    }

    angular.module('kt.components')
        .controller('KTRadarIconController', KTRadarIconController);

    angular.module('kt.components')
        .directive('ktRdIcon', () => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    market: '='
                },
                templateUrl: 'app/common/components/radar/radar-icon.html',
                controller: 'KTRadarIconController',
            };
        });
}