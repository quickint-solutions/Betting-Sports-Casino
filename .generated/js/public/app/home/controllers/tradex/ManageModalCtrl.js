var intranet;
(function (intranet) {
    var tradex;
    (function (tradex) {
        class TradexManageModalCtrl extends intranet.common.ControllerBase {
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
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.loadLimitTypes();
            }
            loadLimitTypes() {
                var limitTypes = [];
                limitTypes.push({ id: 1, type: 'Buy Limit', transactionType: 1 });
                limitTypes.push({ id: 2, type: 'Buy Stop', transactionType: 1 });
                limitTypes.push({ id: -1, type: 'Sell Limit', transactionType: -1 });
                limitTypes.push({ id: -2, type: 'Sell Stop', transactionType: -1 });
                var result = limitTypes.filter((l) => { return l.id == this.$scope.order.BuySell; });
                if (result.length > 0) {
                    this.$scope.limitType = result[0];
                }
            }
            placeOrder() {
                var user = this.localStorageHelper.get(this.settings.VertexUser);
                if (user) {
                    var promise;
                    if (!this.$scope.order.ManagedTKTID) {
                        promise = this.vertextService.updateLimitOrder(user.SelectedAccount, this.$scope.order.ID, this.$scope.order.OpenPrice, this.$scope.order.Amount, this.$scope.order.Note, this.$scope.order.SL, this.$scope.order.TP);
                    }
                    else {
                        promise = this.vertextService.updateSLTP(user.SelectedAccount, this.$scope.order.ID, this.$scope.order.Amount, this.$scope.order.SL, this.$scope.order.TP);
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
        tradex.TradexManageModalCtrl = TradexManageModalCtrl;
        angular.module('intranet.tradex').controller('tradexManageModalCtrl', TradexManageModalCtrl);
    })(tradex = intranet.tradex || (intranet.tradex = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageModalCtrl.js.map