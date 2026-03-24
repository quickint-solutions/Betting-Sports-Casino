var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ManageFDExposureCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, toasterService, settings, fdService) {
                super($scope);
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.settings = settings;
                this.fdService = fdService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.providerList = [];
                var betType = intranet.common.enums.TableProvider;
                this.$scope.providerList = intranet.common.helpers.Utility.enumToArray(betType);
                this.$scope.providerList.splice(0, 0, { id: -1, name: '-- Select Provider --' });
                this.$scope.search = { provider: '-1' };
                this.$scope.listNewItems = [];
                this.loadButtonItems();
            }
            loadButtonItems() {
                this.$scope.listNewItems.push({
                    func: () => this.refreshGrid(),
                    name: 'Refresh Data',
                    cssClass: 'fa fa-refresh'
                });
                this.$scope.listNewItems.push({
                    func: () => this.selectAllMarkets(),
                    name: 'Select All Exposure',
                    cssClass: 'fa fa-check-square-o'
                });
                this.$scope.listNewItems.push({
                    func: () => this.deleteExposureForSelected(),
                    name: 'Delete Selected',
                    cssClass: 'fa fa-trash'
                });
            }
            selectAllMarkets() {
                if (this.$scope.gridItems && this.$scope.gridItems.length > 0) {
                    this.$scope.gridItems.forEach((x) => { x.isDelete = true; });
                }
            }
            deleteExposureForSelected() {
                var ids = this.$scope.gridItems.filter((m) => { return m.isDelete == true; }).map((a) => { return a.id; });
                if (ids.length > 0) {
                    this.modalService.showDeleteConfirmation().then((result) => {
                        if (result == intranet.common.services.ModalResult.OK) {
                            this.fdService.removePendingFDExposure(ids)
                                .success((response) => {
                                if (response.success) {
                                    this.refreshGrid();
                                }
                                this.toasterService.showMessages(response.messages, 3000);
                            });
                        }
                    });
                }
            }
            deleteExposure(item) {
                var ids = [];
                ids.push(item.id);
                this.fdService.removePendingFDExposure(ids)
                    .success((response) => {
                    if (response.success) {
                        this.refreshGrid();
                    }
                    this.toasterService.showMessages(response.messages, 3000);
                });
            }
            getItems(params, filters) {
                var searchquery = { provider: this.$scope.search.provider };
                var model = { params: params, filters: filters, searchQuery: searchquery };
                return this.fdService.getPendingFDExposure(model);
            }
            resetCriteria() {
                this.$scope.search.provider = '-1';
                this.refreshGrid();
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            getProvider(provider) {
                return intranet.common.enums.TableProvider[provider];
            }
        }
        admin.ManageFDExposureCtrl = ManageFDExposureCtrl;
        angular.module('intranet.admin').controller('manageFDExposureCtrl', ManageFDExposureCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageFDExposure.js.map