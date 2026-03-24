var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class NotifyUserModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $translate, notificationService, settings, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$translate = $translate;
                this.notificationService = notificationService;
                this.settings = settings;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.apkPackages = [];
                this.$scope.allSelected = true;
                this.$scope.model = { priority: 'HIGH', hours: '0', minutes: '10', title: '', message: '', imgurl: '' };
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.modalOptions.ok = result => {
                    this.sendNotification();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            processFile() {
                var reader = new FileReader();
                var self = this;
                reader.onload = function () {
                    if (reader.result) {
                        self.$scope.apkPackages = JSON.parse(reader.result);
                        self.appSelectionChanged(true);
                    }
                };
                reader.readAsText(this.$scope.ctrl.jsonDataFile);
            }
            appSelectionChanged(all = false) {
                if (all) {
                    this.$scope.apkPackages.forEach((a) => { a.selected = this.$scope.allSelected; });
                }
                else {
                    var result = this.$scope.apkPackages.every((a) => { return a.selected == true; });
                    this.$scope.allSelected = result;
                }
            }
            loadInitialData() {
            }
            sendNotification() {
                var minutes = math.multiply(math.multiply(this.$scope.model.minutes, 60), 1000);
                var hours = this.$scope.model.hours * 60 * 60 * 1000;
                var model = {
                    data: {
                        message: this.$scope.model.message,
                        title: this.$scope.model.title,
                    },
                    priority: this.$scope.model.priority,
                    to: '/topics/all',
                    ttl: minutes + hours,
                    restrictedPackageName: ''
                };
                if (this.$scope.model.imgurl) {
                    model.data.image = this.$scope.model.imgurl;
                }
                this.$scope.apkPackages.forEach((p) => {
                    if (p.selected) {
                        model.restrictedPackageName = p.pk;
                        var header = { Authorization: "key=" + p.key };
                        this.notificationService.sendNotification(model, header)
                            .then((response) => {
                            if (response.data.message_id) {
                                this.toasterService.showToast(intranet.common.helpers.ToastType.Success, p.name + ' : Notification sent successfully.', 3000);
                            }
                            else {
                                this.toasterService.showToast(intranet.common.helpers.ToastType.Error, p.name + ' : Notification failed.', 3000);
                            }
                        });
                    }
                });
            }
        }
        admin.NotifyUserModalCtrl = NotifyUserModalCtrl;
        angular.module('intranet.admin').controller('notifyUserModalCtrl', NotifyUserModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=NotifyUserModalCtrl.js.map