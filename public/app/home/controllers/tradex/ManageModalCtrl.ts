module intranet.tradex {

    export interface IManageModalScope extends intranet.common.IScopeBase {
        modalOptions: any;

        order: any;


        limitType: any;

        model: any;
    }

    export class TradexManageModalCtrl extends intranet.common.ControllerBase<IManageModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IManageModalScope,
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
            this.$scope.messages = [];
            this.$scope.model = { orderType: {}, limitType: {} };

            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.order = this.modalOptions.data.order;
            }

            this.$scope.modalOptions.ok = result => {
                this.placeOrder();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.loadLimitTypes();
        }


        private loadLimitTypes(): void {
            var limitTypes: any[] = [];
            limitTypes.push({ id: 1, type: 'Buy Limit', transactionType: 1 });
            limitTypes.push({ id: 2, type: 'Buy Stop', transactionType: 1 });
            limitTypes.push({ id: -1, type: 'Sell Limit', transactionType: -1 });
            limitTypes.push({ id: -2, type: 'Sell Stop', transactionType: -1 });

            var result = limitTypes.filter((l: any) => { return l.id == this.$scope.order.BuySell; });
            if (result.length > 0) {
                this.$scope.limitType = result[0];
            }
        }


        private placeOrder(): void {
            var user = this.localStorageHelper.get(this.settings.VertexUser);
            if (user) {
                var promise: ng.IHttpPromise<any>;

                if (!this.$scope.order.ManagedTKTID) {
                    promise = this.vertextService.updateLimitOrder(user.SelectedAccount, this.$scope.order.ID, this.$scope.order.OpenPrice, this.$scope.order.Amount, this.$scope.order.Note, this.$scope.order.SL, this.$scope.order.TP);
                } else {
                    promise = this.vertextService.updateSLTP(user.SelectedAccount, this.$scope.order.ID, this.$scope.order.Amount, this.$scope.order.SL, this.$scope.order.TP);
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
    angular.module('intranet.tradex').controller('tradexManageModalCtrl', TradexManageModalCtrl);
}