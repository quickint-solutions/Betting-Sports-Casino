var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class CurrencyCtrl extends intranet.common.ControllerBase {
            constructor($scope, $state, toasterService, modalService, settings, currencyService) {
                super($scope);
                this.$state = $state;
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.settings = settings;
                this.currencyService = currencyService;
            }
            addEditCurrency(item = null) {
                var options = new intranet.common.services.ModalOptions();
                if (item) {
                    options.header = 'admin.currency.edit.modal.header';
                    options.data = {
                        id: item.id,
                        name: item.name,
                        code: item.code,
                        rate: item.rate,
                        fractional: item.fractional,
                        fairDealCode: item.fairDealCode,
                        casinoRate: item.casinoRate,
                        showPopup: item.showPopup,
                        superExchangeCode: item.superExchangeCode
                    };
                }
                else {
                    options.header = 'admin.currency.add.modal.header';
                }
                options.bodyUrl = this.settings.ThemeName + '/admin/website/add-currency-modal.html';
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.controller = 'addCurrencyModalCtrl';
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
                return this.currencyService.getCurrencyList(model);
            }
        }
        admin.CurrencyCtrl = CurrencyCtrl;
        angular.module('intranet.admin').controller('currencyCtrl', CurrencyCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CurrencyCtrl.js.map