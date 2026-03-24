module intranet.admin {

    export interface IRunnerStatusModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        marketRunner: any[];
        runnerStatusList: any[];
        bettingType: any;
        winningRuns: any;
        reclose: boolean;
        isGameClosing: boolean;
        gameType: any;
        marketId: any;

        pattiRunner: any;
    }

    export class RunnerStatusModalCtrl extends intranet.common.ControllerBase<IRunnerStatusModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IRunnerStatusModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private marketService: services.MarketService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.isGameClosing = false;
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.marketRunner = this.modalOptions.data.marketRunner;
                this.$scope.bettingType = this.modalOptions.data.bettingType;
                this.$scope.reclose = this.modalOptions.data.reclose;
                this.$scope.isGameClosing = this.modalOptions.data.isGameClosing;
                this.$scope.gameType = this.modalOptions.data.gameType;
                this.$scope.winningRuns = this.modalOptions.data.winner;
                this.$scope.marketId = this.modalOptions.data.marketId;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveRunnerStatus();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            var status: any = common.enums.RunnerStatus;
            this.$scope.runnerStatusList = common.helpers.Utility.enumToArray<common.enums.RunnerStatus>(status);
        }

        private removeAll(): void {
            this.$scope.marketRunner.forEach((r: any) => { r.status = common.enums.RunnerStatus.REMOVED; });
        }

        private runnerStatusChanged(selectedId: any, runner: any): void {
            runner.status = selectedId;
            if (selectedId == common.enums.RunnerStatus.WINNER) {
                this.$scope.marketRunner.forEach((r: any) => {
                    if (r.runner.id != runner.runner.id && r.status == common.enums.RunnerStatus.ACTIVE) {
                        r.status = common.enums.RunnerStatus.LOSER;
                    }
                });
            }
        }


        private saveRunnerStatus(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.bettingType == common.enums.BettingType.SESSION || this.$scope.bettingType == common.enums.BettingType.LINE
                || this.$scope.bettingType == common.enums.BettingType.SCORE_RANGE) {
                var model = { marketId: this.$scope.marketId, winner: this.$scope.winningRuns };
                if (this.$scope.reclose) {
                    promise = this.marketService.recloseMarket(model);
                }
                else {
                    promise = this.marketService.closeMarket(model);
                }
            }
            else if (this.$scope.marketRunner) {
                var data = { marketId: this.$scope.marketId, runners: [] };
                angular.forEach(this.$scope.marketRunner, (value: any) => {
                    var rr: any = { runnerId: value.runner.id, runnerStatus: value.status, handicap: value.handicap };
                    data.runners.push(rr);
                });
                if (this.$scope.reclose) {
                    promise = this.marketService.recloseMarket(data);
                }
                else {
                    promise = this.marketService.closeMarket(data);
                }
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

    angular.module('intranet.admin').controller('runnerStatusModalCtrl', RunnerStatusModalCtrl);
}