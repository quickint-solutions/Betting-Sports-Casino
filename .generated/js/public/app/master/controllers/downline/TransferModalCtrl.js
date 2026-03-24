var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class TransferModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, accountService, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.accountService = accountService;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.totalChips = 0;
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.item = this.modalOptions.data;
                    if (this.$scope.item.chips) {
                        this.$scope.totalChips = angular.isNumber(this.$scope.item.chips) ? this.$scope.item.chips : parseFloat(this.$scope.item.chips.replaceAll(',', ''));
                        this.$scope.item.chips = angular.isNumber(this.$scope.item.chips) ? this.$scope.item.chips : parseFloat(this.$scope.item.chips.replaceAll(',', ''));
                    }
                    this.$scope.isPlayer = this.$scope.item.userType == intranet.common.enums.UserType.Player;
                    this.$scope.item.settleBalance = true;
                }
                this.$scope.modalOptions.ok = result => {
                    this.transferBalance();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            chipsChange() {
                this.$scope.item.isvalid = true;
            }
            transferBalance() {
                var item = {};
                angular.copy(this.$scope.item, item);
                if (item.chips.length > 0 || item.chips > 0) {
                    item.chips = angular.isNumber(item.chips) ? item.chips : parseFloat(item.chips.replaceAll(',', ''));
                    var model = {
                        isTransfer: true,
                        chips: item.chips,
                        userId: item.id,
                        dwType: item.dwType,
                        comment: item.comment,
                        timestamp: moment().format('x'),
                    };
                    if (model) {
                        var promise;
                        model.chips = this.$filter('toGLC')(item.chips);
                        if (model.dwType == 'D') {
                            if (this.$scope.item.userType == intranet.common.enums.UserType.Player) {
                                model.settleBalance = item.settleBalance;
                                promise = this.accountService.IN(model);
                            }
                            else {
                                promise = this.accountService.transferIn(model);
                            }
                        }
                        else {
                            if (this.$scope.item.userType == intranet.common.enums.UserType.Player) {
                                model.settleBalance = item.settleBalance;
                                promise = this.accountService.OUT(model);
                            }
                            else {
                                promise = this.accountService.transferOut(model);
                            }
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
            }
        }
        master.TransferModalCtrl = TransferModalCtrl;
        angular.module('intranet.master').controller('transferModalCtrl', TransferModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=TransferModalCtrl.js.map