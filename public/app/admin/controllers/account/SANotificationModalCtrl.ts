module intranet.admin {

    export interface ISANotificationModalScope extends intranet.common.IScopeBase {
        modalOptions: any;

        text1: any;
        text2: any;

        oldTxt: { text1: '', text2: '' };
    }

    export class SANotificationModalCtrl extends intranet.common.ControllerBase<ISANotificationModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: ISANotificationModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private settingService: services.SettingService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.text1 = '';
            this.$scope.text2 = '';
            this.$scope.oldTxt = { text1: '', text2: '' };

            this.$scope.modalOptions = this.modalOptions;

            this.$scope.modalOptions.ok = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            this.getNotification();
        }

        private getNotification(): void {
            this.settingService.getNotifications()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response && response.success && response.data) {
                        this.$scope.oldTxt.text1 = response.data.text1;
                        this.$scope.oldTxt.text2 = response.data.text2;

                        this.$scope.text1 = this.$scope.oldTxt.text1;
                        this.$scope.text2 = this.$scope.oldTxt.text2;
                    }
                });
        }

        private updateNotification(txtNum: any = 0): void {
            var model = { text1: this.$scope.oldTxt.text1, text2: this.$scope.oldTxt.text2 };
            if (txtNum == 1) { model.text1 = this.$scope.text1; }
            if (txtNum == 2) { model.text2 = this.$scope.text2; }

            this.settingService.updateNotifications(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (txtNum == 1) { this.$scope.oldTxt.text1 = this.$scope.text1; }
                        if (txtNum == 2) { this.$scope.oldTxt.text2 = this.$scope.text2; }
                    }
                    this.toasterService.showMessages(response.messages);
                });
        }
    }

    angular.module('intranet.admin').controller('sANotificationModalCtrl', SANotificationModalCtrl);
}