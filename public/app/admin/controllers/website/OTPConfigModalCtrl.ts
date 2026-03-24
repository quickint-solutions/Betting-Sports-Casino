module intranet.admin {
    export interface IOTPConfigModalScope extends intranet.common.IScopeBase {
        modalOptions: common.services.ModalOptions;
        data: any;
    }

    export class OTPConfigModalCtrl extends intranet.common.ControllerBase<IOTPConfigModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IOTPConfigModalScope,
            private websiteService: services.WebsiteService,
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
            this.$scope.data = {};

            if (this.modalOptions.data) { this.$scope.data = this.modalOptions.data; }

            this.$scope.modalOptions.ok = result => {
                this.saveOtpConfigData();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            
        }

        private saveOtpConfigData(): void {
            var promise;

            promise = this.websiteService.updateOTPConfig(this.$scope.data);

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


    angular.module('intranet.admin').controller('otpConfigModalCtrl', OTPConfigModalCtrl);
}