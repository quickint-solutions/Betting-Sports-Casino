module intranet.admin {

    export interface IEditCloseMarketModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        market: any;
    }

    export class EditCloseMarketModalCtrl extends intranet.common.ControllerBase<IEditCloseMarketModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IEditCloseMarketModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private marketService: services.MarketService,
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
                this.$scope.market = this.modalOptions.data;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveEventTypeDetail();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
        }

        private saveEventTypeDetail(): void {

            var promise: ng.IHttpPromise<any>;
            if (this.$scope.market.id) {
                promise = this.marketService.updateSettleMarket(this.$scope.market)
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
    }
    angular.module('intranet.admin').controller('editCloseMarketModalCtrl', EditCloseMarketModalCtrl);
}