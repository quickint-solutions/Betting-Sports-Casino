var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddLanguageModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, languageService, toasterService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.languageService = languageService;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.id = this.modalOptions.data.id;
                    this.$scope.code = this.modalOptions.data.code;
                    this.$scope.name = this.modalOptions.data.name;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveLanguage();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveLanguage() {
                var model = { code: this.$scope.code, name: this.$scope.name, id: this.$scope.id };
                var promise;
                if (model.id) {
                    promise = this.languageService.updateLanguage(model);
                }
                else {
                    promise = this.languageService.addLanguage(model);
                }
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
        admin.AddLanguageModalCtrl = AddLanguageModalCtrl;
        angular.module('intranet.admin').controller('addLanguageModalCtrl', AddLanguageModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddLanguageModalCtrl.js.map