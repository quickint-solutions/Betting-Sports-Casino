var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class CreateModal {
                constructor() {
                    this.options = new intranet.common.services.ModalOptions();
                }
                SetModal() {
                    this.options.header = this.header;
                    this.options.data = this.data;
                    this.options.bodyUrl = this.bodyUrl;
                    this.options.bodyHtml = this.bodyHtml;
                    var modalDefaults = new intranet.common.services.ModalDefaults();
                    if (this.size) {
                        modalDefaults.size = this.size;
                    }
                    if (this.templateUrl) {
                        modalDefaults.templateUrl = this.templateUrl;
                    }
                    modalDefaults.controller = this.controller;
                    modalDefaults.resolve = {
                        modalOptions: () => {
                            return this.options;
                        }
                    };
                    this.modalDefaults = modalDefaults;
                }
            }
            helpers.CreateModal = CreateModal;
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CreateModal.js.map