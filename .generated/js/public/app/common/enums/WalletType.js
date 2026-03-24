var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (WalletType) {
                WalletType[WalletType["MasterWallet"] = 1] = "MasterWallet";
                WalletType[WalletType["SettlementWallet"] = 2] = "SettlementWallet";
                WalletType[WalletType["Client"] = 3] = "Client";
            })(enums.WalletType || (enums.WalletType = {}));
            var WalletType = enums.WalletType;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=WalletType.js.map