var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTRadarIconController extends common.ControllerBase {
                constructor($scope, commonDataService, localStorageHelper, settings) {
                    super($scope);
                    this.commonDataService = commonDataService;
                    this.localStorageHelper = localStorageHelper;
                    this.settings = settings;
                    var marketWatch = this.$scope.$watch('market.source', (newval) => {
                        this.initScopeValues();
                    });
                    this.$scope.$on('$destroy', () => {
                        marketWatch();
                    });
                    super.init(this);
                }
                initScopeValues() {
                    if (this.$scope.market) {
                        if (this.$scope.market.source == common.enums.EventSource.Betfair
                            && this.$scope.market.bettingType == common.enums.BettingType.ODDS
                            && this.settings.IsBetfairLabel == true) {
                            this.$scope.available = 1;
                        }
                    }
                }
                openRadaraView() {
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
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=radar-icon-controller.js.map