module intranet.admin {

    export interface IAddIpModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        ip: any;
    }

    export class AddIpModalCtrl extends intranet.common.ControllerBase<IAddIpModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddIpModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $uibModalInstance: any,
            private tokenService: services.TokenService,
            private commonDataService: common.services.CommonDataService,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;

            this.$scope.modalOptions.ok = result => {
                this.saveIP();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveIP(): void {
            var promise: ng.IHttpPromise<any>;
            promise = this.tokenService.blockIP(this.$scope.ip);
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
    angular.module('intranet.admin').controller('addIpModalCtrl', AddIpModalCtrl);
}