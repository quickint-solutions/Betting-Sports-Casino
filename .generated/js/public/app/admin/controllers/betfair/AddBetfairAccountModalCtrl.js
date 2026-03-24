var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddBetfairAccountModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, betfairService, websiteService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.betfairService = betfairService;
                this.websiteService = websiteService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.websites = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.account = {};
                if (this.modalOptions.data) {
                    this.$scope.account = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => {
                    this.saveBetfairAccount();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.loadWebsites();
                var accountType = intranet.common.enums.BetfairAccountType;
                this.$scope.accountTypeList = intranet.common.helpers.Utility.enumToArray(accountType);
                if (this.$scope.account && this.$scope.account.betfairAccountType) {
                    this.$scope.account.betfairAccountType = this.$scope.account.betfairAccountType.toString();
                }
                else {
                    this.$scope.account.betfairAccountType = this.$scope.accountTypeList[0].id.toString();
                }
            }
            loadWebsites() {
                this.websiteService.getWebsites()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.websites = response.data.filter((w) => { return w.isBetfair; });
                        this.$scope.websites.splice(0, 0, { id: '', name: '--Select Website--' });
                    }
                });
            }
            saveBetfairAccount() {
                var promise;
                if (this.$scope.account.id) {
                    promise = this.betfairService.updateBetfairAccount(this.$scope.account);
                }
                else {
                    promise = this.betfairService.addBetfairAccount(this.$scope.account);
                }
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
        admin.AddBetfairAccountModalCtrl = AddBetfairAccountModalCtrl;
        angular.module('intranet.admin').controller('addBetfairAccountModalCtrl', AddBetfairAccountModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddBetfairAccountModalCtrl.js.map