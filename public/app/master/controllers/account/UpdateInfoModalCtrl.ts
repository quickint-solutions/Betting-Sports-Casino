module intranet.master {
    export interface IUpdateInfoModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        data: any;
    }

    export class UpdateInfoModalCtrl extends intranet.common.ControllerBase<IUpdateInfoModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IUpdateInfoModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private websiteService: services.WebsiteService,
            private commonDataService: common.services.CommonDataService,
            private $filter: any,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
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
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            this.getSupportDetail();
        }

        private getSupportDetail() {
            this.commonDataService.getSupportDetails().then((data: any) => {
                this.$scope.data.whatsapp = JSON.parse(data.supportDetails).whatsapp;
            });
        }

        private save(): void {
            if (this.$scope.data.newWhatsapp) {
                var model = { whatsApp: 'https://wa.me/+' + this.$scope.data.newWhatsapp };
                var promise: ng.IHttpPromise<any>;
                promise = this.websiteService.updateWhatsapp(model);
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
    }

    angular.module('intranet.master').controller('updateInfoModalCtrl', UpdateInfoModalCtrl);
}