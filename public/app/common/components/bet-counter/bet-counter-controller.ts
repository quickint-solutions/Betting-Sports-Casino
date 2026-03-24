namespace intranet.common.directives {

    export interface IKTBetCounterScope
        extends common.IScopeBase {
        eventType: any;
        betInProcess: boolean;
        small: any;

        timer_betdelay: any;
        betDelay: any;
        eventTypesConfig: any[]
    }

    class KTBetCounterController
        extends common.ControllerBase<IKTBetCounterScope> {
        /* @ngInject */
        constructor($scope: IKTBetCounterScope,
            private $timeout: any,
            private settings: common.IBaseSettings,
            private commonDataService: services.CommonDataService,
            private toasterService: intranet.common.services.ToasterService,
            private $filter: any) {
            super($scope);

            if (!this.settings.IsFaaS) {
                var processWatcher = $scope.$watch('betInProcess', (newItem, oldItem) => {
                    if (newItem == true) {
                        this.startCounter();
                    } else {
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

        public initScopeValues(): void {
            this.$scope.small = 'false';
        }

        public loadInitialData(): void {
            if (!this.settings.IsFaaS)
                this.getBetConfig();
        }

        private getBetConfig(): void {
            var promise: ng.IHttpPromise<any>;
            promise = this.commonDataService.getUserBetConfig();
            promise.then((value: any) => {
                this.$scope.eventTypesConfig = value;
                //this.$scope.betInProcess = true;
                //this.startCounter();
            });
        }

        private stopCounter(): void {
            var stopdelay = (() => {
                if (this.$scope.timer_betdelay) {
                    this.$timeout.cancel(this.$scope.timer_betdelay);
                }
            });
        }

        private startCounter(): void {
            this.$scope.betDelay = -1;
            this.$timeout.cancel(this.$scope.timer_betdelay);
            var delays = this.$scope.eventTypesConfig.filter((e: any) => { return e.eventTypeId == this.$scope.eventType; });
            if (delays.length > 0) {
                this.$scope.betDelay = delays[0].betDelay;

                var self = this;
                var startdelay = (() => {
                    if (self.$scope.betDelay > 0) {
                        self.$scope.betDelay = self.$scope.betDelay - 1;
                        self.$scope.timer_betdelay = self.$timeout(() => {
                            startdelay()
                        }, 1200);
                    } else {
                        self.stopCounter();
                    }
                });
                this.$timeout(() => { startdelay() }, 1000);
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
                compile: (elem, attr: any) => {
                    return {
                        pre: (scope: IKTBetCounterScope, element, attrs) => {
                        },
                        post: (scope: IKTBetCounterScope, element, attrs: any) => {
                        }
                    };
                }
            };
        });
}