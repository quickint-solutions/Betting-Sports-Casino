namespace intranet.common.directives {

    export interface ILMTScoreScope extends common.IScopeBase {
        market: any;
        layout: any;
        showScore: boolean;
    }

    class LMTScoreController extends ControllerBase<ILMTScoreScope>
        implements common.init.ILoadInitialData {
        constructor($scope: ILMTScoreScope,
            private $filter: any,
            private $timeout: any,
            private commonDataService: common.services.CommonDataService,
            private settings: common.IBaseSettings) {
            super($scope);

            this.$scope.showScore = this.settings.IsLMTAvailable;

            var watched = this.$scope.$watch('market', (n: any, old: any) => {
                if (n != old) {
                    this.render();
                }
            });

            this.$scope.$on('$destroy', () => {
                watched();
                if (this.$scope.showScore) {
                    SIR('removeWidget', document.querySelector('.sr-widget-1'));
                }
            });

            super.init(this);
        }
        private render() {
            if (this.$scope.showScore && this.$scope.market.event.scoreSourceId) {
                this.commonDataService.getLMTscriptStatus()
                    .then((response: any) => {
                        this.$timeout(() => {
                            SIR("addWidget", ".sr-widget-1", "match.lmtPlus", {
                                adsFrequency: false,
                                layout: (this.$scope.layout && this.$scope.layout.length > 0) ? this.$scope.layout : "double",
                                scoreboard: "disable",
                                collapseTo: "momentum",
                                tabsPosition: "bottom",
                                pitchLogo: this.settings.ImagePath + 'images/' + this.settings.WebApp + '/logo.png',//; "https://www.lvexch.com/images/lvexch/login-logo.png",
                                goalBannerImage: this.settings.ImagePath + 'images/' + this.settings.WebApp + '/logo.png',
                                logo: [this.settings.ImagePath + 'images/' + this.settings.WebApp + '/logo.png'],
                                matchId: this.$scope.market.event.scoreSourceId
                            });
                        }, 1000);
                    });
            }
        }

        public loadInitialData() {

        }
    }

    angular.module('kt.components')
        .controller('LMTScoreController', LMTScoreController);

    angular.module('kt.components')
        .directive('lmtScore', () => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    market: '=',
                    layout: '@?',
                },
                templateUrl: 'app/common/components/lmt-score/lmt-score.html',
                controller: 'LMTScoreController',
            };
        });
}