module intranet.admin {
    export interface IManageIpScope extends intranet.common.IScopeBase { }

    export class ManageIpCtrl extends intranet.common.ControllerBase<IManageIpScope>
    {
        constructor($scope: IManageIpScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private toasterService: common.services.ToasterService,
            private tokenService: services.TokenService) {
            super($scope);
        }

        private addEditIP(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'admin.ip.add.modal.header';
            modal.bodyUrl = this.settings.ThemeName + '/admin/website/add-ip-modal.html';
            modal.controller = 'addIpModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }


        private deleteIP(id: any): void {
            this.tokenService.unBlockIP(id)
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
            return this.tokenService.getBlockIPList(model);
        }
    }

    angular.module('intranet.admin').controller('manageIpCtrl', ManageIpCtrl);
}