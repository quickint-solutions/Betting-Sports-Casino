module intranet.master {

    export interface IMarketParamModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        market: any;
        userMarketList: any[];
    }

    export class MarketParamModalCtrl extends intranet.common.ControllerBase<IMarketParamModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IMarketParamModalScope,
            private userMarketService: services.UserMarketService,
            private toasterService: intranet.common.services.ToasterService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.userMarketList = [];
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.market = this.modalOptions.data;
            }
            this.$scope.modalOptions.ok = result => {
                this.updateMarketParam();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            var types: any = common.enums.UserMarketStatus;
            this.$scope.userMarketList = common.helpers.Utility.enumToArray<common.enums.UserMarketStatus>(types);
        }

        private updateMarketParam(): void {
            this.userMarketService.updateUserMarketParams(this.$scope.market)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                    } else {
                        this.$scope.messages = response.messages;
                    }
                });
        }
    }

    angular.module('intranet.master').controller('marketParamModalCtrl', MarketParamModalCtrl);
}