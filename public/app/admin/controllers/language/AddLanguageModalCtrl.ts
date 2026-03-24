module intranet.admin {
    export interface IAddLanguageModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        code: string;
        name: string;
        id: any;
    }

    export class AddLanguageModalCtrl extends intranet.common.ControllerBase<IAddLanguageModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddLanguageModalScope,
            private languageService: services.LanguageService,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveLanguage(): void {
            var model = { code: this.$scope.code, name: this.$scope.name, id: this.$scope.id };
            var promise: ng.IHttpPromise<any>;
            if (model.id) {
                promise = this.languageService.updateLanguage(model);
            } else {
                promise = this.languageService.addLanguage(model);
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

    angular.module('intranet.admin').controller('addLanguageModalCtrl', AddLanguageModalCtrl);
}