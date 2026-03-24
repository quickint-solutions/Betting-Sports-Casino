module intranet.admin {

    export interface ISettingsScope extends intranet.common.IScopeBase {
    }

    export class SettingsCtrl extends intranet.common.ControllerBase<ISettingsScope>
    {
        constructor($scope: ISettingsScope,
            private modalService: common.services.ModalService,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings,
            private settingService: services.SettingService) {
            super($scope);
        }


        private addEditSetting(item: any = null): void {
            var modal = new common.helpers.CreateModal();
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
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage');
                }
            });
        }

        private deleteSetting(item: any): void {
            this.modalService.showDeleteConfirmation().then((result: any) => {
                if (result == common.services.ModalResult.OK) {
                    this.settingService.deleteSetting(item.id).success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.$broadcast('refreshGrid');
                        }
                        this.toasterService.showMessages(response.messages, 5000);
                    });
                }
            });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.settingService.getSettings(model);
        }
    }

    angular.module('intranet.admin').controller('settingsCtrl', SettingsCtrl);
}