var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ViewRequestModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, cryptoService, commonDataService, $uibModalInstance, $timeout, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.cryptoService = cryptoService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.$timeout = $timeout;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.existingStatus = '';
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.request = {};
                if (this.modalOptions.data) {
                    this.$scope.request = this.modalOptions.data;
                }
                this.$scope.existingStatus = this.$scope.request.status.toString();
                var has = intranet.common.enums.CryptoWithdrawalStatus;
                this.$scope.wStatus = intranet.common.helpers.Utility.enumToArray(has);
                this.$scope.wStatus = this.$scope.wStatus.filter((f) => { return f.id != intranet.common.enums.CryptoWithdrawalStatus.Confirm; });
                if (!this.$scope.request.status)
                    this.$scope.request.status = this.$scope.wStatus[2].id.toString();
                else {
                    this.$scope.request.status = this.$scope.request.status.toString();
                }
                if (this.$scope.request.status == intranet.common.enums.CryptoWithdrawalStatus.InProcess) {
                    this.fetchTransactionStatus(this.$scope.request.transactionHash);
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveWithdrawalStatus();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({
                        data: null,
                        button: this.$scope.request.transactionHash ? intranet.common.services.ModalResult.OK : intranet.common.services.ModalResult.Cancel
                    });
                };
            }
            getTokenChain(c) { return intranet.common.enums.TokenChains[c]; }
            copyAddress() { this.commonDataService.copyText(this.$scope.request.address); this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Copied", 2000); }
            getTokenBalace() {
                this.cryptoService.getTokenBalance(this.$scope.request.id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.request.tokenBalance = response.data.balance;
                    }
                });
            }
            processWithdrawal() {
                this.$scope.transferProgress = true;
                this.cryptoService.processWithdrawal(this.$scope.request.id)
                    .success((response) => {
                    if (response.success && response.data && response.data.txDetails) {
                        this.$scope.request.transactionHash = response.data.txDetails.transactionHash;
                        this.$scope.transferMsg = "Wait for confirmation....";
                        this.fetchTransactionStatus(response.data.txDetails.transactionHash);
                    }
                }).finally(() => { this.$scope.transferProgress = false; });
            }
            saveWithdrawalStatus() {
                var promise;
                if (this.$scope.request.confirmed) {
                    this.$scope.request.status = intranet.common.enums.CryptoWithdrawalStatus.Confirm;
                }
                if (this.$scope.request.id) {
                    promise = this.cryptoService.updateWithdrawal(this.$scope.request.id, this.$scope.request.status);
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
            fetchTransactionStatus(transactonHash) {
                return __awaiter(this, void 0, void 0, function* () {
                    const expectedBlockTime = 1000;
                    var _web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');
                    const sleep = (milliseconds) => {
                        return new Promise(resolve => setTimeout(resolve, milliseconds));
                    };
                    let transactionReceipt = null;
                    while (transactionReceipt == null) {
                        transactionReceipt = yield _web3.eth.getTransactionReceipt(transactonHash);
                        yield sleep(expectedBlockTime);
                    }
                    if (transactionReceipt && transactionReceipt.status == true) {
                        this.$scope.transferMsg = 'Transfer succeed, window will close in 5 seconds';
                        this.$scope.$apply();
                        this.$timeout(() => {
                            this.$scope.request.status = intranet.common.enums.CryptoWithdrawalStatus.Confirm;
                            this.saveWithdrawalStatus();
                        }, 5000);
                    }
                    else {
                        this.$scope.transferMsg = 'Transfer failed, please check explorer';
                    }
                });
            }
        }
        admin.ViewRequestModalCtrl = ViewRequestModalCtrl;
        angular.module('intranet.admin').controller('viewRequestModalCtrl', ViewRequestModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ViewRequestModalCtrl.js.map