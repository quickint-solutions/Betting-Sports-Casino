module intranet.admin {
    export interface IAddCurrencyModalScope extends intranet.common.IScopeBase {
        modalOptions: common.services.ModalOptions;
        data: any;
    }

    export class AddCurrencyModalCtrl extends intranet.common.ControllerBase<IAddCurrencyModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddCurrencyModalScope,
            private currencyService: services.CurrencyService,
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
                promise = this.currencyService.updateCurrency(this.$scope.data);
            }
            else {
                promise = this.currencyService.addCurrency(this.$scope.data);
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


    angular.module('intranet.admin').controller('addCurrencyModalCtrl', AddCurrencyModalCtrl);
}