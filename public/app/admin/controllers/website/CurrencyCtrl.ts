module intranet.admin {

    export interface ICurrencyScope extends intranet.common.IScopeBase {
    }

    export class CurrencyCtrl extends intranet.common.ControllerBase<ICurrencyScope>
    {
        constructor($scope: ICurrencyScope,
            private $state: any,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private currencyService: services.CurrencyService) {
            super($scope);
        }

        private addEditCurrency(item: any = null): void {
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

            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.controller = 'addCurrencyModalCtrl';
            modalDefaults.resolve = {
                modalOptions: () => {
                    return options;
                }
            };

            this.modalService.showWithOptions(options, modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }


        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.currencyService.getCurrencyList(model);
        }
    }

    angular.module('intranet.admin').controller('currencyCtrl', CurrencyCtrl);
}