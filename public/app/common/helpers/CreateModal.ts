namespace intranet.common.helpers {
    export class CreateModal {
        options: intranet.common.services.ModalOptions;
        modalDefaults: intranet.common.services.ModalDefaults;
        header: string;
        data: any;
        bodyUrl: string;
        bodyHtml: string;
        controller: string;
        size: string;
        templateUrl: string;

        constructor() { this.options = new intranet.common.services.ModalOptions();}

        public SetModal() {
            this.options.header = this.header;
            this.options.data = this.data;
            this.options.bodyUrl = this.bodyUrl;
            this.options.bodyHtml = this.bodyHtml;

            var modalDefaults: any = new intranet.common.services.ModalDefaults();
            if (this.size) { modalDefaults.size = this.size; }
            if (this.templateUrl) { modalDefaults.templateUrl = this.templateUrl; }
            modalDefaults.controller = this.controller;
            modalDefaults.resolve = {
                modalOptions: () => {
                    return this.options;
                }
            };
            this.modalDefaults = modalDefaults;
        }

    }
}