var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (OffPayStatus) {
                OffPayStatus[OffPayStatus["Init"] = 1] = "Init";
                OffPayStatus[OffPayStatus["Confirm"] = 2] = "Confirm";
                OffPayStatus[OffPayStatus["Cancel"] = 3] = "Cancel";
                OffPayStatus[OffPayStatus["Expired"] = 4] = "Expired";
            })(enums.OffPayStatus || (enums.OffPayStatus = {}));
            var OffPayStatus = enums.OffPayStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=OffPayStatus.js.map