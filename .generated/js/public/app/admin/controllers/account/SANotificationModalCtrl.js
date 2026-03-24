var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SANotificationModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, settingService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.settingService = settingService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.text1 = '';
                this.$scope.text2 = '';
                this.$scope.oldTxt = { text1: '', text2: '' };
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.modalOptions.ok = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                this.getNotification();
            }
            getNotification() {
                this.settingService.getNotifications()
                    .success((response) => {
                    if (response && response.success && response.data) {
                        this.$scope.oldTxt.text1 = response.data.text1;
                        this.$scope.oldTxt.text2 = response.data.text2;
                        this.$scope.text1 = this.$scope.oldTxt.text1;
                        this.$scope.text2 = this.$scope.oldTxt.text2;
                    }
                });
            }
            updateNotification(txtNum = 0) {
                var model = { text1: this.$scope.oldTxt.text1, text2: this.$scope.oldTxt.text2 };
                if (txtNum == 1) {
                    model.text1 = this.$scope.text1;
                }
                if (txtNum == 2) {
                    model.text2 = this.$scope.text2;
                }
                this.settingService.updateNotifications(model)
                    .success((response) => {
                    if (response.success) {
                        if (txtNum == 1) {
                            this.$scope.oldTxt.text1 = this.$scope.text1;
                        }
                        if (txtNum == 2) {
                            this.$scope.oldTxt.text2 = this.$scope.text2;
                        }
                    }
                    this.toasterService.showMessages(response.messages);
                });
            }
        }
        admin.SANotificationModalCtrl = SANotificationModalCtrl;
        angular.module('intranet.admin').controller('sANotificationModalCtrl', SANotificationModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SANotificationModalCtrl.js.map