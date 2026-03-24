var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (UserType) {
                UserType[UserType["SuperAdmin"] = 0] = "SuperAdmin";
                UserType[UserType["Admin"] = 1] = "Admin";
                UserType[UserType["SuperMaster"] = 2] = "SuperMaster";
                UserType[UserType["Master"] = 3] = "Master";
                UserType[UserType["Agent"] = 4] = "Agent";
                UserType[UserType["Player"] = 5] = "Player";
                UserType[UserType["PLS"] = 6] = "PLS";
                UserType[UserType["BM"] = 7] = "BM";
                UserType[UserType["SBM"] = 8] = "SBM";
                UserType[UserType["Manager"] = 9] = "Manager";
                UserType[UserType["CP"] = 10] = "CP";
                UserType[UserType["Radar"] = 11] = "Radar";
                UserType[UserType["Operator"] = 12] = "Operator";
            })(enums.UserType || (enums.UserType = {}));
            var UserType = enums.UserType;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UserType.js.map