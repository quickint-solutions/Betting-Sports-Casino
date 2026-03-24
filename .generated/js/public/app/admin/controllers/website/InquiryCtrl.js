var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class InquiryCtrl extends intranet.common.ControllerBase {
            constructor($scope, $state, settings, messageService) {
                super($scope);
                this.$state = $state;
                this.settings = settings;
                this.messageService = messageService;
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.messageService.getInquiries(model);
            }
        }
        admin.InquiryCtrl = InquiryCtrl;
        angular.module('intranet.admin').controller('inquiryCtrl', InquiryCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=InquiryCtrl.js.map