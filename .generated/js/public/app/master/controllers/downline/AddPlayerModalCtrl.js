var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class AddPlayerModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, settings, currencyService, $translate, commonDataService, $filter, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.settings = settings;
                this.currencyService = currencyService;
                this.$translate = $translate;
                this.commonDataService = commonDataService;
                this.$filter = $filter;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.player = { betConfig: {} };
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.player.parentId = this.modalOptions.data.userId;
                    if (this.modalOptions.data.showCurrency) {
                        this.$scope.player.showCurrency = this.modalOptions.data.showCurrency;
                        this.$scope.player.currencyId = this.modalOptions.data.currencyId.toString();
                    }
                }
                this.$scope.modalOptions.ok = result => {
                    this.savePlayer();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                if (this.$scope.player.showCurrency) {
                    this.loadCurrency();
                }
            }
            loadCurrency() {
                this.currencyService.getCurrencies()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.currencyList = response.data.map((a) => { return { id: a.id, name: a.name }; });
                    }
                });
            }
            validate() {
                if (this.$scope.player.password !== this.$scope.player.confirmpassword) {
                    var msg = this.$filter('translate')('profile.password.confirm.invalid');
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                if (this.settings.ThemeName != 'seven' && this.settings.ThemeName != 'lotus' && !this.$scope.player.mobile && !this.$scope.player.email) {
                    this.$scope.messages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Validation, this.$translate.instant('mobileoremail.requried'), null));
                    return false;
                }
                return true;
            }
            savePlayer() {
                if (this.validate()) {
                    var item = {};
                    angular.copy(this.$scope.player, item);
                    if (item.creditRef) {
                        item.creditRef = this.$filter('toGLC')(item.creditRef);
                    }
                    if (item.casinoCreditRef) {
                        item.casinoCreditRef = (item.casinoCreditRef);
                    }
                    var promise;
                    promise = this.userService.addDownlineMembers(item);
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
        master.AddPlayerModalCtrl = AddPlayerModalCtrl;
        angular.module('intranet.master').controller('addPlayerModalCtrl', AddPlayerModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddPlayerModalCtrl.js.map