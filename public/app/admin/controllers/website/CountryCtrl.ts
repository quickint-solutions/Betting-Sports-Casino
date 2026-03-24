module intranet.admin {

    export interface ICountryScope extends intranet.common.IScopeBase {
    }

    export class CountryCtrl extends intranet.common.ControllerBase<ICountryScope>
    {
        constructor($scope: ICountryScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private settingService: services.SettingService) {
            super($scope);
        }

        private getChannel(p: any) { return common.enums.SupportedChannel[p]; }

        private getOtpProvider(p: any) { return common.enums.OTPProvider[p]; }

        private addEditCountry(item: any = null): void {
            var options = new intranet.common.services.ModalOptions();
            if (item) {
                options.header = 'Update Country Detail';
                options.data = item;
            }
            else {
                options.header = 'Add Country Detail';
            }
            options.bodyUrl = this.settings.ThemeName + '/admin/website/add-country-modal.html';

            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.controller = 'addCountryModalCtrl';
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
            return this.settingService.getCountries(model);
        }
    }

    angular.module('intranet.admin').controller('countryCtrl', CountryCtrl);
}