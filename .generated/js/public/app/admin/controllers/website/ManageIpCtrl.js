var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ManageIpCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, toasterService, tokenService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.toasterService = toasterService;
                this.tokenService = tokenService;
            }
            addEditIP() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'admin.ip.add.modal.header';
                modal.bodyUrl = this.settings.ThemeName + '/admin/website/add-ip-modal.html';
                modal.controller = 'addIpModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            deleteIP(id) {
                this.tokenService.unBlockIP(id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.tokenService.getBlockIPList(model);
            }
        }
        admin.ManageIpCtrl = ManageIpCtrl;
        angular.module('intranet.admin').controller('manageIpCtrl', ManageIpCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageIpCtrl.js.map