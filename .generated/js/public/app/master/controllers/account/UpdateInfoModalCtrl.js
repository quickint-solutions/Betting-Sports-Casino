var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class UpdateInfoModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, websiteService, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.websiteService = websiteService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.data = {};
                if (this.modalOptions.data) {
                    this.$scope.data = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.save();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                this.getSupportDetail();
            }
            getSupportDetail() {
                this.commonDataService.getSupportDetails().then((data) => {
                    this.$scope.data.whatsapp = JSON.parse(data.supportDetails).whatsapp;
                });
            }
            save() {
                if (this.$scope.data.newWhatsapp) {
                    var model = { whatsApp: 'https://wa.me/+' + this.$scope.data.newWhatsapp };
                    var promise;
                    promise = this.websiteService.updateWhatsapp(model);
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
        }
        master.UpdateInfoModalCtrl = UpdateInfoModalCtrl;
        angular.module('intranet.master').controller('updateInfoModalCtrl', UpdateInfoModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UpdateInfoModalCtrl.js.map