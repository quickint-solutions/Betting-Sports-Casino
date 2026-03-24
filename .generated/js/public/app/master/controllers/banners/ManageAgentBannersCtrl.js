var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class ManageAgentBannersCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, commonDataService, toasterService, websiteService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.commonDataService = commonDataService;
                this.toasterService = toasterService;
                this.websiteService = websiteService;
                super.init(this);
            }
            initScopeValues() { }
            loadInitialData() {
                this.$scope.statusList = [];
                this.$scope.statusList.push({ id: true, name: 'Yes' });
                this.$scope.statusList.push({ id: false, name: 'No' });
            }
            statusChanged(isActive, item) {
                this.websiteService.changeActiveAgentBanner(item.id, isActive)
                    .success((response) => {
                    if (response.success) {
                        item.isActive = isActive;
                    }
                    this.toasterService.showMessages(response.messages);
                });
            }
            showReceipt(data) {
                this.commonDataService.showReceiptModal(this.$scope, data.imageContent);
            }
            addBanner() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'Add Banner';
                modal.bodyUrl = this.settings.ThemeName + '/master/banners/add-banner-modal.html';
                modal.controller = 'addAgentBannerModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            deleteBanner(id) {
                this.websiteService.deleteAgentBanner(id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.websiteService.getAgentBanners(model);
            }
        }
        master.ManageAgentBannersCtrl = ManageAgentBannersCtrl;
        angular.module('intranet.master').controller('manageAgentBannersCtrl', ManageAgentBannersCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageAgentBannersCtrl.js.map