var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class ToasterService {
                constructor(toaster, $filter) {
                    this.toaster = toaster;
                    this.$filter = $filter;
                }
                showToastNotification(toastConfig) {
                    this.toaster.pop(toastConfig.getTypeDescription(), this.$filter('translate')(toastConfig.title), this.$filter('translate')(toastConfig.message), toastConfig.timeout, null, toastConfig.clickHandler, null, true);
                }
                showToast(toastType, message, timeout = 5000) {
                    this.toaster.pop(this.getType(toastType), '', this.$filter('translate')(message), timeout, null, null, null, true);
                }
                showToastMessage(toastType, message, timeout = 5000) {
                    this.toaster.pop(this.getType(toastType), '', message, timeout, 'trustedHtml', null, null, true);
                }
                showMessages(messages, timeout = 5000) {
                    angular.forEach(messages, (msg) => {
                        var toastType = 'error';
                        if (msg.responseMessageType == common.messaging.ResponseMessageType.Success) {
                            toastType = 'success';
                        }
                        if (msg.responseMessageType == common.messaging.ResponseMessageType.Info) {
                            toastType = 'info';
                        }
                        if (msg.responseMessageType == common.messaging.ResponseMessageType.Warning) {
                            toastType = 'warning';
                        }
                        this.toaster.pop(toastType, '', msg.text, timeout, null, null, null, true);
                    });
                }
                getType(type) {
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
            services.ToasterService = ToasterService;
            angular.module('intranet.common.services').service('toasterService', ToasterService);
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ToasterService.js.map