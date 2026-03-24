var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class PayinStatusModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, accountService, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.item = this.modalOptions.data;
                    this.$scope.item.amountNew = this.$filter('toRateOnly')(this.$scope.item.amount);
                    this.$scope.item.bonusAmountNew = this.$filter('toRateOnly')(this.$scope.item.bonusAmount);
                }
                var gameType = intranet.common.enums.OffPayStatus;
                this.$scope.fairxpayinList = intranet.common.helpers.Utility.enumToArray(gameType);
                this.$scope.item.status = this.$scope.item.status.toString();
                this.$scope.item.oldstatus = this.$scope.item.status.toString();
                this.$scope.modalOptions.ok = result => {
                    this.transferBalance();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            getStatus(s) {
                return intranet.common.enums.OffPayStatus[s];
            }
            offerTickChanged() {
                if (this.$scope.item.removeOffer == true) {
                    this.$scope.item.bonusAmountNew = 0;
                }
                else {
                    this.$scope.item.bonusAmountNew = this.$filter('toRateOnly')(this.$scope.item.bonusAmount);
                }
            }
            transferBalance() {
                var promise;
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
                    promise.success((response) => {
                        if (response.success) {
                            this.$rootScope.$emit('dw-status-changed');
                            this.toasterService.showMessages(response.messages, 3000);
                            this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                        }
                        else {
                            this.$scope.messages = response.messages;
                        }
                    });
                }
            }
            getReceiptImage(request) {
                this.accountService.getPayInOutSlip(request.imageId)
                    .success((response) => {
                    if (response.success) {
                        this.commonDataService.showReceiptModal(this.$scope, response.data);
                    }
                });
            }
            setComment(txt) { this.$scope.item.comment = txt; }
        }
        master.PayinStatusModalCtrl = PayinStatusModalCtrl;
        angular.module('intranet.master').controller('payinStatusModalCtrl', PayinStatusModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PayinStatusModalCtrl.js.map