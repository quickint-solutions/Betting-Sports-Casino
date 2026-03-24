namespace intranet.common.services {
    export class ModalOptions {
        closeButton: string;
        actionButton: string;
        extraButton: string;
        header: string;
        body: string;
        icon: string;
        bodyHtml: string;
        bodyUrl: string;
        id: string;
        data: any;
        newRecord: boolean;
        ok: any;
        close: any;
        extraClick: any;
        size: any;
        modalClass: any;
        showFooter: any;

        constructor() {
            this.closeButton = 'common.button.cancel';
            this.actionButton = 'common.button.save';
            this.extraButton = '';
            this.newRecord = true;
            this.showFooter = true;
        }
    }
}