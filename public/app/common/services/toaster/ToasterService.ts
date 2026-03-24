namespace intranet.common.services {
    export class ToasterService {
        /* @ngInject */
        constructor(private toaster: ngtoaster.IToasterService,
            private $filter: ng.IFilterService) {
        }

        public showToastNotification(toastConfig: intranet.common.helpers.ToastConfig): void {
            this.toaster.pop(toastConfig.getTypeDescription(),
                this.$filter('translate')(toastConfig.title),
                this.$filter('translate')(toastConfig.message),
                toastConfig.timeout,
                null,
                toastConfig.clickHandler,
                null,
                true);
        }

        public showToast(toastType: intranet.common.helpers.ToastType, message: string, timeout = 5000): void {
            this.toaster.pop(this.getType(toastType),
                '', //this.$filter('translate')(toastConfig.title),
                this.$filter('translate')(message),
                timeout,
                null,
                null,
                null,
                true);
        }

        public showToastMessage(toastType: intranet.common.helpers.ToastType, message: string, timeout = 5000): void {
            this.toaster.pop(this.getType(toastType),
                '', //this.$filter('translate')(toastConfig.title),
                message,
                timeout,
                'trustedHtml',
                null,
                null,
                true);
        }

        public showMessages(messages: common.messaging.IResponseMessage[], timeout = 5000): void {
            angular.forEach(messages, (msg) => {
                var toastType = 'error';
                if (msg.responseMessageType == messaging.ResponseMessageType.Success) { toastType = 'success' }
                if (msg.responseMessageType == messaging.ResponseMessageType.Info) { toastType = 'info' }
                if (msg.responseMessageType == messaging.ResponseMessageType.Warning) { toastType = 'warning' }

                this.toaster.pop(toastType,
                    '',
                    msg.text,
                    timeout,
                    null,
                    null,
                    null,
                    true);

            });
        }

        public getType(type: any): string {
            switch (type) {
                case common.helpers.ToastType.Error:
                    return 'error';
                case common.helpers.ToastType.Info:
                    return 'info';
                case common.helpers.ToastType.Success:
                    return 'success';
                case common.helpers.ToastType.Warning:
                    return 'warning';
            }
        }
    }

    //register service
    angular.module('intranet.common.services').service('toasterService', ToasterService);
}