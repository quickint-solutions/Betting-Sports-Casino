var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (TemporaryStatus) {
                TemporaryStatus[TemporaryStatus["OPEN"] = 1] = "OPEN";
                TemporaryStatus[TemporaryStatus["BALL"] = 2] = "BALL";
                TemporaryStatus[TemporaryStatus["STOPBETTING"] = 3] = "STOPBETTING";
                TemporaryStatus[TemporaryStatus["SUSPEND"] = 4] = "SUSPEND";
            })(enums.TemporaryStatus || (enums.TemporaryStatus = {}));
            var TemporaryStatus = enums.TemporaryStatus;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=TemporaryStatus.js.map