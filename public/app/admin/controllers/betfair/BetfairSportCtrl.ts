module intranet.admin {

    export interface IBetfairSportScope extends intranet.common.IScopeBase {
    }

    export class BetfairSportCtrl extends intranet.common.ControllerBase<IBetfairSportScope>
    {
        constructor($scope: IBetfairSportScope,
            private toasterService: common.services.ToasterService,
            private settings: common.IBaseSettings,
            private $filter: any,
            private modalService: common.services.ModalService,
            private betfairService: services.BetfairService) {
            super($scope);
        }

        private intialDataService(): any {
            return this.betfairService.getEventType();
        }

        private treeService(servicename: any, parentid: any): any {
            return this.betfairService.getTreeServiceData(servicename, parentid);
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
                    this.betfairService.startBot(data)
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

    angular.module('intranet.admin').controller('betfairSportCtrl', BetfairSportCtrl);
}