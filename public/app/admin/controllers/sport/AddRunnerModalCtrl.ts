module intranet.admin {

    export interface IAddRunnerModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        runner: any;
    }

    export class AddRunnerModalCtrl extends intranet.common.ControllerBase<IAddRunnerModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddRunnerModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private runnerService: services.RunnerService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.runner = {};
            if (this.modalOptions.data) {
                this.$scope.runner = this.modalOptions.data;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveRunner();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveRunner(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.runner.id) {
                promise = this.runnerService.updateRunner(this.$scope.runner);
            }
            else { promise = this.runnerService.addRunner(this.$scope.runner); }
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
    angular.module('intranet.admin').controller('addRunnerModalCtrl', AddRunnerModalCtrl);
}