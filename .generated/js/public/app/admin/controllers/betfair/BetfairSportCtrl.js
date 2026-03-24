var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class BetfairSportCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, settings, $filter, modalService, betfairService) {
                super($scope);
                this.toasterService = toasterService;
                this.settings = settings;
                this.$filter = $filter;
                this.modalService = modalService;
                this.betfairService = betfairService;
            }
            intialDataService() {
                return this.betfairService.getEventType();
            }
            treeService(servicename, parentid) {
                return this.betfairService.getTreeServiceData(servicename, parentid);
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
                        this.betfairService.startBot(data)
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
        admin.BetfairSportCtrl = BetfairSportCtrl;
        angular.module('intranet.admin').controller('betfairSportCtrl', BetfairSportCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetfairSportCtrl.js.map