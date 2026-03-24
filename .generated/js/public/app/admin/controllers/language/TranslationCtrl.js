var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class TranslationCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, modalService, settings, $stateParams, $q, translationService) {
                super($scope);
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.settings = settings;
                this.$stateParams = $stateParams;
                this.$q = $q;
                this.translationService = translationService;
                this.$scope.search = { value: '', key: '', isUi: true };
            }
            getItems(params, filters) {
                this.$scope.search.languageId = this.$stateParams.langId;
                var model = {
                    params: params, filters: filters,
                    searchQuery: this.$scope.search
                };
                return this.translationService.getTranslationsById(model);
            }
            editTranslation(item) {
                var options = new intranet.common.services.ModalOptions();
                options.header = 'admin.translation.modal.header';
                options.bodyUrl = this.settings.ThemeName + '/admin/language/add-translation-modal.html';
                options.newRecord = false;
                options.data = {
                    languageId: this.$stateParams.langId,
                    languageName: this.$stateParams.langName,
                    translationId: item.id,
                    key: item.key,
                    value: item.value,
                    isUI: item.isUi
                };
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.controller = 'addTranslationModalCtrl';
                modalDefaults.resolve = {
                    modalOptions: () => {
                        return options;
                    }
                };
                this.modalService.showWithOptions(options, modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            deleteTranslation(item) {
                this.modalService.showDeleteConfirmation().then((result) => {
                    if (result == intranet.common.services.ModalResult.OK) {
                        this.translationService.deleteTranslation(item.id).success((response) => {
                            if (response.success) {
                                this.$scope.$broadcast('refreshGrid');
                            }
                            this.toasterService.showMessages(response.messages, 5000);
                        });
                    }
                });
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.$scope.search = { value: '', key: '', isUi: true };
                this.refreshGrid();
            }
        }
        admin.TranslationCtrl = TranslationCtrl;
        angular.module('intranet.admin').controller('translationCtrl', TranslationCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=TranslationCtrl.js.map