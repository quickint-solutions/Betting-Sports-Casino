var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (SupportedChannel) {
                SupportedChannel[SupportedChannel["SMS"] = 1] = "SMS";
                SupportedChannel[SupportedChannel["WhatsApp"] = 2] = "WhatsApp";
                SupportedChannel[SupportedChannel["Both"] = 3] = "Both";
            })(enums.SupportedChannel || (enums.SupportedChannel = {}));
            var SupportedChannel = enums.SupportedChannel;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SupportedChannel.js.map