var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddTranslationModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, translationService, toasterService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.translationService = translationService;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.langKey = '';
                this.$scope.isUI = true;
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.data = this.modalOptions.data;
                this.$scope.modalOptions.ok = result => {
                    this.saveTranslations();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveTranslations() {
                var model;
                var promise;
                if (this.modalOptions.newRecord) {
                    model = { Key: this.$scope.langKey, TranslationValues: [], IsUI: this.$scope.isUI };
                    angular.forEach(this.$scope.data, (val) => {
                        model.TranslationValues.push({ LanguageId: val.id, value: val.value });
                    });
                    promise = this.translationService.addTranslations(model);
                }
                else {
                    model = {
                        id: this.$scope.data.translationId,
                        value: this.$scope.data.value,
                        key: this.$scope.data.key,
                        IsUI: this.$scope.data.isUI
                    };
                    promise = this.translationService.updateTranslations(model);
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
        admin.AddTranslationModalCtrl = AddTranslationModalCtrl;
        angular.module('intranet.admin').controller('addTranslationModalCtrl', AddTranslationModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddTranslationModalCtrl.js.map