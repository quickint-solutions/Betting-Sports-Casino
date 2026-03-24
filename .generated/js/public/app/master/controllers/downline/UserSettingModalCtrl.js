var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class UserSettingModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, userService, commonDataService, $uibModalInstance, $filter, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.userService = userService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.$filter = $filter;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.data = {};
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.userId = this.modalOptions.data.userId;
                }
                this.$scope.modalOptions.extraClick = result => {
                    this.saveSettings(true);
                };
                this.$scope.modalOptions.ok = result => {
                    this.saveSettings();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                if (this.$scope.userId) {
                    this.userService.getReferralSetting(this.$scope.userId)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.data = response.data;
                            this.$scope.data.userId = this.$scope.userId;
                            this.$scope.data.minDeposit = this.$filter('toRateOnly')(response.data.minDeposit);
                            this.$scope.data.minWithdrawalAmount = this.$filter('toRateOnly')(response.data.minWithdrawalAmount);
                            this.$scope.data.minimumBalanceRequired = this.$filter('toRateOnly')(response.data.minimumBalanceRequired);
                        }
                    });
                }
            }
            saveSettings(applyToAll = false) {
                var promise;
                this.$scope.data.applyAll = applyToAll;
                var item = {};
                angular.copy(this.$scope.data, item);
                item.minDeposit = this.$filter('toGLC')(item.minDeposit);
                item.minWithdrawalAmount = this.$filter('toGLC')(item.minWithdrawalAmount);
                item.minimumBalanceRequired = this.$filter('toGLC')(item.minimumBalanceRequired);
                promise = this.userService.updateReferralSetting(item);
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
        master.UserSettingModalCtrl = UserSettingModalCtrl;
        angular.module('intranet.master').controller('userSettingModalCtrl', UserSettingModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UserSettingModalCtrl.js.map