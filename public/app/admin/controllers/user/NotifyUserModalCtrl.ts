module intranet.admin {

    export interface INotifyUserModalScope extends intranet.common.IScopeBase {
        modalOptions: any;

        apkPackages: any[];
        model: any;
        jsonDataFile: any;
        allSelected: boolean;
    }

    export class NotifyUserModalCtrl extends intranet.common.ControllerBase<INotifyUserModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: INotifyUserModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $translate: ng.translate.ITranslateService,
            private notificationService: services.NotificationService,
            private settings: common.IBaseSettings,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.apkPackages = [];
            this.$scope.allSelected = true;
            this.$scope.model = { priority: 'HIGH', hours: '0', minutes: '10', title: '', message: '', imgurl: '' };
            this.$scope.modalOptions = this.modalOptions;

            this.$scope.modalOptions.ok = result => {
                this.sendNotification();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public processFile(): void {
            var reader: any = new FileReader();
            var self = this;
            reader.onload = function () {
                if (reader.result) {
                    self.$scope.apkPackages = JSON.parse(reader.result);
                    self.appSelectionChanged(true);
                }
            };
            reader.readAsText(this.$scope.ctrl.jsonDataFile);
        }

        private appSelectionChanged(all: boolean = false): void {
            if (all) {
                this.$scope.apkPackages.forEach((a: any) => { a.selected = this.$scope.allSelected; });
            }
            else {
                var result = this.$scope.apkPackages.every((a: any) => { return a.selected == true; });
                this.$scope.allSelected = result;
            }
        }

        public loadInitialData(): void {
        }

        private sendNotification(): void {
            var minutes: any = math.multiply(math.multiply(this.$scope.model.minutes, 60), 1000);
            var hours: number = this.$scope.model.hours * 60 * 60 * 1000;

            var model: any = {
                data: {
                    message: this.$scope.model.message,
                    title: this.$scope.model.title,
                },
                priority: this.$scope.model.priority,
                to: '/topics/all',
                ttl: minutes + hours,
                restrictedPackageName: ''
            };
            if (this.$scope.model.imgurl) { model.data.image = this.$scope.model.imgurl; }

            this.$scope.apkPackages.forEach((p: any) => {
                if (p.selected) {
                    model.restrictedPackageName = p.pk;
                    var header = { Authorization: "key=" + p.key };
                    this.notificationService.sendNotification(model, header)
                        .then((response: any) => {
                            if (response.data.message_id) {
                                this.toasterService.showToast(common.helpers.ToastType.Success, p.name + ' : Notification sent successfully.', 3000);
                            } else {
                                this.toasterService.showToast(common.helpers.ToastType.Error, p.name + ' : Notification failed.', 3000);
                            }
                        });
                }
            });
            //this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });

        }
    }

    angular.module('intranet.admin').controller('notifyUserModalCtrl', NotifyUserModalCtrl);
}