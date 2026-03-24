module intranet.admin {

    export interface IWebsiteScope extends intranet.common.IScopeBase {
    }

    export class WebsiteCtrl extends intranet.common.ControllerBase<IWebsiteScope>
    {
        constructor($scope: IWebsiteScope,
            private $state: any,
            private toasterService: intranet.common.services.ToasterService,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private websiteService: services.WebsiteService) {
            super($scope);
        }

        private addEditWebsite(item: any = null): void {
            var options = new intranet.common.services.ModalOptions();
            if (item) {
                options.header = 'admin.website.edit.modal.header';
                options.data = item;
            }
            else {
                options.header = 'admin.website.add.modal.header';
            }
            options.bodyUrl = this.settings.ThemeName + '/admin/website/add-website-modal.html';

            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.size = 'lg';
            modalDefaults.controller = 'addWebsiteModalCtrl';
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

        private updatePayment(item: any): void {
            var options = new intranet.common.services.ModalOptions();
            options.header = 'Update Payment Gateway';
            options.data = {
                websiteId: item.id,
                name: item.name
            };

            options.bodyUrl = this.settings.ThemeName + '/admin/website/add-payment-modal.html';
            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.size = 'lg';
            modalDefaults.controller = 'addPaymentModalCtrl';
            modalDefaults.resolve = {
                modalOptions: () => {
                    return options;
                }
            };

            this.modalService.showWithOptions(options, modalDefaults);
        }

        private updateOTPConfig(item) {
            var options = new intranet.common.services.ModalOptions();
            options.header = 'Update OTP Config';
            options.data = item

            options.bodyUrl = this.settings.ThemeName + '/admin/website/otp-config-modal.html';
            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            modalDefaults.size = 'lg';
            modalDefaults.controller = 'otpConfigModalCtrl';
            modalDefaults.resolve = {
                modalOptions: () => {
                    return options;
                }
            };

            this.modalService.showWithOptions(options, modalDefaults);
        }

        private deleteWebsite(item: any): void {
            this.modalService.showDeleteConfirmation().then((result: any) => {
                if (result == common.services.ModalResult.OK) {
                    this.websiteService.deleteWebsite(item.id).success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.$broadcast('refreshGrid');
                        }
                        this.toasterService.showMessages(response.messages, 5000);
                    });
                }
            });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.websiteService.getWebsiteList(model);
        }
    }

    angular.module('intranet.admin').controller('websiteCtrl', WebsiteCtrl);
}