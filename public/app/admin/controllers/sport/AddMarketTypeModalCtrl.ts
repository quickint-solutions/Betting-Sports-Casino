module intranet.admin {
    export interface IAddMarketTypeModalScope extends intranet.common.IScopeBase {
        modalOptions: common.services.ModalOptions;
        data: any;
    }

    export class AddMarketTypeModalCtrl extends intranet.common.ControllerBase<IAddMarketTypeModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddMarketTypeModalScope,
            private marketService: services.MarketService,
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
                this.saveCurrencyData();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private saveCurrencyData(): void {
            var promise;
            if (this.$scope.data.id) {
                promise = this.marketService.updateMarketTypeMapping(this.$scope.data);
            }
            else {
                promise = this.marketService.addMarketTypeMapping(this.$scope.data);
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


    angular.module('intranet.admin').controller('addMarketTypeModalCtrl', AddMarketTypeModalCtrl);
}