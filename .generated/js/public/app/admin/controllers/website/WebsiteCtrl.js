var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class WebsiteCtrl extends intranet.common.ControllerBase {
            constructor($scope, $state, toasterService, modalService, settings, websiteService) {
                super($scope);
                this.$state = $state;
                this.toasterService = toasterService;
                this.modalService = modalService;
                this.settings = settings;
                this.websiteService = websiteService;
            }
            addEditWebsite(item = null) {
                var options = new intranet.common.services.ModalOptions();
                if (item) {
                    options.header = 'admin.website.edit.modal.header';
                    options.data = item;
                }
                else {
                    options.header = 'admin.website.add.modal.header';
                }
                options.bodyUrl = this.settings.ThemeName + '/admin/website/add-website-modal.html';
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.size = 'lg';
                modalDefaults.controller = 'addWebsiteModalCtrl';
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
            updatePayment(item) {
                var options = new intranet.common.services.ModalOptions();
                options.header = 'Update Payment Gateway';
                options.data = {
                    websiteId: item.id,
                    name: item.name
                };
                options.bodyUrl = this.settings.ThemeName + '/admin/website/add-payment-modal.html';
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.size = 'lg';
                modalDefaults.controller = 'addPaymentModalCtrl';
                modalDefaults.resolve = {
                    modalOptions: () => {
                        return options;
                    }
                };
                this.modalService.showWithOptions(options, modalDefaults);
            }
            updateOTPConfig(item) {
                var options = new intranet.common.services.ModalOptions();
                options.header = 'Update OTP Config';
                options.data = item;
                options.bodyUrl = this.settings.ThemeName + '/admin/website/otp-config-modal.html';
                var modalDefaults = new intranet.common.services.ModalDefaults();
                modalDefaults.size = 'lg';
                modalDefaults.controller = 'otpConfigModalCtrl';
                modalDefaults.resolve = {
                    modalOptions: () => {
                        return options;
                    }
                };
                this.modalService.showWithOptions(options, modalDefaults);
            }
            deleteWebsite(item) {
                this.modalService.showDeleteConfirmation().then((result) => {
                    if (result == intranet.common.services.ModalResult.OK) {
                        this.websiteService.deleteWebsite(item.id).success((response) => {
                            if (response.success) {
                                this.$scope.$broadcast('refreshGrid');
                            }
                            this.toasterService.showMessages(response.messages, 5000);
                        });
                    }
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.websiteService.getWebsiteList(model);
            }
        }
        admin.WebsiteCtrl = WebsiteCtrl;
        angular.module('intranet.admin').controller('websiteCtrl', WebsiteCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=WebsiteCtrl.js.map