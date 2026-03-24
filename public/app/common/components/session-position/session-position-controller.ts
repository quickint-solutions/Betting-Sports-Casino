namespace intranet.common.directives {

    export interface IKTSessionPositionScope
        extends common.IScopeBase {
        grpPositions: any[];
        id: any;
        ladders: any;
    }

    class KTSessionPOsitionController
        extends common.ControllerBase<IKTSessionPositionScope> {
        /* @ngInject */
        constructor($scope: IKTSessionPositionScope,
            private $timeout: any,
            private commonDataService: services.CommonDataService,
            private positionService: intranet.services.PositionService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.grpPositions = [];
        }

        public loadInitialData(): void {
            if (this.$scope.ladders) {
                this.$scope.grpPositions = JSON.parse(this.$scope.ladders);
            } else {
                this.getSessionPosition();
            }
        }

        private getSessionPosition(): void {
            this.positionService.getMyScorePosition(this.$scope.id)
                .success((response: common.messaging.IResponse<any>) => {
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