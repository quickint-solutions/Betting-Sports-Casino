var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (FairXPayOutStatus) {
                FairXPayOutStatus[FairXPayOutStatus["Pending"] = 1] = "Pending";
                FairXPayOutStatus[FairXPayOutStatus["InProcess"] = 2] = "InProcess";
                FairXPayOutStatus[FairXPayOutStatus["Confirm"] = 3] = "Confirm";
                FairXPayOutStatus[FairXPayOutStatus["Rejected"] = 4] = "Rejected";
            })(enums.FairXPayOutStatus || (enums.FairXPayOutStatus = {}));
            var FairXPayOutStatus = enums.FairXPayOutStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FairXPayOutStatus.js.map