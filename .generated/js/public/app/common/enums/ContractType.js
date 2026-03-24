var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (ContractType) {
                ContractType[ContractType["Perpetual"] = 0] = "Perpetual";
                ContractType[ContractType["CurrentMonth"] = 1] = "CurrentMonth";
                ContractType[ContractType["CurrentQuarter"] = 2] = "CurrentQuarter";
                ContractType[ContractType["CurrentQuarterDelivering"] = 3] = "CurrentQuarterDelivering";
                ContractType[ContractType["NextQuarter"] = 4] = "NextQuarter";
                ContractType[ContractType["NextQuarterDelivering"] = 5] = "NextQuarterDelivering";
                ContractType[ContractType["NextMonth"] = 6] = "NextMonth";
                ContractType[ContractType["Unknown"] = 7] = "Unknown";
            })(enums.ContractType || (enums.ContractType = {}));
            var ContractType = enums.ContractType;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ContractType.js.map