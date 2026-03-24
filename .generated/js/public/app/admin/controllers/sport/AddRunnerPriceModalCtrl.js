var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddRunnerPriceModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, runnerService, runnerPriceService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.runnerService = runnerService;
                this.runnerPriceService = runnerPriceService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.runner = {};
                if (this.modalOptions.data) {
                    this.$scope.runner = this.modalOptions.data;
                    this.$scope.runner.selectedRunner = {};
                    this.$scope.runner.selectedRunner = { name: this.$scope.runner.runnerName, id: this.$scope.runner.runnerId };
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveRunner();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                var gametype = intranet.common.enums.GameType;
                this.$scope.gameTypeList = intranet.common.helpers.Utility.enumToArray(gametype);
                if (!this.$scope.runner.gameType) {
                    this.$scope.runner.gameType = this.$scope.gameTypeList[0].id.toString();
                }
                else {
                    this.$scope.runner.gameType = this.$scope.runner.gameType.toString();
                }
            }
            searchRunner(search) {
                if (search) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.runnerService.searchRunner({ Name: search });
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.runnerList = response.data;
                        });
                    }
                }
                else {
                    this.$scope.runnerList = [];
                }
            }
            saveRunner() {
                if (this.$scope.runner.selectedRunner && this.$scope.runner.selectedRunner.id) {
                    this.$scope.runner.runnerId = this.$scope.runner.selectedRunner.id;
                    this.$scope.runner.runnerName = this.$scope.runner.selectedRunner.name;
                    var promise;
                    if (this.$scope.runner.id) {
                        promise = this.runnerPriceService.updateRunnerPrice(this.$scope.runner);
                    }
                    else {
                        promise = this.runnerPriceService.addRunnerPrice(this.$scope.runner);
                    }
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
        admin.AddRunnerPriceModalCtrl = AddRunnerPriceModalCtrl;
        angular.module('intranet.admin').controller('addRunnerPriceModalCtrl', AddRunnerPriceModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddRunnerPriceModalCtrl.js.map