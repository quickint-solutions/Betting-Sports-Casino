module intranet.master {
    export interface IPaymorPayoutStatusModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        item: any;
        payoutList: any[];

        isLoading: boolean;
    }

    export class PaymorPayoutStatusModalCtrl extends intranet.common.ControllerBase<IPaymorPayoutStatusModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IPaymorPayoutStatusModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private accountService: services.AccountService,
            private commonDataService: common.services.CommonDataService,
            private $timeout: any,
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

            this.$scope.payoutList = [];
            this.$scope.payoutList.push({ id: '1', name: 'Process' });
            this.$scope.payoutList.push({ id: '0', name: 'Reject' });

            this.$scope.item.oldstatus = this.$scope.item.status.toString();
            this.$scope.item.status = '1';

            this.$scope.modalOptions.ok = result => {
                this.transferBalance();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private getStatus(s: any): any {
            return common.enums.PaymorPayoutStatus[s];
        }

        private transferBalance(): void {
            var promise: ng.IHttpPromise<any>;
            var model = {
                orderid: this.$scope.item.id,
                status: this.$scope.item.status == '1' ? true : false,
                note: this.$scope.item.comment,
            }
            promise = this.accountService.processPaymorPayout(model);
            if (promise) {
                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$rootScope.$emit('dw-status-changed');
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }

        private showReceipt() {
            this.commonDataService.showReceiptModal(this.$scope, this.$scope.item.payOutSlip);
        }


    }

    angular.module('intranet.master').controller('paymorPayoutStatusModalCtrl', PaymorPayoutStatusModalCtrl);
}