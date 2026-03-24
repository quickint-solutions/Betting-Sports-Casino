var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class ToastConfig {
                constructor(type, title, message, timeout = 10000) {
                    this.type = type;
                    this.title = title;
                    this.message = message;
                    this.timeout = timeout;
                }
                getTypeDescription() {
                    switch (this.type) {
                        case helpers.ToastType.Error:
                            return 'error';
                        case helpers.ToastType.Info:
                            return 'info';
                        case helpers.ToastType.Success:
                            return 'success';
                        case helpers.ToastType.Warning:
                            return 'warning';
                    }
                }
            }
            helpers.ToastConfig = ToastConfig;
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ToastConfig.js.map