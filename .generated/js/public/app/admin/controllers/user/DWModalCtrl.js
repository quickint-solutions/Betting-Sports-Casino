var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class DWModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $translate, accountService, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$translate = $translate;
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.forMaster = false;
                this.$scope.isTransfer = true;
                this.$scope.creditTypeList = [];
                this.$scope.creditTypeList.push({ id: 1, name: 'Chips' });
                this.$scope.creditTypeList.push({ id: 2, name: 'Casino' });
                this.$scope.selectedCreditType = { creditType: 1 };
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.request = {};
                this.$scope.request.dwType = 'D';
                if (this.modalOptions.data) {
                    this.$scope.request.userId = this.modalOptions.data.userId;
                    this.$scope.forMaster = this.modalOptions.data.forMaster;
                    this.$scope.isTransfer = this.modalOptions.data.isTransfer;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveDW();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            creditTypeChanged(selected) {
                this.$scope.selectedCreditType.creditType = selected;
            }
            saveDW() {
                var promise;
                var model = {
                    isTransfer: true,
                    chips: this.$filter('toGLC')(this.$scope.request.chips),
                    userId: this.$scope.request.userId,
                    dwType: this.$scope.request.dwType,
                    comment: this.$scope.request.remarks,
                    timestamp: moment().format('x')
                };
                if (model.dwType == 'D') {
                    promise = this.accountService.IN(model);
                }
                else {
                    promise = this.accountService.OUT(model);
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
        admin.DWModalCtrl = DWModalCtrl;
        angular.module('intranet.admin').controller('dwModalCtrl', DWModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=DWModalCtrl.js.map