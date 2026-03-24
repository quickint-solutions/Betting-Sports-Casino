module intranet.services {
    export class MarketOddsService {
        constructor(private baseService: common.services.BaseService,
            private settings: common.IBaseSettings) {
        }

        public getFullMarketById(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getmarketbyid/' + marketid);
        }

        public getFullMarketByEventId(eventid: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getmarketbyeventid/' + eventid);
        }

        public getMyMarkets(): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getmymarket');
        }

        public getOtherMarketsById(eventid: any, marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/othermarketbyeventid/' + eventid + '/' + marketid);
        }

        public getMarketByEventTypeId(eventtypeid: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getmarketbyeventtypeid/' + eventtypeid);
        }

        public getInPlayMarkets(): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getinplay');
        }

        // markets API
        public getHighlightbyEventTypeId(eventTypeId: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/gethighlightbyeventtypeid/' + eventTypeId);
        }
        public getGameHighlightByEventTypeId(eventTypeId: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getgamehighlight/' + eventTypeId);
        }
        public getHighlightbyCompetitionId(eventTypeId: any, competitionId: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/gethighlightbycompetitionid/' + eventTypeId + '/' + competitionId);
        }
        public getHighlightbyEventId(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/gethighlightbyeventid/' + eventId);
        }

        public getMarketsByDays(data: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getmarketbyday/' + data.day + '/' + data.eventTypeIds.join(','));
        }

        public getPopularMarkets(data: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getpopularmarkets/' + data.top + '/' + data.eventTypeIds.join(','));
        }

        //Mobile
        public getMarketsByDayMobile(data: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getmarketbydaymobile/' + data.day);
        }

        // horse racing
        public getHorseHighlightbyEventTypeId(eventTypeId: any, day: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getracehighlight/' + eventTypeId + '/' + day);
        }
        public getHorseHighlightbyCompetitionId(competitionId: any, day: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/gethorseracehighlightbycomp/' + competitionId + '/' + day);
        }
        public getHorseHighlightbyEventId(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/gethorseracehighlightbyevent/' + eventId);
        }
        public getUpcomingHorserace(): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getupcomingrace');
        }

        public getRaceMarketById(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getracemarketbyid/' + marketid);
        }

        public getRaceMarketList(eventTypeId: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getracemarket/' + eventTypeId);
        }
        public getTopRace(eventTypeId: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/gettoprace/' + eventTypeId);
        }

        // odds related methods
        public getMarketOddsById(marketid: any, depth: any = 3, eventSource: any = 2): ng.IHttpPromise<any> {
            //if (this.settings.IsBetfairLabel && eventSource == 1) {
            //    return this.baseService.outsideGetRadar('marketodds/getmarketodds/' + marketid + '/' + depth, { ignoreLoadingBar: true });
            //}
            //else {
            return this.baseService.get('marketodds/getmarketodds/' + marketid + '/' + depth, { ignoreLoadingBar: true });
            // }
        }

        public getGameOdds(marketid: any, depth: any = 3): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getgameodds/' + marketid + '/' + depth, { ignoreLoadingBar: true });
        }

        public getNextGame(marketid: any, eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getnextgame/' + marketid + '/' + eventId, { ignoreLoadingBar: true });
        }

        // Multi markets
        public getMultiMarkets(marketids: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getmultimarkets/' + marketids.join(','));
        }
        public getMultiMarketOdds(data: any, isBFMarket: boolean = false): ng.IHttpPromise<any> {
            //if (this.settings.IsBetfairLabel && isBFMarket) {
            //    return this.baseService.outsideGetRadar('marketodds/getmultimarketodds/' + data.depth + '/' + data.marketIds.join(','));
            //} else {
            return this.baseService.post('marketodds/getmultimarketodds', data, { ignoreLoadingBar: true });
            // }
        }

        public getGameByEventId(eventid: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getgamebyeventid/' + eventid);
        }

        // get popular+inplay events
        public getSports(top: any, eventtypeids: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getsports/' + top + '/' + eventtypeids);
        }
        public getPopularSports(top: any, eventtypeids: any): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getpopularsports/' + top + '/' + eventtypeids);
        }
        public getRaces(): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/GetRaces');
        }
        public getRacesForPromo(eventTypeId, day): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getraceh/' + eventTypeId + '/' + day);
        }
        public getOddsJson(): ng.IHttpPromise<any> {
            return this.baseService.get('marketodds/getoddsjson');
        }
    }

    angular.module('intranet.services').service('marketOddsService', MarketOddsService);
}