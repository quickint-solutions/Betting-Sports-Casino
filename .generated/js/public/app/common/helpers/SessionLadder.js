var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class SessionLadder {
                static getRange() {
                    var sessionList = [];
                    sessionList.push({ name: 'Q', v1: 250, v2: 150, single: false });
                    sessionList.push({ name: 'W', v1: 110, v2: 95, single: false });
                    sessionList.push({ name: 'E', v1: 120, v2: 90, single: false });
                    sessionList.push({ name: 'R', v1: 150, v2: 100, single: false });
                    sessionList.push({ name: 'T', v1: 120, v2: 80, single: false });
                    sessionList.push({ name: 'Y', v1: 250, v2: 150, single: false });
                    sessionList.push({ name: 'U', v1: 400, v2: 200, single: false });
                    sessionList.push({ name: 'I', v1: 400, v2: 250, single: false });
                    sessionList.push({ name: 'O', v1: 500, v2: 300, single: false });
                    sessionList.push({ name: 'P', v1: 120, v2: 100, single: false });
                    sessionList.push({ name: 'A', v1: 200, v2: 130, single: false });
                    sessionList.push({ name: 'S', v1: 105, v2: 95, single: false });
                    sessionList.push({ name: 'D', v1: 115, v2: 90, single: false });
                    sessionList.push({ name: 'F', v1: 125, v2: 105, single: false });
                    sessionList.push({ name: 'G', v1: 115, v2: 95, single: false });
                    sessionList.push({ name: 'H', v1: 2, v2: 0, single: true });
                    sessionList.push({ name: 'J', v1: 3, v2: 0, single: true });
                    sessionList.push({ name: 'K', v1: 140, v2: 90, single: false });
                    sessionList.push({ name: 'L', v1: 100, v2: 80, single: false });
                    sessionList.push({ name: 'Z', v1: 120, v2: 80, single: false });
                    sessionList.push({ name: 'X', v1: 105, v2: 90, single: false });
                    sessionList.push({ name: 'C', v1: 110, v2: 90, single: false });
                    sessionList.push({ name: 'V', v1: 95, v2: 75, single: false });
                    sessionList.push({ name: 'B', v1: 115, v2: 85, single: false });
                    sessionList.push({ name: 'N', v1: 100, v2: 50, single: false });
                    sessionList.push({ name: 'M', v1: 600, v2: 400, single: false });
                    return sessionList;
                }
            }
            helpers.SessionLadder = SessionLadder;
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SessionLadder.js.map