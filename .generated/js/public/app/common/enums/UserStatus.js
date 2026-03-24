var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (UserStatus) {
                UserStatus[UserStatus["Active"] = 2] = "Active";
                UserStatus[UserStatus["Inactive"] = 3] = "Inactive";
                UserStatus[UserStatus["Suspended"] = 4] = "Suspended";
                UserStatus[UserStatus["Close"] = 5] = "Close";
            })(enums.UserStatus || (enums.UserStatus = {}));
            var UserStatus = enums.UserStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UserStatus.js.map