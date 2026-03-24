var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (OTPProvider) {
                OTPProvider[OTPProvider["Twilio"] = 1] = "Twilio";
                OTPProvider[OTPProvider["NXCloud"] = 2] = "NXCloud";
            })(enums.OTPProvider || (enums.OTPProvider = {}));
            var OTPProvider = enums.OTPProvider;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=OTPProvider.js.map