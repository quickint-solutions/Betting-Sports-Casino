var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (LogLevel) {
                LogLevel[LogLevel["Debug"] = 10] = "Debug";
                LogLevel[LogLevel["Information"] = 20] = "Information";
                LogLevel[LogLevel["Warning"] = 30] = "Warning";
                LogLevel[LogLevel["Error"] = 40] = "Error";
                LogLevel[LogLevel["Fatal"] = 50] = "Fatal";
            })(enums.LogLevel || (enums.LogLevel = {}));
            var LogLevel = enums.LogLevel;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LogLevel.js.map