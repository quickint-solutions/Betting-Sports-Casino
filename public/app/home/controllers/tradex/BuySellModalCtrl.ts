module intranet.tradex {

    export interface IBuySellModalScope extends intranet.common.IScopeBase {
        modalOptions: any;

        symbol: any;
        transactionType: any;
        orderTypes: any[];
        limitTypes: any[];

        model: any;
    }

    export class TradexBuySellModalCtrl extends intranet.common.ControllerBase<IBuySellModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IBuySellModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private vertexHelper: common.helpers.VertexHelper,
            private vertextService: services.VertextService,
            private settings: common.IBaseSettings,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.transactionType = 1;
            this.$scope.messages = [];
            this.$scope.orderTypes = [];
            this.$scope.limitTypes = [];
            this.$scope.model = { orderType: {}, limitType: {} };

            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.symbol = this.modalOptions.data.symbol;
                this.$scope.transactionType = this.modalOptions.data.transactionType;
            }

            this.$scope.modalOptions.ok = result => {
                this.placeOrder();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.loadOrderTypes();
            this.loadLimitTypes();
        }

        private loadOrderTypes(): void {
            this.$scope.orderTypes.push({ id: 1, type: 'Market Order' });
            this.$scope.orderTypes.push({ id: 2, type: 'Limit Order' });
            this.$scope.model.orderType = this.$scope.orderTypes[0];
        }

        private loadLimitTypes(): void {
            this.$scope.limitTypes.push({ id: 1, type: 'Buy Limit', transactionType: 1 });
            this.$scope.limitTypes.push({ id: 2, type: 'Buy Stop', transactionType: 1 });
            this.$scope.limitTypes.push({ id: -1, type: 'Sell Limit', transactionType: -1 });
            this.$scope.limitTypes.push({ id: -2, type: 'Sell Stop', transactionType: -1 });
            if (this.$scope.transactionType == 1) { this.$scope.model.limitType = this.$scope.limitTypes[0]; }
            else { this.$scope.model.limitType = this.$scope.limitTypes[2]; }
        }

        private transactionTypeChanged(): void {
            this.$scope.transactionType = (this.$scope.transactionType * -1);
            if (this.$scope.transactionType == 1) { this.$scope.model.limitType = this.$scope.limitTypes[0]; }
            else { this.$scope.model.limitType = this.$scope.limitTypes[2]; }
        }

        private placeOrder(): void {
            var user = this.localStorageHelper.get(this.settings.VertexUser);
            if (user) {
                var promise: ng.IHttpPromise<any>;

                if (this.$scope.model.orderType.id == 1) {
                    promise = this.vertextService.newOrder(user.SelectedAccount, this.$scope.symbol.ID, this.$scope.transactionType, this.$scope.model.amount, this.$scope.model.note)
                } else {
                    promise = this.vertextService.newLimitOrder(user.SelectedAccount, this.$scope.symbol.ID, this.$scope.model.limitType.id, this.$scope.model.limitPrice, this.$scope.model.amount, this.$scope.model.note, this.$scope.model.sl, this.$scope.model.tp);
                }


                if (promise) {
                    this.commonDataService.addPromise(promise);
                    promise.success((response: any) => {
                        if (this.vertexHelper.validate(response)) {
                            this.toasterService.showToast(common.helpers.ToastType.Success, 'Order placed successfully', 3000);
                            this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                        }
                    });
                }
            }
        }
    }
    angular.module('intranet.tradex').controller('tradexBuySellModalCtrl', TradexBuySellModalCtrl);
}