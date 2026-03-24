var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class LanguageCtrl extends intranet.common.ControllerBase {
            constructor($scope, $state, toasterService, modalService, settings, languageService) {
                super($scope);
                this.$state = $state;
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.settings = settings;
                this.languageService = languageService;
                var newPageLoadedListener = this.$scope.$on('newPageLoaded', (e, data) => {
                    this.$scope.gridData = data.result;
                });
                this.$scope.$on('$destroy', () => {
                    newPageLoadedListener();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.listNewItems = [];
            }
            loadInitialData() { this.loadButtonItems(); }
            loadButtonItems() {
                this.$scope.listNewItems.push({
                    func: () => this.addEditLanguage(),
                    name: 'language.addnew.button.label'
                });
                this.$scope.listNewItems.push({
                    func: () => this.addTranslation(),
                    name: 'translation.addnew.button.label'
                });
            }
            addTranslation() {
                var options = new intranet.common.services.ModalOptions();
                options.header = 'admin.translation.modal.header';
                options.bodyUrl = this.settings.ThemeName + '/admin/language/add-translation-modal.html';
                options.data = this.$scope.gridData;
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.controller = 'addTranslationModalCtrl';
                modalDefaults.resolve = {
                    modalOptions: () => {
                        return options;
                    }
                };
                this.modalService.showWithOptions(options, modalDefaults);
            }
            addEditLanguage(item = null) {
                var options = new intranet.common.services.ModalOptions();
                if (item) {
                    options.header = 'admin.language.edit.modal.header';
                    options.data = item;
                }
                else {
                    options.header = 'admin.language.add.modal.header';
                }
                options.bodyUrl = this.settings.ThemeName + '/admin/language/add-language-modal.html';
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.controller = 'addLanguageModalCtrl';
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
            deleteLanguage(item) {
                this.modalService.showDeleteConfirmation().then((result) => {
                    if (result == intranet.common.services.ModalResult.OK) {
                        this.languageService.deleteLanguage(item.id).success((response) => {
                            if (response.success) {
                                this.$scope.$broadcast('refreshGrid');
                            }
                            this.toasterService.showMessages(response.messages, 5000);
                        });
                    }
                });
            }
            viewTranslations(item) {
                this.$state.go('admin.languages.translations', { langId: item.id, langName: item.name.toLowerCase() });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.languageService.getLanguage(model);
            }
        }
        admin.LanguageCtrl = LanguageCtrl;
        angular.module('intranet.admin').controller('languageCtrl', LanguageCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LanguageCtrl.js.map