module intranet.master {

    export interface IAddAgentBannerModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        data: any;
    }

    export class AddAgentBannerModalCtrl extends intranet.common.ControllerBase<IAddAgentBannerModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IAddAgentBannerModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $uibModalInstance: any,
            private websiteService: services.WebsiteService,
            private commonDataService: common.services.CommonDataService,
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
                this.saveBanner();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

        }

        public loadInitialData(): void {

        }

        private showReceipt() {
            this.commonDataService.showReceiptModal(this.$scope, this.$scope.data.imageContent);
        }

        private saveBanner(): void {
            var promise: ng.IHttpPromise<any>;
            var model: any = {};
            angular.copy(this.$scope.data, model);
            model.isActive = true;
            promise = this.websiteService.addAgentBanner(model);
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.toasterService.showMessages(response.messages, 3000);
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                } else {
                    this.$scope.messages = response.messages;
                }
            });
        }
    }
    angular.module('intranet.master').controller('addAgentBannerModalCtrl', AddAgentBannerModalCtrl);
}