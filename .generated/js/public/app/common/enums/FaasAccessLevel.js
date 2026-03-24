var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (FaasAccessLevel) {
                FaasAccessLevel[FaasAccessLevel["OnlyGames"] = 1] = "OnlyGames";
                FaasAccessLevel[FaasAccessLevel["OnlySports"] = 2] = "OnlySports";
                FaasAccessLevel[FaasAccessLevel["All"] = 3] = "All";
            })(enums.FaasAccessLevel || (enums.FaasAccessLevel = {}));
            var FaasAccessLevel = enums.FaasAccessLevel;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FaasAccessLevel.js.map