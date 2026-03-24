module intranet.admin {
    export interface ITranslationScope extends intranet.common.IScopeBase {
        search: any;
    }

    export class TranslationCtrl extends intranet.common.ControllerBase<ITranslationScope>
    {
        constructor($scope: ITranslationScope,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private $stateParams: any,
            private $q: ng.IQService,
            private translationService: services.TranslationService) {
            super($scope);
            //super.init(this);

            this.$scope.search = { value: '', key: '', isUi: true };
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            this.$scope.search.languageId = this.$stateParams.langId;
            var model = {
                params: params, filters: filters,
                searchQuery: this.$scope.search
            };
            return this.translationService.getTranslationsById(model);
        }

        private editTranslation(item: any): void {

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

            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.controller = 'addTranslationModalCtrl';
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

        private deleteTranslation(item: any): void {
            this.modalService.showDeleteConfirmation().then((result: any) => {
                if (result == common.services.ModalResult.OK) {
                    this.translationService.deleteTranslation(item.id).success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.$broadcast('refreshGrid');
                        }
                        this.toasterService.showMessages(response.messages, 5000);
                    });
                }
            });
        }

        public refreshGrid(): void {
            this.$scope.$broadcast('refreshGrid');
        }

        public resetCriteria(): void {
            this.$scope.search = { value: '', key: '', isUi: true };
            this.refreshGrid();
        }

    }

    angular.module('intranet.admin').controller('translationCtrl', TranslationCtrl);
}