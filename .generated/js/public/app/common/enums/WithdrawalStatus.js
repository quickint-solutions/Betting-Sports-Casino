var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (WithdrawalStatus) {
                WithdrawalStatus[WithdrawalStatus["Pending"] = 1] = "Pending";
                WithdrawalStatus[WithdrawalStatus["Confirm"] = 2] = "Confirm";
                WithdrawalStatus[WithdrawalStatus["Reject"] = 3] = "Reject";
            })(enums.WithdrawalStatus || (enums.WithdrawalStatus = {}));
            var WithdrawalStatus = enums.WithdrawalStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=WithdrawalStatus.js.map