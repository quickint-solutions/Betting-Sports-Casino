var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (PTCode) {
                PTCode[PTCode["CRICKET"] = 1] = "CRICKET";
                PTCode[PTCode["SOCCER"] = 2] = "SOCCER";
                PTCode[PTCode["TENNIS"] = 3] = "TENNIS";
                PTCode[PTCode["RACE"] = 8] = "RACE";
                PTCode[PTCode["CASINO"] = 16] = "CASINO";
                PTCode[PTCode["OTHER"] = 32] = "OTHER";
            })(enums.PTCode || (enums.PTCode = {}));
            var PTCode = enums.PTCode;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PTCode.js.map