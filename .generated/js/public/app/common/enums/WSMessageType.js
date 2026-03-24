var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (WSMessageType) {
                WSMessageType[WSMessageType["Auth"] = 1] = "Auth";
                WSMessageType[WSMessageType["BetSize"] = 2] = "BetSize";
                WSMessageType[WSMessageType["Score"] = 3] = "Score";
                WSMessageType[WSMessageType["MarketCount"] = 4] = "MarketCount";
                WSMessageType[WSMessageType["Announcement"] = 5] = "Announcement";
                WSMessageType[WSMessageType["MasterAnnouncement"] = 6] = "MasterAnnouncement";
                WSMessageType[WSMessageType["SubscribeMarket"] = 7] = "SubscribeMarket";
                WSMessageType[WSMessageType["OddsChanged"] = 8] = "OddsChanged";
                WSMessageType[WSMessageType["Ping"] = 9] = "Ping";
                WSMessageType[WSMessageType["Error"] = 10] = "Error";
                WSMessageType[WSMessageType["Close"] = 11] = "Close";
                WSMessageType[WSMessageType["Balance"] = 12] = "Balance";
                WSMessageType[WSMessageType["OtherLogin"] = 13] = "OtherLogin";
                WSMessageType[WSMessageType["DepositRequest"] = 14] = "DepositRequest";
                WSMessageType[WSMessageType["WithdrawalRequest"] = 15] = "WithdrawalRequest";
                WSMessageType[WSMessageType["DepositRequestConfirm"] = 16] = "DepositRequestConfirm";
                WSMessageType[WSMessageType["WithdrawalRequestConfirm"] = 17] = "WithdrawalRequestConfirm";
                WSMessageType[WSMessageType["ListSocket"] = 100] = "ListSocket";
                WSMessageType[WSMessageType["SymbolTickPrice"] = 101] = "SymbolTickPrice";
                WSMessageType[WSMessageType["SymbolDepth"] = 102] = "SymbolDepth";
                WSMessageType[WSMessageType["SymbolTrade"] = 103] = "SymbolTrade";
                WSMessageType[WSMessageType["SymbolKLine"] = 104] = "SymbolKLine";
                WSMessageType[WSMessageType["SymbolMark"] = 105] = "SymbolMark";
                WSMessageType[WSMessageType["SubscribeSymbol"] = 107] = "SubscribeSymbol";
                WSMessageType[WSMessageType["SubscribeSymbolDepth"] = 108] = "SubscribeSymbolDepth";
            })(enums.WSMessageType || (enums.WSMessageType = {}));
            var WSMessageType = enums.WSMessageType;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=WSMessageType.js.map