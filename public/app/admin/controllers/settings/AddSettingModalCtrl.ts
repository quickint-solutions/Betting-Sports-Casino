module intranet.admin {

    export interface IAddSettingModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        setting: any;
    }

    export class AddSettingModalCtrl extends intranet.common.ControllerBase<IAddSettingModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddSettingModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $uibModalInstance,
            private settingService: services.SettingService,
            private commonDataService: common.services.CommonDataService,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData() {
        }
        

        private saveSettings(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.setting.id) {
                promise = this.settingService.updateSetting(this.$scope.setting);
            }
            else {
                promise = this.settingService.addSetting(this.$scope.setting);
            }
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
    angular.module('intranet.admin').controller('addSettingModalCtrl', AddSettingModalCtrl);
}