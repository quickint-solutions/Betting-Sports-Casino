var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ManageWalletsCtrl extends intranet.common.ControllerBase {
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
                this.$scope.listNewItems.push({
                    func: () => this.AddEditToken(null),
                    name: 'Add New Token'
                });
            }
            getTokenChain(c) { return intranet.common.enums.TokenChains[c]; }
            getTokenHas(c) { return intranet.common.enums.TokenHas[c]; }
            getItems(params, filters) {
                var model = {
                    params: params, filters: filters,
                    searchQuery: this.$scope.search
                };
                return this.cryptoService.getAllWallets(model);
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.$scope.search = { value: '', key: '', isUi: true };
                this.refreshGrid();
            }
            AddEditToken(item) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'Edit Token';
                    modal.data = {};
                    angular.copy(item, modal.data);
                }
                else {
                    modal.header = 'Add Token';
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/crypto/add-token-modal.html';
                modal.controller = 'addTokenModalCtrl';
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
        admin.ManageWalletsCtrl = ManageWalletsCtrl;
        angular.module('intranet.admin').controller('manageWalletsCtrl', ManageWalletsCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageWalletsCtrl.js.map