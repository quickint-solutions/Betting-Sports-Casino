module intranet.admin {

    export interface IViewRequestModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        request: any;
        wStatus: any[];
        transferProgress: boolean;
        existingStatus: string;
        transferMsg: any;
    }

    export class ViewRequestModalCtrl extends intranet.common.ControllerBase<IViewRequestModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IViewRequestModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private cryptoService: services.CryptoService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private $timeout: any,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.existingStatus = '';
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.request = {};
            if (this.modalOptions.data) {
                this.$scope.request = this.modalOptions.data;
            }

            this.$scope.existingStatus = this.$scope.request.status.toString();

            var has: any = common.enums.CryptoWithdrawalStatus;
            this.$scope.wStatus = common.helpers.Utility.enumToArray<common.enums.CryptoWithdrawalStatus>(has);
            this.$scope.wStatus = this.$scope.wStatus.filter((f: any) => { return f.id != common.enums.CryptoWithdrawalStatus.Confirm });
            if (!this.$scope.request.status) this.$scope.request.status = this.$scope.wStatus[2].id.toString();
            else { this.$scope.request.status = this.$scope.request.status.toString(); }

            if (this.$scope.request.status == common.enums.CryptoWithdrawalStatus.InProcess) {
                this.fetchTransactionStatus(this.$scope.request.transactionHash);
            }

            this.$scope.modalOptions.ok = result => {
                this.saveWithdrawalStatus();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({
                    data: null,
                    button: this.$scope.request.transactionHash ? common.services.ModalResult.OK : common.services.ModalResult.Cancel
                });
            };

        }

        private getTokenChain(c: any) { return common.enums.TokenChains[c]; }

        private copyAddress() { this.commonDataService.copyText(this.$scope.request.address); this.toasterService.showToast(common.helpers.ToastType.Info, "Copied", 2000); }

        private getTokenBalace() {
            this.cryptoService.getTokenBalance(this.$scope.request.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.request.tokenBalance = response.data.balance;
                    }
                });
        }

        private processWithdrawal() {
            this.$scope.transferProgress = true;
            this.cryptoService.processWithdrawal(this.$scope.request.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data && response.data.txDetails) {
                        this.$scope.request.transactionHash = response.data.txDetails.transactionHash;
                        this.$scope.transferMsg = "Wait for confirmation....";
                        this.fetchTransactionStatus(response.data.txDetails.transactionHash);
                    }
                }).finally(() => { this.$scope.transferProgress = false; });
        }

        private saveWithdrawalStatus(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.request.confirmed) { this.$scope.request.status = common.enums.CryptoWithdrawalStatus.Confirm; }
            if (this.$scope.request.id) {
                promise = this.cryptoService.updateWithdrawal(this.$scope.request.id, this.$scope.request.status);

                this.commonDataService.addPromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    } else {
                        this.$scope.messages = response.messages;
                    }
                });
            }

        }

        async fetchTransactionStatus(transactonHash: any) {
            const expectedBlockTime = 1000;
            var _web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');

            const sleep = (milliseconds) => {
                return new Promise(resolve => setTimeout(resolve, milliseconds))
            }

            let transactionReceipt = null
            while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
                transactionReceipt = await _web3.eth.getTransactionReceipt(transactonHash);
                await sleep(expectedBlockTime)
            }
            if (transactionReceipt && transactionReceipt.status == true) {
                this.$scope.transferMsg = 'Transfer succeed, window will close in 5 seconds';
                this.$scope.$apply();
                this.$timeout(() => {
                    this.$scope.request.status = common.enums.CryptoWithdrawalStatus.Confirm;
                    this.saveWithdrawalStatus();
                }, 5000);
            } else {
                this.$scope.transferMsg = 'Transfer failed, please check explorer';
            }
        }
    }
    angular.module('intranet.admin').controller('viewRequestModalCtrl', ViewRequestModalCtrl);
}