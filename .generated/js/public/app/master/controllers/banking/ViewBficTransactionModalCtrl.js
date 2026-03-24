var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class ViewBficTransactionModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, $uibModalInstance, modalOptions) {
                super($scope);
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.item = this.modalOptions.data;
                }
                this.$scope.statusList = [];
                this.$scope.statusList.push({ id: '', name: 'All' });
                this.$scope.statusList.push({ id: 1, name: 'Init' });
                this.$scope.statusList.push({ id: 2, name: 'Confirmed' });
                this.$scope.modalOptions.ok = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            getStatus(s) { return this.$scope.statusList[s].name; }
        }
        master.ViewBficTransactionModalCtrl = ViewBficTransactionModalCtrl;
        angular.module('intranet.master').controller('viewBficTransactionModalCtrl', ViewBficTransactionModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ViewBficTransactionModalCtrl.js.map