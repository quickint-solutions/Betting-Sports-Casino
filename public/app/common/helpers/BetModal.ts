namespace intranet.common.helpers {
    export class BetModal {
        model: any;

        constructor(m: any, side: any, runnerId: any, price: any, runnerName: string, isHorse: boolean = false,
            eventName: string = '', percentage: any = 100, isMobile: boolean = false) {
            if (percentage == '') { percentage = 100; }
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
                source:m.source,
                canChange: (m.bettingType == 6 || m.bettingType == 7) ? false : true
            }
            if (m.eventType && m.eventType.id) { this.model.eventTypeId = m.eventType.id; } else {
                this.model.eventTypeId = 0;
            }
        }

    }
}