var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddNotificationModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $uibModalInstance, marketService, commonDataService, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$uibModalInstance = $uibModalInstance;
                this.marketService = marketService;
                this.commonDataService = commonDataService;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.market = {};
                if (this.modalOptions.data) {
                    this.$scope.market = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveNotification();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveNotification() {
                var promise;
                var model = { id: this.$scope.market.id, notification: this.$scope.market.notification };
                promise = this.marketService.setNotification(model);
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
        admin.AddNotificationModalCtrl = AddNotificationModalCtrl;
        angular.module('intranet.admin').controller('addNotificationModalCtrl', AddNotificationModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddNotificationModalCtrl.js.map