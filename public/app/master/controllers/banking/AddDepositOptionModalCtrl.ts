module intranet.master {
    export interface IAddDepositOptionModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        item: any;
        depositOptions: any[];
    }

    export class AddDepositOptionModalCtrl extends intranet.common.ControllerBase<IAddDepositOptionModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddDepositOptionModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private paymentService: services.PaymentService,
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
            if (this.modalOptions.data) {
                this.$scope.item = this.modalOptions.data;
            }

            var dOption: any = common.enums.DepositOptinos;
            this.$scope.depositOptions = common.helpers.Utility.enumToArray<common.enums.DepositOptinos>(dOption);
            if (!this.$scope.item.detailType) { this.$scope.item.detailType = this.$scope.depositOptions[0].id.toString(); }
            else { this.$scope.item.detailType = this.$scope.item.detailType.toString(); }

            this.$scope.item.minDeposit = this.$filter('toRateOnly')(this.$scope.item.minDeposit);
            this.$scope.item.maxDeposit = this.$filter('toRateOnly')(this.$scope.item.maxDeposit);

            this.$scope.modalOptions.ok = result => {
                this.saveDetail();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private getOptionsName(d: any) { return common.enums.DepositOptinos[d]; }

        private saveDetail(): void {
            var promise: ng.IHttpPromise<any>;
            this.$scope.item.minDeposit = this.$filter('toGLC')(this.$scope.item.minDeposit);
            this.$scope.item.maxDeposit = this.$filter('toGLC')(this.$scope.item.maxDeposit);

            if (this.$scope.item.id) {
                promise = this.paymentService.updateBankDetails(this.$scope.item);
            }
            else {
                promise = this.paymentService.addBankDetails(this.$scope.item);
            }
            if (promise) {
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

    angular.module('intranet.master').controller('addDepositOptionModalCtrl', AddDepositOptionModalCtrl);
}