module intranet.admin {

    export interface IMarketRulesScope extends intranet.common.IScopeBase {
    }

    export class MarketRulesCtrl extends intranet.common.ControllerBase<IMarketRulesScope>
    {
        constructor($scope: IMarketRulesScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private toasterService: common.services.ToasterService,
            private marketRuleService: services.MarketRuleService) {
            super($scope);
        }

        private addEditRule(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'admin.marketrule.edit.modal.header';
                modal.data = {
                    id: item.id,
                    name: item.name,
                    rule: item.rule
                };
            }
            else {
                modal.header = 'admin.marketrule.add.modal.header';
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/sport/add-marketrule-modal.html';
            modal.controller = 'addMarketRuleModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }


        private deleteRule(id: any): void {
            this.marketRuleService.deleteMarketRule(id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.marketRuleService.getMarketRulesList(model);
        }
    }

    angular.module('intranet.admin').controller('marketRulesCtrl', MarketRulesCtrl);
}