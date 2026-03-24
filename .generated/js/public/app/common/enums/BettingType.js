var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (BettingType) {
                BettingType[BettingType["ODDS"] = 1] = "ODDS";
                BettingType[BettingType["LINE"] = 2] = "LINE";
                BettingType[BettingType["RANGE"] = 3] = "RANGE";
                BettingType[BettingType["ASIAN_HANDICAP_DOUBLE_LINE"] = 4] = "ASIAN_HANDICAP_DOUBLE_LINE";
                BettingType[BettingType["ASIAN_HANDICAP_SINGLE_LINE"] = 5] = "ASIAN_HANDICAP_SINGLE_LINE";
                BettingType[BettingType["FIXED_ODDS"] = 6] = "FIXED_ODDS";
                BettingType[BettingType["SESSION"] = 7] = "SESSION";
                BettingType[BettingType["SCORE_RANGE"] = 8] = "SCORE_RANGE";
                BettingType[BettingType["BM"] = 9] = "BM";
            })(enums.BettingType || (enums.BettingType = {}));
            var BettingType = enums.BettingType;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BettingType.js.map