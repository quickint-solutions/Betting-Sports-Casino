module intranet.admin {

    export interface IInquiryScope extends intranet.common.IScopeBase {
    }

    export class InquiryCtrl extends intranet.common.ControllerBase<IInquiryScope>
    {
        constructor($scope: IInquiryScope,
            private $state: any,
            private settings: common.IBaseSettings,
            private messageService: services.MessageService) {
            super($scope);
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.messageService.getInquiries(model);
        }
    }

    angular.module('intranet.admin').controller('inquiryCtrl', InquiryCtrl);
}