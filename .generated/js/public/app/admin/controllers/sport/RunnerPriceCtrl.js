var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class RunnerPriceCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, toasterService, settings, runnerPriceService) {
                super($scope);
                this.modalService = modalService;
                this.toasterService = toasterService;
                this.settings = settings;
                this.runnerPriceService = runnerPriceService;
            }
            addEditRunnerPrice(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'admin.runnerprice.edit.modal.header';
                    modal.data = {
                        id: item.id,
                        runnerId: item.runnerId,
                        runnerName: item.runnerName,
                        gameType: item.gameType,
                        price: item.price,
                        backSize: item.backSize,
                        laySize: item.laySize,
                        increament: item.increament
                    };
                }
                else {
                    modal.header = 'admin.runnerprice.add.modal.header';
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-runnerprice-modal.html';
                modal.controller = 'addRunnerPriceModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage');
                    }
                });
            }
            getGameType(gameType) {
                return intranet.common.enums.GameType[gameType];
            }
            refreshGrid() {
                this.$scope.$broadcast('refreshGrid');
            }
            resetCriteria() {
                this.refreshGrid();
            }
            deleteRunnerPrice(id) {
                this.runnerPriceService.deleteRunnerPrice(id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.runnerPriceService.getRunnerList(model);
            }
        }
        admin.RunnerPriceCtrl = RunnerPriceCtrl;
        angular.module('intranet.admin').controller('runnerPriceCtrl', RunnerPriceCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=RunnerPriceCtrl.js.map