var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class MarketTypeCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, marketService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.marketService = marketService;
            }
            addEditMarketType(item = null) {
                var options = new intranet.common.services.ModalOptions();
                if (item) {
                    options.header = 'Update market type';
                    options.data = item;
                }
                else {
                    options.header = 'Add market type';
                }
                options.bodyUrl = this.settings.ThemeName + '/admin/sport/add-market-type-modal.html';
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.controller = 'addMarketTypeModalCtrl';
                modalDefaults.resolve = {
                    modalOptions: () => {
                        return options;
                    }
                };
                this.modalService.showWithOptions(options, modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.marketService.getMarketTypeMapping(model);
            }
        }
        admin.MarketTypeCtrl = MarketTypeCtrl;
        angular.module('intranet.admin').controller('marketTypeCtrl', MarketTypeCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MarketTypeCtrl.js.map