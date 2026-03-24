var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class TransferAllModalCtrl extends intranet.common.ControllerBase {
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
                    this.$scope.ids = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.transferBalance();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            transferBalance() {
                var model = { comment: this.$scope.comment, userIds: this.$scope.ids, timestamp: moment().format('x') };
                console.log(model);
            }
        }
        master.TransferAllModalCtrl = TransferAllModalCtrl;
        angular.module('intranet.master').controller('transferAllModalCtrl', TransferAllModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=TransferAllModalCtrl.js.map