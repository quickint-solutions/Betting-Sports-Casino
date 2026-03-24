var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (StorageMode) {
                StorageMode[StorageMode["LocalStorage"] = 1] = "LocalStorage";
                StorageMode[StorageMode["SessionStorage"] = 2] = "SessionStorage";
            })(enums.StorageMode || (enums.StorageMode = {}));
            var StorageMode = enums.StorageMode;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=StorageMode.js.map