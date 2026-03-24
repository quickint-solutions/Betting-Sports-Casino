var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SymbolCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, toasterService, settings, symbolService) {
                super($scope);
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.settings = settings;
                this.symbolService = symbolService;
                this.$scope.search = {};
                super.init(this);
            }
            loadInitialData() {
                var status = intranet.common.enums.Segment;
                this.$scope.segmentList = intranet.common.helpers.Utility.enumToArray(status);
                this.$scope.segmentList.splice(0, 0, { id: '-1', name: '-- Select Segment --' });
                this.$scope.search = { segment: '-1' };
                this.$scope.activeStatus = [];
                this.$scope.activeStatus.push({ id: true, name: 'true' });
                this.$scope.activeStatus.push({ id: false, name: 'false' });
            }
            getSegement(id) {
                return intranet.common.enums.Segment[id];
            }
            activeStatusChanged(active, item) {
                this.symbolService.changeSymbolStatus(item.id, active)
                    .success((response) => {
                    if (response.success) {
                        item.isActive = active;
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'Symbol status changed.');
                    }
                    else {
                        this.toasterService.showMessages(response.messages);
                    }
                });
            }
            addEditRunner(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'Edit Symbol';
                    modal.data = {
                        id: item.id,
                        name: item.name,
                        segment: item.segment,
                        code: item.code,
                        lotSize: item.lotSize
                    };
                }
                else {
                    modal.header = 'Add Symbol';
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/symbol/add-symbol-modal.html';
                modal.controller = 'addSymbolModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage');
                    }
                });
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.$scope.search.segment = undefined;
                this.$scope.search.name = undefined;
                this.refreshGrid();
            }
            getItems(params, filters) {
                var searchquery = {};
                if (this.$scope.search.segment != '-1') {
                    searchquery.segment = this.$scope.search.segment;
                }
                if (this.$scope.search.name) {
                    searchquery.name = this.$scope.search.name;
                }
                var model = { params: params, filters: filters, searchQuery: searchquery };
                return this.symbolService.getSymbolList(model);
            }
        }
        admin.SymbolCtrl = SymbolCtrl;
        angular.module('intranet.admin').controller('symbolCtrl', SymbolCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SymbolCtrl.js.map