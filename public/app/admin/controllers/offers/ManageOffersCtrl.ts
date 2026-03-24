module intranet.admin {

    export interface IManageOffersScope extends intranet.common.IScopeBase {
    }

    export class ManageOffersCtrl extends intranet.common.ControllerBase<IManageOffersScope>
        implements intranet.common.init.IInit {
        constructor($scope: IManageOffersScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private toasterService: common.services.ToasterService,
            private websiteService: services.WebsiteService,
            private offerService: services.OfferService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {  }

        public loadInitialData(): void { }

        private addEditOffer(item: any = null): void {
            var modal = new common.helpers.CreateModal();
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
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGrid');
                }
            });
        }


        private deleteOffer(id: any): void {
            this.offerService.deleteOffer(id)
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
            return this.offerService.getOffers(model);
        }


        private getOfferOn(on: any) { return common.enums.OfferOn[on]; }

        private getOfferType(t: any) { return common.enums.OfferType[t]; }
    }

    angular.module('intranet.admin').controller('manageOffersCtrl', ManageOffersCtrl);
}