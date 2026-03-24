var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (CaptchaMode) {
                CaptchaMode[CaptchaMode["None"] = 1] = "None";
                CaptchaMode[CaptchaMode["System"] = 2] = "System";
                CaptchaMode[CaptchaMode["GoogleV2"] = 3] = "GoogleV2";
                CaptchaMode[CaptchaMode["GoogleV3"] = 4] = "GoogleV3";
            })(enums.CaptchaMode || (enums.CaptchaMode = {}));
            var CaptchaMode = enums.CaptchaMode;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CaptchaMode.js.map