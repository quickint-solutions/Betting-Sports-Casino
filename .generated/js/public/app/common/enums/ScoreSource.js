var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (ScoreSource) {
                ScoreSource[ScoreSource["Own"] = 1] = "Own";
                ScoreSource[ScoreSource["Betfair"] = 2] = "Betfair";
                ScoreSource[ScoreSource["Feedbase"] = 3] = "Feedbase";
                ScoreSource[ScoreSource["AANS"] = 4] = "AANS";
            })(enums.ScoreSource || (enums.ScoreSource = {}));
            var ScoreSource = enums.ScoreSource;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ScoreSource.js.map