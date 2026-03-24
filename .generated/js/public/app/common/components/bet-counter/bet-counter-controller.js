var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTBetCounterController extends common.ControllerBase {
                constructor($scope, $timeout, settings, commonDataService, toasterService, $filter) {
                    super($scope);
                    this.$timeout = $timeout;
                    this.settings = settings;
                    this.commonDataService = commonDataService;
                    this.toasterService = toasterService;
                    this.$filter = $filter;
                    if (!this.settings.IsFaaS) {
                        var processWatcher = $scope.$watch('betInProcess', (newItem, oldItem) => {
                            if (newItem == true) {
                                this.startCounter();
                            }
                            else {
                                this.stopCounter();
                            }
                        });
                        this.$scope.$on('$destroy', () => {
                            this.$timeout.cancel(this.$scope.timer_betdelay);
                            processWatcher();
                        });
                    }
                    super.init(this);
                }
                initScopeValues() {
                    this.$scope.small = 'false';
                }
                loadInitialData() {
                    if (!this.settings.IsFaaS)
                        this.getBetConfig();
                }
                getBetConfig() {
                    var promise;
                    promise = this.commonDataService.getUserBetConfig();
                    promise.then((value) => {
                        this.$scope.eventTypesConfig = value;
                    });
                }
                stopCounter() {
                    var stopdelay = (() => {
                        if (this.$scope.timer_betdelay) {
                            this.$timeout.cancel(this.$scope.timer_betdelay);
                        }
                    });
                }
                startCounter() {
                    this.$scope.betDelay = -1;
                    this.$timeout.cancel(this.$scope.timer_betdelay);
                    var delays = this.$scope.eventTypesConfig.filter((e) => { return e.eventTypeId == this.$scope.eventType; });
                    if (delays.length > 0) {
                        this.$scope.betDelay = delays[0].betDelay;
                        var self = this;
                        var startdelay = (() => {
                            if (self.$scope.betDelay > 0) {
                                self.$scope.betDelay = self.$scope.betDelay - 1;
                                self.$scope.timer_betdelay = self.$timeout(() => {
                                    startdelay();
                                }, 1200);
                            }
                            else {
                                self.stopCounter();
                            }
                        });
                        this.$timeout(() => { startdelay(); }, 1000);
                    }
                }
            }
            angular.module('kt.components')
                .controller('KTBetCounterController', KTBetCounterController);
            angular.module('kt.components')
                .directive('ktCounter', () => {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        betInProcess: '=',
                        eventType: '@',
                        small: '@?'
                    },
                    controller: 'KTBetCounterController',
                    templateUrl: 'app/common/components/bet-counter/bet-counter.html',
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
//# sourceMappingURL=bet-counter-controller.js.map