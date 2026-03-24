var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SettingsCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, toasterService, settings, settingService) {
                super($scope);
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.settings = settings;
                this.settingService = settingService;
            }
            addEditSetting(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'admin.setting.edit.modal.header';
                    modal.data = {
                        id: item.id,
                        settingKey: item.settingKey,
                        settingValue: item.settingValue,
                        name: item.name
                    };
                }
                else {
                    modal.header = 'admin.setting.add.modal.header';
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/settings/add-setting-modal.html';
                modal.controller = 'addSettingModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage');
                    }
                });
            }
            deleteSetting(item) {
                this.modalService.showDeleteConfirmation().then((result) => {
                    if (result == intranet.common.services.ModalResult.OK) {
                        this.settingService.deleteSetting(item.id).success((response) => {
                            if (response.success) {
                                this.$scope.$broadcast('refreshGrid');
                            }
                            this.toasterService.showMessages(response.messages, 5000);
                        });
                    }
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.settingService.getSettings(model);
            }
        }
        admin.SettingsCtrl = SettingsCtrl;
        angular.module('intranet.admin').controller('settingsCtrl', SettingsCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SettingsCtrl.js.map