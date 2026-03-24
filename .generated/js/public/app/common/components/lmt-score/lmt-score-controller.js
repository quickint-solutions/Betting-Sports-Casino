var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class LMTScoreController extends common.ControllerBase {
                constructor($scope, $filter, $timeout, commonDataService, settings) {
                    super($scope);
                    this.$filter = $filter;
                    this.$timeout = $timeout;
                    this.commonDataService = commonDataService;
                    this.settings = settings;
                    this.$scope.showScore = this.settings.IsLMTAvailable;
                    var watched = this.$scope.$watch('market', (n, old) => {
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
                render() {
                    if (this.$scope.showScore && this.$scope.market.event.scoreSourceId) {
                        this.commonDataService.getLMTscriptStatus()
                            .then((response) => {
                            this.$timeout(() => {
                                SIR("addWidget", ".sr-widget-1", "match.lmtPlus", {
                                    adsFrequency: false,
                                    layout: (this.$scope.layout && this.$scope.layout.length > 0) ? this.$scope.layout : "double",
                                    scoreboard: "disable",
                                    collapseTo: "momentum",
                                    tabsPosition: "bottom",
                                    pitchLogo: this.settings.ImagePath + 'images/' + this.settings.WebApp + '/logo.png',
                                    goalBannerImage: this.settings.ImagePath + 'images/' + this.settings.WebApp + '/logo.png',
                                    logo: [this.settings.ImagePath + 'images/' + this.settings.WebApp + '/logo.png'],
                                    matchId: this.$scope.market.event.scoreSourceId
                                });
                            }, 1000);
                        });
                    }
                }
                loadInitialData() {
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
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=lmt-score-controller.js.map