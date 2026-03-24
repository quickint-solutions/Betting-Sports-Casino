var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var enums;
        (function (enums) {
            (function (EventSource) {
                EventSource[EventSource["Betfair"] = 1] = "Betfair";
                EventSource[EventSource["System"] = 2] = "System";
                EventSource[EventSource["Bridge"] = 3] = "Bridge";
                EventSource[EventSource["APITop"] = 4] = "APITop";
                EventSource[EventSource["FancyApi"] = 5] = "FancyApi";
                EventSource[EventSource["PK"] = 6] = "PK";
            })(enums.EventSource || (enums.EventSource = {}));
            var EventSource = enums.EventSource;
        })(enums = common.enums || (common.enums = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EventSource.js.map