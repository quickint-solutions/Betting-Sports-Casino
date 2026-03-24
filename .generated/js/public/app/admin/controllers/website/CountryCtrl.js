var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class CountryCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, settingService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.settingService = settingService;
            }
            getChannel(p) { return intranet.common.enums.SupportedChannel[p]; }
            getOtpProvider(p) { return intranet.common.enums.OTPProvider[p]; }
            addEditCountry(item = null) {
                var options = new intranet.common.services.ModalOptions();
                if (item) {
                    options.header = 'Update Country Detail';
                    options.data = item;
                }
                else {
                    options.header = 'Add Country Detail';
                }
                options.bodyUrl = this.settings.ThemeName + '/admin/website/add-country-modal.html';
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.controller = 'addCountryModalCtrl';
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
                return this.settingService.getCountries(model);
            }
        }
        admin.CountryCtrl = CountryCtrl;
        angular.module('intranet.admin').controller('countryCtrl', CountryCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CountryCtrl.js.map