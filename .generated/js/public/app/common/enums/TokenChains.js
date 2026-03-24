var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (TokenChains) {
                TokenChains[TokenChains["ERC20"] = 1] = "ERC20";
                TokenChains[TokenChains["BEP20"] = 56] = "BEP20";
                TokenChains[TokenChains["TRC20"] = 88] = "TRC20";
                TokenChains[TokenChains["Solana"] = 4] = "Solana";
                TokenChains[TokenChains["Polygon"] = 5] = "Polygon";
                TokenChains[TokenChains["Cronos"] = 6] = "Cronos";
                TokenChains[TokenChains["Arbitrum"] = 7] = "Arbitrum";
                TokenChains[TokenChains["AVAXC"] = 8] = "AVAXC";
                TokenChains[TokenChains["Optimism"] = 9] = "Optimism";
                TokenChains[TokenChains["BTC"] = 10] = "BTC";
                TokenChains[TokenChains["BEP20Test"] = 97] = "BEP20Test";
            })(enums.TokenChains || (enums.TokenChains = {}));
            var TokenChains = enums.TokenChains;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=TokenChains.js.map