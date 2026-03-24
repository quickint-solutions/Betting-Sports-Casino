module intranet.master {

    export interface IManageAgentBannersScope extends intranet.common.IScopeBase {
        statusList: any[];
    }

    export class ManageAgentBannersCtrl extends intranet.common.ControllerBase<IManageAgentBannersScope>
        implements intranet.common.init.IInit {
        constructor($scope: IManageAgentBannersScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private commonDataService: common.services.CommonDataService,
            private toasterService: common.services.ToasterService,
            private websiteService: services.WebsiteService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void { }

        public loadInitialData(): void {
            this.$scope.statusList = [];
            this.$scope.statusList.push({ id: true, name: 'Yes' });
            this.$scope.statusList.push({ id: false, name: 'No' });
        }

        private statusChanged(isActive: any, item: any): void {
            this.websiteService.changeActiveAgentBanner(item.id, isActive)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        item.isActive = isActive;
                    }
                    this.toasterService.showMessages(response.messages);
                });
        }

        private showReceipt(data: any) {
            this.commonDataService.showReceiptModal(this.$scope, data.imageContent);
        }

        private addBanner(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'Add Banner';
            modal.bodyUrl = this.settings.ThemeName + '/master/banners/add-banner-modal.html';
            modal.controller = 'addAgentBannerModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }


        private deleteBanner(id: any): void {
            this.websiteService.deleteAgentBanner(id)
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
            return this.websiteService.getAgentBanners(model);
        }

    }

    angular.module('intranet.master').controller('manageAgentBannersCtrl', ManageAgentBannersCtrl);
}