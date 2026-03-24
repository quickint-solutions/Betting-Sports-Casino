var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class NotifyChildCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, settingService) {
                super($scope);
                this.toasterService = toasterService;
                this.settingService = settingService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.text1 = '';
                this.$scope.text2 = '';
                this.$scope.oldTxt = { text1: '', text2: '' };
            }
            loadInitialData() {
                this.getNotification();
            }
            getNotification() {
                this.settingService.getNotification()
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
        master.NotifyChildCtrl = NotifyChildCtrl;
        angular.module('intranet.master').controller('notifyChildCtrl', NotifyChildCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=NotifyChildCtrl.js.map