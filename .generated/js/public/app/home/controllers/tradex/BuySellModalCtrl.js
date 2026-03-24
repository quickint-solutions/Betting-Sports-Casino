var intranet;
(function (intranet) {
    var tradex;
    (function (tradex) {
        class TradexBuySellModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, localStorageHelper, vertexHelper, vertextService, settings, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.localStorageHelper = localStorageHelper;
                this.vertexHelper = vertexHelper;
                this.vertextService = vertextService;
                this.settings = settings;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
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
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.loadOrderTypes();
                this.loadLimitTypes();
            }
            loadOrderTypes() {
                this.$scope.orderTypes.push({ id: 1, type: 'Market Order' });
                this.$scope.orderTypes.push({ id: 2, type: 'Limit Order' });
                this.$scope.model.orderType = this.$scope.orderTypes[0];
            }
            loadLimitTypes() {
                this.$scope.limitTypes.push({ id: 1, type: 'Buy Limit', transactionType: 1 });
                this.$scope.limitTypes.push({ id: 2, type: 'Buy Stop', transactionType: 1 });
                this.$scope.limitTypes.push({ id: -1, type: 'Sell Limit', transactionType: -1 });
                this.$scope.limitTypes.push({ id: -2, type: 'Sell Stop', transactionType: -1 });
                if (this.$scope.transactionType == 1) {
                    this.$scope.model.limitType = this.$scope.limitTypes[0];
                }
                else {
                    this.$scope.model.limitType = this.$scope.limitTypes[2];
                }
            }
            transactionTypeChanged() {
                this.$scope.transactionType = (this.$scope.transactionType * -1);
                if (this.$scope.transactionType == 1) {
                    this.$scope.model.limitType = this.$scope.limitTypes[0];
                }
                else {
                    this.$scope.model.limitType = this.$scope.limitTypes[2];
                }
            }
            placeOrder() {
                var user = this.localStorageHelper.get(this.settings.VertexUser);
                if (user) {
                    var promise;
                    if (this.$scope.model.orderType.id == 1) {
                        promise = this.vertextService.newOrder(user.SelectedAccount, this.$scope.symbol.ID, this.$scope.transactionType, this.$scope.model.amount, this.$scope.model.note);
                    }
                    else {
                        promise = this.vertextService.newLimitOrder(user.SelectedAccount, this.$scope.symbol.ID, this.$scope.model.limitType.id, this.$scope.model.limitPrice, this.$scope.model.amount, this.$scope.model.note, this.$scope.model.sl, this.$scope.model.tp);
                    }
                    if (promise) {
                        this.commonDataService.addPromise(promise);
                        promise.success((response) => {
                            if (this.vertexHelper.validate(response)) {
                                this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'Order placed successfully', 3000);
                                this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                            }
                        });
                    }
                }
            }
        }
        tradex.TradexBuySellModalCtrl = TradexBuySellModalCtrl;
        angular.module('intranet.tradex').controller('tradexBuySellModalCtrl', TradexBuySellModalCtrl);
    })(tradex = intranet.tradex || (intranet.tradex = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BuySellModalCtrl.js.map