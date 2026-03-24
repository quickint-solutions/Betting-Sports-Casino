var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            (function (ModalResult) {
                ModalResult[ModalResult["OK"] = 0] = "OK";
                ModalResult[ModalResult["Cancel"] = 1] = "Cancel";
                ModalResult[ModalResult["Extra"] = 2] = "Extra";
            })(services.ModalResult || (services.ModalResult = {}));
            var ModalResult = services.ModalResult;
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ModalResult.js.map