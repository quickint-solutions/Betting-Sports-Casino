var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddSettingModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $uibModalInstance, settingService, commonDataService, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$uibModalInstance = $uibModalInstance;
                this.settingService = settingService;
                this.commonDataService = commonDataService;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.setting = {};
                if (this.modalOptions.data) {
                    this.$scope.setting = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveSettings();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
            }
            saveSettings() {
                var promise;
                if (this.$scope.setting.id) {
                    promise = this.settingService.updateSetting(this.$scope.setting);
                }
                else {
                    promise = this.settingService.addSetting(this.$scope.setting);
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
        admin.AddSettingModalCtrl = AddSettingModalCtrl;
        angular.module('intranet.admin').controller('addSettingModalCtrl', AddSettingModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddSettingModalCtrl.js.map