var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class EventTypeHelper {
                static fillIconClass() {
                    this.icons.push({ id: 1, class: 'ico-soccer' });
                    this.icons.push({ id: 2, class: 'ico-tennis' });
                    this.icons.push({ id: 4, class: 'ico-cricket' });
                }
                static setIcons(eventTypes, gameid, raceid, binaryid = []) {
                    this.fillIconClass();
                    eventTypes.forEach((e) => {
                        var index = common.helpers.Utility.IndexOfObject(this.icons, 'id', e.id);
                        if (index > -1) {
                            e.iconClass = this.icons[index].class;
                        }
                        else {
                            e.iconClass = 'ico-common';
                        }
                        e.isLiveGame = gameid.indexOf(e.id) >= 0;
                        e.isRace = raceid.indexOf(e.id) >= 0;
                        e.isBinary = binaryid.indexOf(e.id) >= 0;
                    });
                    return eventTypes;
                }
            }
            EventTypeHelper.icons = [];
            helpers.EventTypeHelper = EventTypeHelper;
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EventTypeHelper.js.map