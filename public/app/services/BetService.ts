module intranet.services {

    export class BetService {
        constructor(private baseService: common.services.BaseService,
            private settings: common.IBaseSettings,
            private uuid: any,
            private $filter: any) {
        }

        public placeBet(data: any): ng.IHttpPromise<any> {
            data.size = this.$filter('toGLC')(data.size);
            data.timestamp = this.uuid.v4();
            if (this.settings.IsFaaS) {
                return this.baseService.post('liveexchangebet/placebet', data, { ignoreLoadingBar: true, timeout: this.baseService.longTime });
            }
            else {
                return this.baseService.post('bet/placebet', data, { ignoreLoadingBar: true, timeout: this.baseService.longTime });
            }
        }

        public placeBets(data: any): ng.IHttpPromise<any> {
            var request = [];
            if (data.length > 0) {
                data.forEach((b: any) => {
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

        public updateBet(data: any): ng.IHttpPromise<any> {
            if (this.settings.IsFaaS) {
                return this.baseService.post('liveexchangebet/updatebet', data, { timeout: this.baseService.longTime });
            }
            else {
                return this.baseService.post('bet/updatebet', data, { timeout: this.baseService.longTime });
            }
        }

        public updateAllBet(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/updatebets', data, { timeout: this.baseService.longTime });
        }

        public cancelBet(betid: any): ng.IHttpPromise<any> {
            return this.baseService.get('bet/cancelbet/' + betid, { timeout: this.baseService.longTime });
        }

        public cancelAllBets(ids: any[]): ng.IHttpPromise<any> {
            return this.baseService.post('bet/cancelbets/', ids, { timeout: this.baseService.longTime });
        }

        public getBets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/getbets', data, { timeout: this.baseService.longTime });
        }

        public getBetsById(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/getbetsbyid', data, { timeout: this.baseService.longTime });
        }

        public getBTLiveBets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/getbtlivebets', data, { ignoreLoadingBar: true, timeout: this.baseService.longTime });
        }

        public voidBet(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/voidbet', data, { timeout: this.baseService.longTime });
        }

        public voidBets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/voidbets', data, { timeout: this.baseService.longTime });
        }
        public editRate(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/editbetrate', data, { timeout: this.baseService.longTime });
        }


        // now wss in master (but used in SA)
        public getLiveBetSize(): ng.IHttpPromise<any> {
            return this.baseService.get('bet/getlivebetsize');
        }
        public getLiveBets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/getlivebets', data, { timeout: this.baseService.longTime });
        }
        public getLiveBetsByEventId(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/getlivebetsbyeventid', data, { timeout: this.baseService.longTime });
        }
        public getLiveBetsExport(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/getlivebetsexport', data, { timeout: this.baseService.longTime });
        }

        // now wss
        public getOpenBetSize(): ng.IHttpPromise<any> {
            return this.baseService.get('bet/GetOpenBetSize', { ignoreLoadingBar: true });
        }
        public openBets(): ng.IHttpPromise<any> {
            return this.baseService.get('bet/openbets');
        }
        public getOpenBetByEvent(): ng.IHttpPromise<any> {
            return this.baseService.get('bet/getopenbetevent');
        }

        // now wss (still in SA)
        public getLiveBetSizeByMarketId(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('bet/getlivebetsizebymarketid/' + marketid);
        }
        public getLiveBetsByMarketId(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('bet/getlivebetsbymarketid', data, { timeout: this.baseService.longTime });
        }

        // now wss
        public getOpenBetSizeByEvent(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('bet/getopenbetsizebyevent/' + eventId);
        }
        public openBetsEvent(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('bet/openbetsbyevent/' + eventId, { timeout: this.baseService.longTime });
        }

        // now wss (in radar)
        public getOpenBetSizeByMarketId(marketId: any): ng.IHttpPromise<any> {
            return this.baseService.get('bet/getopenbetsizebymarketid/' + marketId);
        }
        public getOpenBetsByMarketId(marketId: any): ng.IHttpPromise<any> {
            return this.baseService.get('bet/openbetsbymarketid/' + marketId, { timeout: this.baseService.longTime });
        }

        public getUserTempPL(marketId: any): ng.IHttpPromise<any> {
            return this.baseService.get('bet/getgamepl/' + marketId, { timeout: this.baseService.longTime });
        }

        public getRecentBets(): ng.IHttpPromise<any> {
            return this.baseService.get('bet/getrecentbets', { timeout: this.baseService.longTime });
        }
    }

    angular.module('intranet.services').service('betService', BetService);
}