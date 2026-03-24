var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            (function (ToastType) {
                ToastType[ToastType["Error"] = 0] = "Error";
                ToastType[ToastType["Info"] = 1] = "Info";
                ToastType[ToastType["Success"] = 2] = "Success";
                ToastType[ToastType["Warning"] = 3] = "Warning";
            })(helpers.ToastType || (helpers.ToastType = {}));
            var ToastType = helpers.ToastType;
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ToastType.js.map