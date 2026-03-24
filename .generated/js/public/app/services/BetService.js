var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class BetService {
            constructor(baseService, settings, uuid, $filter) {
                this.baseService = baseService;
                this.settings = settings;
                this.uuid = uuid;
                this.$filter = $filter;
            }
            placeBet(data) {
                data.size = this.$filter('toGLC')(data.size);
                data.timestamp = this.uuid.v4();
                if (this.settings.IsFaaS) {
                    return this.baseService.post('liveexchangebet/placebet', data, { ignoreLoadingBar: true, timeout: this.baseService.longTime });
                }
                else {
                    return this.baseService.post('bet/placebet', data, { ignoreLoadingBar: true, timeout: this.baseService.longTime });
                }
            }
            placeBets(data) {
                var request = [];
                if (data.length > 0) {
                    data.forEach((b) => {
                        request.push({
                            marketId: b.marketId,
                            runnerId: b.runnerId,
                            side: b.side,
                            price: b.price,
                            marketName: b.marketName,
                            runnerName: b.runnerName,
                            eventName: b.eventName,
                            eventId: b.eventId,
                            priceLadderType: b.priceLadderType,
                            bettingType: b.bettingType,
                            isHorse: b.isHorse,
                            percentage: b.percentage,
                            size: this.$filter('toGLC')(b.size),
                            interval: b.interval,
                            maxBet: b.maxBet,
                            maxLiability: b.maxLiability,
                            maxProfit: b.maxProfit,
                            maxUnitValue: b.maxUnitValue,
                            minUnitValue: b.minUnitValue,
                            sectionId: b.sectionId,
                            betFrom: b.betFrom,
                            timestamp: this.uuid.v4()
                        });
                    });
                    if (this.settings.IsFaaS) {
                        return this.baseService.post('liveexchangebet/placebets', request, { ignoreLoadingBar: true, timeout: this.baseService.longTime });
                    }
                    else {
                        return this.baseService.post('bet/placebets', request, { ignoreLoadingBar: true, timeout: this.baseService.longTime });
                    }
                }
            }
            updateBet(data) {
                if (this.settings.IsFaaS) {
                    return this.baseService.post('liveexchangebet/updatebet', data, { timeout: this.baseService.longTime });
                }
                else {
                    return this.baseService.post('bet/updatebet', data, { timeout: this.baseService.longTime });
                }
            }
            updateAllBet(data) {
                return this.baseService.post('bet/updatebets', data, { timeout: this.baseService.longTime });
            }
            cancelBet(betid) {
                return this.baseService.get('bet/cancelbet/' + betid, { timeout: this.baseService.longTime });
            }
            cancelAllBets(ids) {
                return this.baseService.post('bet/cancelbets/', ids, { timeout: this.baseService.longTime });
            }
            getBets(data) {
                return this.baseService.post('bet/getbets', data, { timeout: this.baseService.longTime });
            }
            getBetsById(data) {
                return this.baseService.post('bet/getbetsbyid', data, { timeout: this.baseService.longTime });
            }
            getBTLiveBets(data) {
                return this.baseService.post('bet/getbtlivebets', data, { ignoreLoadingBar: true, timeout: this.baseService.longTime });
            }
            voidBet(data) {
                return this.baseService.post('bet/voidbet', data, { timeout: this.baseService.longTime });
            }
            voidBets(data) {
                return this.baseService.post('bet/voidbets', data, { timeout: this.baseService.longTime });
            }
            editRate(data) {
                return this.baseService.post('bet/editbetrate', data, { timeout: this.baseService.longTime });
            }
            getLiveBetSize() {
                return this.baseService.get('bet/getlivebetsize');
            }
            getLiveBets(data) {
                return this.baseService.post('bet/getlivebets', data, { timeout: this.baseService.longTime });
            }
            getLiveBetsByEventId(data) {
                return this.baseService.post('bet/getlivebetsbyeventid', data, { timeout: this.baseService.longTime });
            }
            getLiveBetsExport(data) {
                return this.baseService.post('bet/getlivebetsexport', data, { timeout: this.baseService.longTime });
            }
            getOpenBetSize() {
                return this.baseService.get('bet/GetOpenBetSize', { ignoreLoadingBar: true });
            }
            openBets() {
                return this.baseService.get('bet/openbets');
            }
            getOpenBetByEvent() {
                return this.baseService.get('bet/getopenbetevent');
            }
            getLiveBetSizeByMarketId(marketid) {
                return this.baseService.get('bet/getlivebetsizebymarketid/' + marketid);
            }
            getLiveBetsByMarketId(data) {
                return this.baseService.post('bet/getlivebetsbymarketid', data, { timeout: this.baseService.longTime });
            }
            getOpenBetSizeByEvent(eventId) {
                return this.baseService.get('bet/getopenbetsizebyevent/' + eventId);
            }
            openBetsEvent(eventId) {
                return this.baseService.get('bet/openbetsbyevent/' + eventId, { timeout: this.baseService.longTime });
            }
            getOpenBetSizeByMarketId(marketId) {
                return this.baseService.get('bet/getopenbetsizebymarketid/' + marketId);
            }
            getOpenBetsByMarketId(marketId) {
                return this.baseService.get('bet/openbetsbymarketid/' + marketId, { timeout: this.baseService.longTime });
            }
            getUserTempPL(marketId) {
                return this.baseService.get('bet/getgamepl/' + marketId, { timeout: this.baseService.longTime });
            }
            getRecentBets() {
                return this.baseService.get('bet/getrecentbets', { timeout: this.baseService.longTime });
            }
        }
        services.BetService = BetService;
        angular.module('intranet.services').service('betService', BetService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BetService.js.map