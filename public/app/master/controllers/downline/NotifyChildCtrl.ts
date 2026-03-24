module intranet.master {

    export interface INotifyChildScope extends intranet.common.IScopeBase {
        text1: any;
        text2: any;

        oldTxt: { text1: '', text2: '' };
    }

    export class NotifyChildCtrl extends intranet.common.ControllerBase<INotifyChildScope>
        implements common.init.IInit {
        constructor($scope: INotifyChildScope,
            private toasterService: common.services.ToasterService,
            private settingService: services.SettingService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.text1 = '';
            this.$scope.text2 = '';
            this.$scope.oldTxt = { text1: '', text2: '' };
        }

        public loadInitialData(): void {
            this.getNotification();
        }

        private getNotification(): void {
            this.settingService.getNotification()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response && response.success && response.data) {
                        this.$scope.oldTxt.text1 = response.data.text1;
                        this.$scope.oldTxt.text2 = response.data.text2;

                        this.$scope.text1=this.$scope.oldTxt.text1;
                        this.$scope.text2=this.$scope.oldTxt.text2;
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
    angular.module('intranet.master').controller('notifyChildCtrl', NotifyChildCtrl);
}