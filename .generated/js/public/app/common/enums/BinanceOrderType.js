var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (ContractType) {
                ContractType[ContractType["Limit"] = 0] = "Limit";
                ContractType[ContractType["Market"] = 1] = "Market";
                ContractType[ContractType["StopLoss"] = 2] = "StopLoss";
                ContractType[ContractType["StopLossLimit"] = 3] = "StopLossLimit";
                ContractType[ContractType["StopMarket"] = 5] = "StopMarket";
                ContractType[ContractType["TakeProfitMarket"] = 7] = "TakeProfitMarket";
                ContractType[ContractType["TakeProfitLimit"] = 8] = "TakeProfitLimit";
                ContractType[ContractType["TrailingStopMarket"] = 10] = "TrailingStopMarket";
                ContractType[ContractType["PostOnly"] = 11] = "PostOnly";
            })(enums.ContractType || (enums.ContractType = {}));
            var ContractType = enums.ContractType;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BinanceOrderType.js.map