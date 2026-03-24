var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class RunnerCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, runnerService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.runnerService = runnerService;
                this.$scope.search = {};
            }
            addEditRunner(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'admin.runner.edit.modal.header';
                    modal.data = {
                        id: item.id,
                        name: item.name,
                        sourceId: item.sourceId,
                        runnerMetadata: item.runnerMetadata
                    };
                }
                else {
                    modal.header = 'admin.runner.add.modal.header';
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-runner-modal.html';
                modal.controller = 'addRunnerModalCtrl';
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
                this.$scope.search.id = undefined;
                this.$scope.search.name = undefined;
                this.refreshGrid();
            }
            getItems(params, filters) {
                var searchquery = {};
                if (this.$scope.search.id) {
                    searchquery.id = this.$scope.search.id;
                }
                if (this.$scope.search.name) {
                    searchquery.name = this.$scope.search.name;
                }
                var model = { params: params, filters: filters, searchQuery: searchquery };
                return this.runnerService.getRunnerList(model);
            }
        }
        admin.RunnerCtrl = RunnerCtrl;
        angular.module('intranet.admin').controller('runnerCtrl', RunnerCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=RunnerCtrl.js.map