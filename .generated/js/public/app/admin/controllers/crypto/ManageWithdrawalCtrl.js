var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ManageWithdrawalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, commonDataService, modalService, settings, $stateParams, $q, cryptoService) {
                super($scope);
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.modalService = modalService;
                this.settings = settings;
                this.$stateParams = $stateParams;
                this.$q = $q;
                this.cryptoService = cryptoService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.search = { value: '', key: '', isUi: true };
                this.$scope.listNewItems = [];
            }
            loadInitialData() { this.loadButtonItems(); }
            loadButtonItems() {
            }
            getTokenChain(c) { return intranet.common.enums.TokenChains[c]; }
            getStatus(c) { return intranet.common.enums.CryptoWithdrawalStatus[c]; }
            getItems(params, filters) {
                var model = {
                    params: params, filters: filters,
                    searchQuery: this.$scope.search
                };
                return this.cryptoService.getWithdrawal(model);
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.$scope.search = { value: '', key: '', isUi: true };
                this.refreshGrid();
            }
            viewRequest(item) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'View/Update Withdrawal Request';
                    modal.data = {};
                    angular.copy(item, modal.data);
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/crypto/view-request-modal.html';
                modal.controller = 'viewRequestModalCtrl';
                modal.options.actionButton = '';
                modal.options.closeButton = 'Close';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            removeWallet(item) {
                this.modalService.showDeleteConfirmation().then((result) => {
                    if (result == intranet.common.services.ModalResult.OK) {
                        this.cryptoService.removeWallet(item.id).success((response) => {
                            if (response.success) {
                                this.$scope.$broadcast('refreshGrid');
                            }
                            this.toasterService.showMessages(response.messages, 5000);
                        });
                    }
                });
            }
            copyAddress(item) {
                this.commonDataService.copyText(item.address);
                this.toasterService.showToastMessage(intranet.common.helpers.ToastType.Info, "Copied address of " + item.token, 2000);
            }
        }
        admin.ManageWithdrawalCtrl = ManageWithdrawalCtrl;
        angular.module('intranet.admin').controller('manageWithdrawalCtrl', ManageWithdrawalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageWithdrawalCtrl.js.map