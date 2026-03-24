var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class ModalOptions {
                constructor() {
                    this.closeButton = 'common.button.cancel';
                    this.actionButton = 'common.button.save';
                    this.extraButton = '';
                    this.newRecord = true;
                    this.showFooter = true;
                }
            }
            services.ModalOptions = ModalOptions;
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ModalOptions.js.map