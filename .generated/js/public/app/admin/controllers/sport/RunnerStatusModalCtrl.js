var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class RunnerStatusModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, marketService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.marketService = marketService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
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
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                var status = intranet.common.enums.RunnerStatus;
                this.$scope.runnerStatusList = intranet.common.helpers.Utility.enumToArray(status);
            }
            removeAll() {
                this.$scope.marketRunner.forEach((r) => { r.status = intranet.common.enums.RunnerStatus.REMOVED; });
            }
            runnerStatusChanged(selectedId, runner) {
                runner.status = selectedId;
                if (selectedId == intranet.common.enums.RunnerStatus.WINNER) {
                    this.$scope.marketRunner.forEach((r) => {
                        if (r.runner.id != runner.runner.id && r.status == intranet.common.enums.RunnerStatus.ACTIVE) {
                            r.status = intranet.common.enums.RunnerStatus.LOSER;
                        }
                    });
                }
            }
            saveRunnerStatus() {
                var promise;
                if (this.$scope.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.bettingType == intranet.common.enums.BettingType.LINE
                    || this.$scope.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
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
                    angular.forEach(this.$scope.marketRunner, (value) => {
                        var rr = { runnerId: value.runner.id, runnerStatus: value.status, handicap: value.handicap };
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
                    promise.success((response) => {
                        if (response.success) {
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                        else {
                            this.$scope.messages = response.messages;
                        }
                    });
                }
            }
        }
        admin.RunnerStatusModalCtrl = RunnerStatusModalCtrl;
        angular.module('intranet.admin').controller('runnerStatusModalCtrl', RunnerStatusModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=RunnerStatusModalCtrl.js.map