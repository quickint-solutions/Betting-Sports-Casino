var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class SetDWLimitsModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, websiteService, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.websiteService = websiteService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.item = {};
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.item = this.modalOptions.data;
                    this.$scope.item.minDeposit = this.$filter('toRateOnly')(this.$scope.item.minDeposit);
                    this.$scope.item.maxDeposit = this.$filter('toRateOnly')(this.$scope.item.maxDeposit);
                    this.$scope.item.minWithdrwal = this.$filter('toRateOnly')(this.$scope.item.minWithdrwal);
                    this.$scope.item.maxWithdrwal = this.$filter('toRateOnly')(this.$scope.item.maxWithdrwal);
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveDetail() {
                var promise;
                var model = {};
                model.minDeposit = this.$filter('toGLC')(this.$scope.item.minDeposit);
                model.maxDeposit = this.$filter('toGLC')(this.$scope.item.maxDeposit);
                model.minWithdrwal = this.$filter('toGLC')(this.$scope.item.minWithdrwal);
                model.maxWithdrwal = this.$filter('toGLC')(this.$scope.item.maxWithdrwal);
                promise = this.websiteService.updateOffPaymentDetails(model);
                if (promise) {
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
        }
        master.SetDWLimitsModalCtrl = SetDWLimitsModalCtrl;
        angular.module('intranet.master').controller('setDWLimitsModalCtrl', SetDWLimitsModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SetDWLimitsModalCtrl.js.map