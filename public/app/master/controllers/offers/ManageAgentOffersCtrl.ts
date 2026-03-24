module intranet.master {

    export interface IManageAgentOffersScope extends intranet.common.IScopeBase {
    }

    export class ManageAgentOffersCtrl extends intranet.common.ControllerBase<IManageAgentOffersScope>
        implements intranet.common.init.IInit {
        constructor($scope: IManageAgentOffersScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private $filter:any,
            private toasterService: common.services.ToasterService,
            private offerService: services.OfferService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void { }

        public loadInitialData(): void { }

        private addEditOffer(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'Edit Offer';
                var model:any = {};
                angular.copy(item, model);

                if (model.offerType == common.enums.OfferType.Fixed) { model.value = this.$filter('toRateOnly')(model.value); }
                if (model.minDeposit > 0) { model.minDeposit = this.$filter('toRateOnly')(model.minDeposit); }
                if (model.maxDeposit > 0) { model.maxDeposit = this.$filter('toRateOnly')(model.maxDeposit); }
                if (model.offerBudget > 0) { model.offerBudget = this.$filter('toRateOnly')(model.offerBudget); }
                if (model.valueUpTo > 0) { model.valueUpTo = this.$filter('toRateOnly')(model.valueUpTo); }
               
                if (model.depositVariations && model.depositVariations.length > 0) {
                    angular.forEach(model.depositVariations, (d: any) => {
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

            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }


        private deleteOffer(id: any): void {
            this.offerService.deleteAgentOffer(id)
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
            return this.offerService.getAgentOffers(model);
        }


        private getOfferOn(on: any) { return common.enums.OfferOn[on]; }

        private getOfferType(t: any) { return common.enums.OfferType[t]; }
    }

    angular.module('intranet.master').controller('manageAgentOffersCtrl', ManageAgentOffersCtrl);
}