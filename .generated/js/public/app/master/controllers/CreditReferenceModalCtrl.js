var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class CreditReferenceModalCtrl extends intranet.common.ControllerBase {
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
                this.$scope.creditRef = {};
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.creditRef.current = this.modalOptions.data.current;
                    this.$scope.creditRef.userId = this.modalOptions.data.userId;
                    this.$scope.creditRef.isCasino = this.modalOptions.data.isCasino;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveCreditReference();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveCreditReference() {
                var promise;
                var ref = {
                    creditRef: 0,
                    userId: this.$scope.creditRef.userId,
                    password: this.$scope.creditRef.password
                };
                if (this.$scope.creditRef.isCasino) {
                    ref.creditRef = (this.$scope.creditRef.creditRef),
                        promise = this.accountService.updateCasinoCreditRef(ref);
                }
                else {
                    ref.creditRef = this.$filter('toGLC')(this.$scope.creditRef.creditRef),
                        promise = this.accountService.updateCreditRef(ref);
                }
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
        master.CreditReferenceModalCtrl = CreditReferenceModalCtrl;
        angular.module('intranet.master').controller('creditReferenceModalCtrl', CreditReferenceModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CreditReferenceModalCtrl.js.map