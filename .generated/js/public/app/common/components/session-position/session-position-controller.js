var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTSessionPOsitionController extends common.ControllerBase {
                constructor($scope, $timeout, commonDataService, positionService) {
                    super($scope);
                    this.$timeout = $timeout;
                    this.commonDataService = commonDataService;
                    this.positionService = positionService;
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.grpPositions = [];
                }
                loadInitialData() {
                    if (this.$scope.ladders) {
                        this.$scope.grpPositions = JSON.parse(this.$scope.ladders);
                    }
                    else {
                        this.getSessionPosition();
                    }
                }
                getSessionPosition() {
                    this.positionService.getMyScorePosition(this.$scope.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.grpPositions = response.data;
                        }
                    });
                }
            }
            angular.module('kt.components')
                .controller('KTSessionPOsitionController', KTSessionPOsitionController);
            angular.module('kt.components')
                .directive('ktPosition', () => {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        id: '@',
                        ladders: '@?'
                    },
                    controller: 'KTSessionPOsitionController',
                    templateUrl: 'app/common/components/session-position/session-position.html',
                    compile: (elem, attr) => {
                        return {
                            pre: (scope, element, attrs) => {
                            },
                            post: (scope, element, attrs) => {
                            }
                        };
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=session-position-controller.js.map