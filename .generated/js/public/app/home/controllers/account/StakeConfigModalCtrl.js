var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class StakeConfigModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, commonDataService, $filter, localStorageHelper, settings, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.data = this.modalOptions.data;
                }
                console.log(this.$scope.data);
                this.$scope.modalOptions.ok = result => {
                    this.saveConfig();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveConfig() {
                var promise;
                promise = this.userService.updateStakeConfig(this.$scope.data);
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.data);
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        this.$rootScope.$emit(this.settings.StakeConfig);
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
        home.StakeConfigModalCtrl = StakeConfigModalCtrl;
        angular.module('intranet.home').controller('stakeConfigModalCtrl', StakeConfigModalCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=StakeConfigModalCtrl.js.map