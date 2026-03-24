module intranet.admin {

    export interface IMarketTypeScope extends intranet.common.IScopeBase {
    }

    export class MarketTypeCtrl extends intranet.common.ControllerBase<IMarketTypeScope>
    {
        constructor($scope: IMarketTypeScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private marketService: services.MarketService) {
            super($scope);
        }

        private addEditMarketType(item: any = null): void {
            var options = new intranet.common.services.ModalOptions();
            if (item) {
                options.header = 'Update market type';
                options.data = item;
            }
            else {
                options.header = 'Add market type';
            }
            options.bodyUrl = this.settings.ThemeName + '/admin/sport/add-market-type-modal.html';

            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.controller = 'addMarketTypeModalCtrl';
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
            return this.marketService.getMarketTypeMapping(model);
        }
    }

    angular.module('intranet.admin').controller('marketTypeCtrl', MarketTypeCtrl);
}