var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class BetModal {
                constructor(m, side, runnerId, price, runnerName, isHorse = false, eventName = '', percentage = 100, isMobile = false) {
                    if (percentage == '') {
                        percentage = 100;
                    }
                    this.model = {
                        marketId: m.id,
                        runnerId: runnerId,
                        side: side,
                        price: price,
                        marketName: m.name,
                        runnerName: runnerName,
                        eventName: isHorse == true ? eventName : m.event.name,
                        eventId: m.eventId,
                        priceLadderType: m.priceLadderType,
                        maxUnitValue: m.maxUnitValue,
                        minUnitValue: m.minUnitValue,
                        interval: m.interval,
                        bettingType: m.bettingType,
                        gameType: m.gameType,
                        isHorse: isHorse,
                        percentage: percentage,
                        maxBet: m.maxBet,
                        maxLiability: m.maxLiability,
                        maxProfit: m.maxProfit,
                        isMobile: isMobile,
                        betDelay: m.betDelay,
                        temporaryStatus: m.temporaryStatus,
                        source: m.source,
                        canChange: (m.bettingType == 6 || m.bettingType == 7) ? false : true
                    };
                    if (m.eventType && m.eventType.id) {
                        this.model.eventTypeId = m.eventType.id;
                    }
                    else {
                        this.model.eventTypeId = 0;
                    }
                }
            }
            helpers.BetModal = BetModal;
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetModal.js.map