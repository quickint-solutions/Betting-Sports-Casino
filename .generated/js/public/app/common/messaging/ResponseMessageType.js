var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var messaging;
        (function (messaging) {
            (function (ResponseMessageType) {
                ResponseMessageType[ResponseMessageType["Success"] = 0] = "Success";
                ResponseMessageType[ResponseMessageType["Info"] = 1] = "Info";
                ResponseMessageType[ResponseMessageType["Warning"] = 2] = "Warning";
                ResponseMessageType[ResponseMessageType["Validation"] = 4] = "Validation";
                ResponseMessageType[ResponseMessageType["Error"] = 8] = "Error";
                ResponseMessageType[ResponseMessageType["Confirmation"] = 16] = "Confirmation";
                ResponseMessageType[ResponseMessageType["Unauthorized"] = 401] = "Unauthorized";
            })(messaging.ResponseMessageType || (messaging.ResponseMessageType = {}));
            var ResponseMessageType = messaging.ResponseMessageType;
        })(messaging = common.messaging || (common.messaging = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ResponseMessageType.js.map