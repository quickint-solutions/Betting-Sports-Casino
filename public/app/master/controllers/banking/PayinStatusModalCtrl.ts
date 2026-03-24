module intranet.master {
    export interface IPayinStatusModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        item: any;
        fairxpayinList: any[];
    }

    export class PayinStatusModalCtrl extends intranet.common.ControllerBase<IPayinStatusModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IPayinStatusModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private accountService: services.AccountService,
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
                this.$scope.item.amountNew = this.$filter('toRateOnly')(this.$scope.item.amount);
                this.$scope.item.bonusAmountNew = this.$filter('toRateOnly')(this.$scope.item.bonusAmount);
            }

            var gameType: any = common.enums.OffPayStatus;
            this.$scope.fairxpayinList = common.helpers.Utility.enumToArray<common.enums.OffPayStatus>(gameType);
            this.$scope.item.status = this.$scope.item.status.toString();
            this.$scope.item.oldstatus = this.$scope.item.status.toString();

            this.$scope.modalOptions.ok = result => {
                this.transferBalance();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        private getStatus(s: any): any {
            return common.enums.OffPayStatus[s];
        }

        private offerTickChanged() {
            if (this.$scope.item.removeOffer == true) { this.$scope.item.bonusAmountNew = 0; }
            else { this.$scope.item.bonusAmountNew = this.$filter('toRateOnly')(this.$scope.item.bonusAmount); }
        }

        private transferBalance(): void {
            var promise: ng.IHttpPromise<any>;
            var model = {
                id: this.$scope.item.id,
                status: this.$scope.item.status,
                removeOffer: this.$scope.item.removeOffer,
                utrNo: this.$scope.item.utr,
                amount: this.$filter('toGLC')(this.$scope.item.amountNew),
                bonusAmount: this.$filter('toGLC')(this.$scope.item.bonusAmountNew),
                comment: this.$scope.item.comment
            };
            promise = this.accountService.changeOffPayinRequestStatus(model);
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

        private getReceiptImage(request: any) {
            this.accountService.getPayInOutSlip(request.imageId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.showReceiptModal(this.$scope, response.data);
                    }
                });
        }

        private setComment(txt: any) { this.$scope.item.comment = txt; }
    }

    angular.module('intranet.master').controller('payinStatusModalCtrl', PayinStatusModalCtrl);
}