var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (CryptoWithdrawalStatus) {
                CryptoWithdrawalStatus[CryptoWithdrawalStatus["Pending"] = 1] = "Pending";
                CryptoWithdrawalStatus[CryptoWithdrawalStatus["Confirm"] = 2] = "Confirm";
                CryptoWithdrawalStatus[CryptoWithdrawalStatus["Cancel"] = 3] = "Cancel";
                CryptoWithdrawalStatus[CryptoWithdrawalStatus["Error"] = 4] = "Error";
                CryptoWithdrawalStatus[CryptoWithdrawalStatus["InProcess"] = 5] = "InProcess";
            })(enums.CryptoWithdrawalStatus || (enums.CryptoWithdrawalStatus = {}));
            var CryptoWithdrawalStatus = enums.CryptoWithdrawalStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CryptoWithdrawalStatus.js.map