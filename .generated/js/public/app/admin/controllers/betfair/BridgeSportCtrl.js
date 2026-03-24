var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class BridgeSportCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, settings, $filter, modalService, bridgeService, betfairService) {
                super($scope);
                this.toasterService = toasterService;
                this.settings = settings;
                this.$filter = $filter;
                this.modalService = modalService;
                this.bridgeService = bridgeService;
                this.betfairService = betfairService;
            }
            intialDataService() {
                return this.bridgeService.getEventTypes();
            }
            treeService(servicename, parentid) {
                return this.bridgeService.getTreeServiceData(servicename, parentid);
            }
            getActiveBotData() {
                return this.betfairService.getActiveBot();
            }
            activateMarket(item) {
                var modal = new intranet.common.helpers.CreateModal();
                var msg = this.$filter('translate')('admin.bot.param.modal.header');
                msg = msg.format('"' + item.name + '"');
                modal.header = msg;
                modal.bodyUrl = this.settings.ThemeName + '/admin/betfair/bot-param-modal.html';
                modal.controller = 'botParamModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        var data = result.data;
                        data.marketid = item.id;
                        this.bridgeService.startBot(data)
                            .success((response) => {
                            if (response.success) {
                                item.active = true;
                                this.$scope.$broadcast("refreshTree", { treename: "activatedBotTree" });
                            }
                            this.toasterService.showMessages(response.messages, 5000);
                        });
                    }
                });
            }
        }
        admin.BridgeSportCtrl = BridgeSportCtrl;
        angular.module('intranet.admin').controller('bridgeSportCtrl', BridgeSportCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BridgeSportCtrl.js.map