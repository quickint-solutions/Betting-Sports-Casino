module intranet.admin {

    export interface IAddTokenModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        token: any;
        tokenChains: any[];
        tokenHas: any[];
    }

    export class AddTokenModalCtrl extends intranet.common.ControllerBase<IAddTokenModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddTokenModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private cryptoService: services.CryptoService,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.token = {};
            if (this.modalOptions.data) {
                this.$scope.token = this.modalOptions.data;
            }

            var chains: any = common.enums.TokenChains;
            this.$scope.tokenChains = common.helpers.Utility.enumToArray<common.enums.TokenChains>(chains);
            if (!this.$scope.token.chain) this.$scope.token.chain = this.$scope.tokenChains[0].id.toString();
            else { this.$scope.token.chain = this.$scope.token.chain.toString();}

            var has: any = common.enums.TokenHas;
            this.$scope.tokenHas = common.helpers.Utility.enumToArray<common.enums.TokenHas>(has);
            if (!this.$scope.token.tokenHas) this.$scope.token.tokenHas = this.$scope.tokenHas[2].id.toString();
            else { this.$scope.token.tokenHas = this.$scope.token.tokenHas.toString(); }


            this.$scope.modalOptions.ok = result => {
                this.saveTokenDetail();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }


        private saveTokenDetail(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.token.id) {
                promise = this.cryptoService.updateCryptoToken(this.$scope.token);
            }
            else { promise = this.cryptoService.addCryptoToken(this.$scope.token); }

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
    angular.module('intranet.admin').controller('addTokenModalCtrl', AddTokenModalCtrl);
}