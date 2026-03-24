var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class VoidBetsModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, $translate, betService, betHistoryService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.$translate = $translate;
                this.betService = betService;
                this.betHistoryService = betHistoryService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.fromHistory = false;
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.request = {};
                if (this.modalOptions.data) {
                    this.$scope.request = this.modalOptions.data;
                    this.$scope.fromHistory = this.modalOptions.data.fromHistory;
                }
                this.$scope.modalOptions.ok = result => {
                    this.voidBet();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            voidBet() {
                var promise;
                if (this.$scope.request.betIds && this.$scope.request.betIds.length > 0) {
                    if (this.$scope.fromHistory == true) {
                        promise = this.betHistoryService.voidBets(this.$scope.request);
                    }
                    else {
                        promise = this.betService.voidBets(this.$scope.request);
                    }
                }
                else if (this.$scope.fromHistory == true) {
                    promise = this.betHistoryService.voidBet(this.$scope.request);
                }
                else {
                    promise = this.betService.voidBet(this.$scope.request);
                }
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
        admin.VoidBetsModalCtrl = VoidBetsModalCtrl;
        angular.module('intranet.admin').controller('voidBetsModalCtrl', VoidBetsModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=VoidBetsModalCtrl.js.map