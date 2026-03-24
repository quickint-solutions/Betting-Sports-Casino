var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class MarketRulesCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, toasterService, marketRuleService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.toasterService = toasterService;
                this.marketRuleService = marketRuleService;
            }
            addEditRule(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
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
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            deleteRule(id) {
                this.marketRuleService.deleteMarketRule(id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.marketRuleService.getMarketRulesList(model);
            }
        }
        admin.MarketRulesCtrl = MarketRulesCtrl;
        angular.module('intranet.admin').controller('marketRulesCtrl', MarketRulesCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MarketRulesCtrl.js.map