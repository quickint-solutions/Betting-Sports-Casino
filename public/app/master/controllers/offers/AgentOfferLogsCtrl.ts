module intranet.master {

    export interface IAgentOfferLogScope extends intranet.common.IScopeBase {
    }

    export class AgentOfferLogCtrl extends intranet.common.ControllerBase<IAgentOfferLogScope>
        implements intranet.common.init.IInit {
        constructor($scope: IAgentOfferLogScope,
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
            return this.offerService.getAgentOfferLog(model);
        }
    }
    angular.module('intranet.master').controller('agentOfferLogCtrl', AgentOfferLogCtrl);
}