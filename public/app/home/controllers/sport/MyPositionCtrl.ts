module intranet.home {

    export interface IMyPositionScope extends intranet.common.IScopeBase {
        marketId: any;
        modalOptions: any;
        positions: any;
    }

    export class MyPositionCtrl extends intranet.common.ControllerBase<IMyPositionScope>
        implements intranet.common.init.IInit {

        constructor($scope: IMyPositionScope,
            private positionService: services.PositionService,
            private settings: common.IBaseSettings,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.positions = [];
            this.$scope.modalOptions = this.modalOptions;

            if (this.modalOptions.data) { this.$scope.marketId = this.modalOptions.data; }

            this.$scope.modalOptions.ok = result => ({ data: null, button: common.services.ModalResult.Cancel });
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.loadScorePosition();
        }

        private loadScorePosition(): void {
            var promise: any;

            promise = this.positionService.getMyScorePosition(this.$scope.marketId);
            if (promise) {
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.positions = response.data;
                    }
                });
            }
        }

    }

    angular.module('intranet.home').controller('myPositionCtrl', MyPositionCtrl);
}