module intranet.admin {

    export interface IAddRunnerPriceModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        runner: any;
        runnerList: any;
        promiseItem: any;
        gameTypeList: any;
    }

    export class AddRunnerPriceModalCtrl extends intranet.common.ControllerBase<IAddRunnerPriceModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddRunnerPriceModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private runnerService: services.RunnerService,
            private runnerPriceService: services.RunnerPriceService,
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
                this.$scope.runner.selectedRunner = {};
                this.$scope.runner.selectedRunner= { name: this.$scope.runner.runnerName, id: this.$scope.runner.runnerId };
            }

            this.$scope.modalOptions.ok = result => {
                this.saveRunner();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            var gametype: any = common.enums.GameType;
            this.$scope.gameTypeList = common.helpers.Utility.enumToArray<common.enums.GameType>(gametype);
            if (!this.$scope.runner.gameType)
            { this.$scope.runner.gameType = this.$scope.gameTypeList[0].id.toString(); }
            else { this.$scope.runner.gameType = this.$scope.runner.gameType.toString(); }
        }

        private searchRunner(search: string): void {
            if (search) {

                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }

                this.$scope.promiseItem = this.runnerService.searchRunner({ Name: search });
                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        this.$scope.runnerList = response.data;
                    });
                }

            } else {
                this.$scope.runnerList = [];
            }
        }

        private saveRunner(): void {
            if (this.$scope.runner.selectedRunner && this.$scope.runner.selectedRunner.id) {
                this.$scope.runner.runnerId = this.$scope.runner.selectedRunner.id;
                this.$scope.runner.runnerName = this.$scope.runner.selectedRunner.name;

                var promise: ng.IHttpPromise<any>;
                if (this.$scope.runner.id) {
                    promise = this.runnerPriceService.updateRunnerPrice(this.$scope.runner);
                }
                else { promise = this.runnerPriceService.addRunnerPrice(this.$scope.runner); }
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
    angular.module('intranet.admin').controller('addRunnerPriceModalCtrl', AddRunnerPriceModalCtrl);
}