var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (DepositOptinos) {
                DepositOptinos[DepositOptinos["Bank"] = 1] = "Bank";
                DepositOptinos[DepositOptinos["UPI"] = 2] = "UPI";
                DepositOptinos[DepositOptinos["GPay"] = 3] = "GPay";
                DepositOptinos[DepositOptinos["Paytm"] = 4] = "Paytm";
                DepositOptinos[DepositOptinos["PhonePay"] = 5] = "PhonePay";
                DepositOptinos[DepositOptinos["MobiKwik"] = 6] = "MobiKwik";
                DepositOptinos[DepositOptinos["AmazonPay"] = 7] = "AmazonPay";
            })(enums.DepositOptinos || (enums.DepositOptinos = {}));
            var DepositOptinos = enums.DepositOptinos;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=DepositOptions.js.map