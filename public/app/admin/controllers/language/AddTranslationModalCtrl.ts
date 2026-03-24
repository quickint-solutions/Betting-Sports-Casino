module intranet.admin {

    export interface IAddTranslationModalScope extends intranet.common.IScopeBase {
        modalOptions: common.services.ModalOptions;
        data: any;

        langKey: string;
        isUI: boolean;
    }

    export class AddTranslationModalCtrl extends intranet.common.ControllerBase<IAddTranslationModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddTranslationModalScope,
            private translationService: services.TranslationService,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.langKey = '';
            this.$scope.isUI = true;
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.data = this.modalOptions.data;

            this.$scope.modalOptions.ok = result => {
                this.saveTranslations();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveTranslations(): void {
            var model: any;
            var promise: ng.IHttpPromise<any>;
            if (this.modalOptions.newRecord) {
                model = { Key: this.$scope.langKey, TranslationValues: [], IsUI: this.$scope.isUI };
                angular.forEach(this.$scope.data, (val: any) => {
                    model.TranslationValues.push({ LanguageId: val.id, value: val.value });
                });
                promise = this.translationService.addTranslations(model);
            } else {
                model = {
                    id: this.$scope.data.translationId,
                    value: this.$scope.data.value,
                    key: this.$scope.data.key,
                    IsUI: this.$scope.data.isUI
                };
                promise = this.translationService.updateTranslations(model);
            }
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.toasterService.showMessages(response.messages, 3000);
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                }
                else {
                    this.$scope.messages = response.messages;
                }
            });

        }
    }

    angular.module('intranet.admin').controller('addTranslationModalCtrl', AddTranslationModalCtrl);
}