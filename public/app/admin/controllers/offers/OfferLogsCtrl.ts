module intranet.admin {

    export interface IOfferLogScope extends intranet.common.IScopeBase {
    }

    export class OfferLogCtrl extends intranet.common.ControllerBase<IOfferLogScope>
        implements intranet.common.init.IInit {
        constructor($scope: IOfferLogScope,
            private $stateParams: any,
            private offerService: services.OfferService) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void { }

        public loadInitialData(): void { }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters, id: this.$stateParams.id };
            return this.offerService.getOfferLog(model);
        }
    }
    angular.module('intranet.admin').controller('offerLogCtrl', OfferLogCtrl);
}