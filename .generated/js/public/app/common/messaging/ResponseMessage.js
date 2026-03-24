var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var messaging;
        (function (messaging) {
            class ResponseMessage {
                constructor(type, txt, propPath) {
                    this.responseMessageType = type;
                    this.text = txt;
                    this.propertyPath = propPath;
                }
            }
            messaging.ResponseMessage = ResponseMessage;
        })(messaging = common.messaging || (common.messaging = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ResponseMessage.js.map