var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class ManageOffersCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, toasterService, websiteService, offerService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.toasterService = toasterService;
                this.websiteService = websiteService;
                this.offerService = offerService;
                super.init(this);
            }
            initScopeValues() { }
            loadInitialData() { }
            addEditOffer(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'Edit Offer';
                    modal.data = {};
                    angular.copy(item, modal.data);
                }
                else {
                    modal.header = 'Add Offer';
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/offers/add-offer-modal.html';
                modal.controller = 'addOfferModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            deleteOffer(id) {
                this.offerService.deleteOffer(id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.offerService.getOffers(model);
            }
            getOfferOn(on) { return intranet.common.enums.OfferOn[on]; }
            getOfferType(t) { return intranet.common.enums.OfferType[t]; }
        }
        admin.ManageOffersCtrl = ManageOffersCtrl;
        angular.module('intranet.admin').controller('manageOffersCtrl', ManageOffersCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageOffersCtrl.js.map