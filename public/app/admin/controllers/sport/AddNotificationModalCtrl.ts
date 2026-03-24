module intranet.admin {

    export interface IAddNotificationModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        market: any;
    }

    export class AddNotificationModalCtrl extends intranet.common.ControllerBase<IAddNotificationModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddNotificationModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private $uibModalInstance: any,
            private marketService: services.MarketService,
            private commonDataService: common.services.CommonDataService,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.market = {};
            if (this.modalOptions.data) {
                this.$scope.market = this.modalOptions.data;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveNotification();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveNotification(): void {
            var promise: ng.IHttpPromise<any>;
            var model = { id: this.$scope.market.id, notification: this.$scope.market.notification };
            promise = this.marketService.setNotification(model);
           
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
    angular.module('intranet.admin').controller('addNotificationModalCtrl', AddNotificationModalCtrl);
}