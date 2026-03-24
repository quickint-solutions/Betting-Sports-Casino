var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class ManageAgentOffersCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, $filter, toasterService, offerService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.$filter = $filter;
                this.toasterService = toasterService;
                this.offerService = offerService;
                super.init(this);
            }
            initScopeValues() { }
            loadInitialData() { }
            addEditOffer(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
                if (item) {
                    modal.header = 'Edit Offer';
                    var model = {};
                    angular.copy(item, model);
                    if (model.offerType == intranet.common.enums.OfferType.Fixed) {
                        model.value = this.$filter('toRateOnly')(model.value);
                    }
                    if (model.minDeposit > 0) {
                        model.minDeposit = this.$filter('toRateOnly')(model.minDeposit);
                    }
                    if (model.maxDeposit > 0) {
                        model.maxDeposit = this.$filter('toRateOnly')(model.maxDeposit);
                    }
                    if (model.offerBudget > 0) {
                        model.offerBudget = this.$filter('toRateOnly')(model.offerBudget);
                    }
                    if (model.valueUpTo > 0) {
                        model.valueUpTo = this.$filter('toRateOnly')(model.valueUpTo);
                    }
                    if (model.depositVariations && model.depositVariations.length > 0) {
                        angular.forEach(model.depositVariations, (d) => {
                            d.min = this.$filter('toRateOnly')(d.min);
                            d.max = this.$filter('toRateOnly')(d.max);
                        });
                    }
                    modal.data = model;
                }
                else {
                    modal.header = 'Add Offer';
                }
                modal.bodyUrl = this.settings.ThemeName + '/master/offers/add-offer-modal.html';
                modal.controller = 'addAgentOfferModalCtrl';
                modal.size = 'lg';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                });
            }
            deleteOffer(id) {
                this.offerService.deleteAgentOffer(id)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.$broadcast('refreshGrid');
                    }
                    this.toasterService.showMessages(response.messages, 5000);
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.offerService.getAgentOffers(model);
            }
            getOfferOn(on) { return intranet.common.enums.OfferOn[on]; }
            getOfferType(t) { return intranet.common.enums.OfferType[t]; }
        }
        master.ManageAgentOffersCtrl = ManageAgentOffersCtrl;
        angular.module('intranet.master').controller('manageAgentOffersCtrl', ManageAgentOffersCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ManageAgentOffersCtrl.js.map