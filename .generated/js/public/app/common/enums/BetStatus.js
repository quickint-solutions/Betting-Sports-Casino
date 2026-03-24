var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (BetStatus) {
                BetStatus[BetStatus["Pending"] = 1] = "Pending";
                BetStatus[BetStatus["ExecutionComplete"] = 2] = "ExecutionComplete";
                BetStatus[BetStatus["Executable"] = 3] = "Executable";
                BetStatus[BetStatus["Expired"] = 4] = "Expired";
            })(enums.BetStatus || (enums.BetStatus = {}));
            var BetStatus = enums.BetStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetStatus.js.map