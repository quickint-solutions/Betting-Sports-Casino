module intranet.admin {

    export interface IVoidBetsModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        request: any;
        fromHistory: boolean;
    }

    export class VoidBetsModalCtrl extends intranet.common.ControllerBase<IVoidBetsModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IVoidBetsModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $translate: ng.translate.ITranslateService,
            private betService: services.BetService,
            private betHistoryService: services.BetHistoryService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.fromHistory = false;
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.request = {};
            if (this.modalOptions.data) {
                this.$scope.request = this.modalOptions.data;
                this.$scope.fromHistory = this.modalOptions.data.fromHistory;

            }

            this.$scope.modalOptions.ok = result => {
                this.voidBet();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private voidBet(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.request.betIds && this.$scope.request.betIds.length > 0) {
                if (this.$scope.fromHistory == true) {
                    promise = this.betHistoryService.voidBets(this.$scope.request);
                } else {
                    promise = this.betService.voidBets(this.$scope.request);
                }
            }
            else if (this.$scope.fromHistory == true) {
                promise = this.betHistoryService.voidBet(this.$scope.request);
            } else {
                promise = this.betService.voidBet(this.$scope.request);
            }

            if (promise) {
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    } else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
    }

    angular.module('intranet.admin').controller('voidBetsModalCtrl', VoidBetsModalCtrl);
}