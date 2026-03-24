var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (RunnerStatus) {
                RunnerStatus[RunnerStatus["ACTIVE"] = 1] = "ACTIVE";
                RunnerStatus[RunnerStatus["WINNER"] = 2] = "WINNER";
                RunnerStatus[RunnerStatus["LOSER"] = 3] = "LOSER";
                RunnerStatus[RunnerStatus["REMOVED"] = 6] = "REMOVED";
            })(enums.RunnerStatus || (enums.RunnerStatus = {}));
            var RunnerStatus = enums.RunnerStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=RunnerStatus.js.map