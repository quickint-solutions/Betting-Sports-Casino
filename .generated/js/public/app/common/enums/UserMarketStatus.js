var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (UserMarketStatus) {
                UserMarketStatus[UserMarketStatus["Open"] = 1] = "Open";
                UserMarketStatus[UserMarketStatus["BetStop"] = 2] = "BetStop";
                UserMarketStatus[UserMarketStatus["BetStopWithHide"] = 3] = "BetStopWithHide";
            })(enums.UserMarketStatus || (enums.UserMarketStatus = {}));
            var UserMarketStatus = enums.UserMarketStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UserMarketStatus.js.map