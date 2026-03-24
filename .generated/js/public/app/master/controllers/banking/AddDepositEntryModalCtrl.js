var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class AddDepositEntryModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, paymentService, commonDataService, userService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.paymentService = paymentService;
                this.commonDataService = commonDataService;
                this.userService = userService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.userList = [];
                this.$scope.item = {};
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.password = 'Gameokhan@111';
                this.$scope.modalOptions.ok = result => {
                    this.saveDetail();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            searchUser(search) {
                if (search && search.length >= 3) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.userService.findMembers(search);
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.userList = response.data;
                            if (this.$scope.userList && this.$scope.userList.length > 0) {
                                this.$scope.userList.forEach((u) => {
                                    u.extra = super.getUserTypesObj(u.userType);
                                });
                            }
                        });
                    }
                }
                else {
                    this.$scope.userList.splice(0);
                }
            }
            saveDetail() {
                if (this.$scope.item.password === this.$scope.password) {
                    var promise;
                    var model = {};
                    model.transactionHash = this.$scope.item.transactionHash;
                    model.bfic = this.$scope.item.bfic;
                    model.rate = this.$scope.item.rate;
                    model.amount = this.$filter('toGLC')(this.$scope.item.amount);
                    model.tokenAddress = this.$scope.item.tokenAddress;
                    model.walletAddress = this.$scope.item.walletAddress;
                    if (this.$scope.item.selectedUser) {
                        model.userId = this.$scope.item.selectedUser.id;
                    }
                    promise = this.paymentService.addGameOkPayment(model);
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
                else {
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Warning, 'Password is wrong.', 3000);
                }
            }
        }
        master.AddDepositEntryModalCtrl = AddDepositEntryModalCtrl;
        angular.module('intranet.master').controller('addDepositEntryModalCtrl', AddDepositEntryModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddDepositEntryModalCtrl.js.map