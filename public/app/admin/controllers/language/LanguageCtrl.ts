module intranet.admin {
    export interface ILanguageScope extends intranet.common.IScopeBase {
        listNewItems: any[];
        gridData: any;
    }

    export class LanguageCtrl extends intranet.common.ControllerBase<ILanguageScope>
        implements intranet.common.init.IInit {
        constructor($scope: ILanguageScope,
            private $state: any,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private languageService: services.LanguageService) {
            super($scope);
            
            var newPageLoadedListener = this.$scope.$on('newPageLoaded', (e: any, data: any) => {
                this.$scope.gridData = data.result;
            });

            this.$scope.$on('$destroy', () => {
                newPageLoadedListener();
            });

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.listNewItems = [];
        }

        public loadInitialData(): void { this.loadButtonItems(); }

        private loadButtonItems(): void {
            this.$scope.listNewItems.push({
                func: () => this.addEditLanguage(),
                name: 'language.addnew.button.label'
            });
            this.$scope.listNewItems.push({
                func: () => this.addTranslation(),
                name: 'translation.addnew.button.label'
            });
        }

        private addTranslation() {
            var options = new intranet.common.services.ModalOptions();
            options.header = 'admin.translation.modal.header';
            options.bodyUrl = this.settings.ThemeName + '/admin/language/add-translation-modal.html';
            options.data = this.$scope.gridData;

            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.controller = 'addTranslationModalCtrl';
            modalDefaults.resolve = {
                modalOptions: () => {
                    return options;
                }
            };
            this.modalService.showWithOptions(options, modalDefaults);
        }

        private addEditLanguage(item: any = null) {
            var options = new intranet.common.services.ModalOptions();
            if (item) {
                options.header = 'admin.language.edit.modal.header';
                options.data = item;
            }
            else {
                options.header = 'admin.language.add.modal.header';
            }
            options.bodyUrl = this.settings.ThemeName + '/admin/language/add-language-modal.html';

            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.controller = 'addLanguageModalCtrl';
            modalDefaults.resolve = {
                modalOptions: () => {
                    return options;
                }
            };

            this.modalService.showWithOptions(options, modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }

        private deleteLanguage(item: any): void {
            this.modalService.showDeleteConfirmation().then((result: any) => {
                if (result == common.services.ModalResult.OK) {
                    this.languageService.deleteLanguage(item.id).success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.$broadcast('refreshGrid');
                        }
                        this.toasterService.showMessages(response.messages, 5000);
                    });
                }
            });
        }

        private viewTranslations(item: any): void {
            this.$state.go('admin.languages.translations', { langId: item.id, langName: item.name.toLowerCase() });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.languageService.getLanguage(model);
        }
    }
    angular.module('intranet.admin').controller('languageCtrl', LanguageCtrl);
}