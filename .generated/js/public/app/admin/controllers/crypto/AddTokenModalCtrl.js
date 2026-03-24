var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddTokenModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, cryptoService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.cryptoService = cryptoService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.token = {};
                if (this.modalOptions.data) {
                    this.$scope.token = this.modalOptions.data;
                }
                var chains = intranet.common.enums.TokenChains;
                this.$scope.tokenChains = intranet.common.helpers.Utility.enumToArray(chains);
                if (!this.$scope.token.chain)
                    this.$scope.token.chain = this.$scope.tokenChains[0].id.toString();
                else {
                    this.$scope.token.chain = this.$scope.token.chain.toString();
                }
                var has = intranet.common.enums.TokenHas;
                this.$scope.tokenHas = intranet.common.helpers.Utility.enumToArray(has);
                if (!this.$scope.token.tokenHas)
                    this.$scope.token.tokenHas = this.$scope.tokenHas[2].id.toString();
                else {
                    this.$scope.token.tokenHas = this.$scope.token.tokenHas.toString();
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveTokenDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            saveTokenDetail() {
                var promise;
                if (this.$scope.token.id) {
                    promise = this.cryptoService.updateCryptoToken(this.$scope.token);
                }
                else {
                    promise = this.cryptoService.addCryptoToken(this.$scope.token);
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
        admin.AddTokenModalCtrl = AddTokenModalCtrl;
        angular.module('intranet.admin').controller('addTokenModalCtrl', AddTokenModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddTokenModalCtrl.js.map