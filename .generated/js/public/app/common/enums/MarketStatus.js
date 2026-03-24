var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (MarketStatus) {
                MarketStatus[MarketStatus["INACTIVE"] = 1] = "INACTIVE";
                MarketStatus[MarketStatus["OPEN"] = 2] = "OPEN";
                MarketStatus[MarketStatus["SUSPENDED"] = 3] = "SUSPENDED";
                MarketStatus[MarketStatus["CLOSED"] = 4] = "CLOSED";
            })(enums.MarketStatus || (enums.MarketStatus = {}));
            var MarketStatus = enums.MarketStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MarketStatus.js.map