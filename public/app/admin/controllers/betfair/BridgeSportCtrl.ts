module intranet.admin {

    export interface IBridgeSportScope extends intranet.common.IScopeBase {
    }

    export class BridgeSportCtrl extends intranet.common.ControllerBase<IBridgeSportScope>
    {
        constructor($scope: IBridgeSportScope,
            private toasterService: common.services.ToasterService,
            private settings: common.IBaseSettings,
            private $filter: any,
            private modalService: common.services.ModalService,
            private bridgeService: services.BridgeService,
            private betfairService: services.BetfairService) {
            super($scope);
        }

        private intialDataService(): any {
            return this.bridgeService.getEventTypes();
        }

        private treeService(servicename: any, parentid: any): any {
            return this.bridgeService.getTreeServiceData(servicename, parentid);
        }

        private getActiveBotData(): any {
            return this.betfairService.getActiveBot();
        }

        private activateMarket(item: any) {
            var modal = new common.helpers.CreateModal();
            var msg: string = this.$filter('translate')('admin.bot.param.modal.header');
            msg = msg.format('"' + item.name + '"');
            modal.header = msg;
            modal.bodyUrl = this.settings.ThemeName + '/admin/betfair/bot-param-modal.html';
            modal.controller = 'botParamModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    var data = result.data;
                    data.marketid = item.id;
                    this.bridgeService.startBot(data)
                        .success((response: common.messaging.IResponse<any>) => {
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

    angular.module('intranet.admin').controller('bridgeSportCtrl', BridgeSportCtrl);
}