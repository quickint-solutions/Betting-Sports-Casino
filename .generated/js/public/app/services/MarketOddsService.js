var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class MarketOddsService {
            constructor(baseService, settings) {
                this.baseService = baseService;
                this.settings = settings;
            }
            getFullMarketById(marketid) {
                return this.baseService.get('marketodds/getmarketbyid/' + marketid);
            }
            getFullMarketByEventId(eventid) {
                return this.baseService.get('marketodds/getmarketbyeventid/' + eventid);
            }
            getMyMarkets() {
                return this.baseService.get('marketodds/getmymarket');
            }
            getOtherMarketsById(eventid, marketid) {
                return this.baseService.get('marketodds/othermarketbyeventid/' + eventid + '/' + marketid);
            }
            getMarketByEventTypeId(eventtypeid) {
                return this.baseService.get('marketodds/getmarketbyeventtypeid/' + eventtypeid);
            }
            getInPlayMarkets() {
                return this.baseService.get('marketodds/getinplay');
            }
            getHighlightbyEventTypeId(eventTypeId) {
                return this.baseService.get('marketodds/gethighlightbyeventtypeid/' + eventTypeId);
            }
            getGameHighlightByEventTypeId(eventTypeId) {
                return this.baseService.get('marketodds/getgamehighlight/' + eventTypeId);
            }
            getHighlightbyCompetitionId(eventTypeId, competitionId) {
                return this.baseService.get('marketodds/gethighlightbycompetitionid/' + eventTypeId + '/' + competitionId);
            }
            getHighlightbyEventId(eventId) {
                return this.baseService.get('marketodds/gethighlightbyeventid/' + eventId);
            }
            getMarketsByDays(data) {
                return this.baseService.get('marketodds/getmarketbyday/' + data.day + '/' + data.eventTypeIds.join(','));
            }
            getPopularMarkets(data) {
                return this.baseService.get('marketodds/getpopularmarkets/' + data.top + '/' + data.eventTypeIds.join(','));
            }
            getMarketsByDayMobile(data) {
                return this.baseService.get('marketodds/getmarketbydaymobile/' + data.day);
            }
            getHorseHighlightbyEventTypeId(eventTypeId, day) {
                return this.baseService.get('marketodds/getracehighlight/' + eventTypeId + '/' + day);
            }
            getHorseHighlightbyCompetitionId(competitionId, day) {
                return this.baseService.get('marketodds/gethorseracehighlightbycomp/' + competitionId + '/' + day);
            }
            getHorseHighlightbyEventId(eventId) {
                return this.baseService.get('marketodds/gethorseracehighlightbyevent/' + eventId);
            }
            getUpcomingHorserace() {
                return this.baseService.get('marketodds/getupcomingrace');
            }
            getRaceMarketById(marketid) {
                return this.baseService.get('marketodds/getracemarketbyid/' + marketid);
            }
            getRaceMarketList(eventTypeId) {
                return this.baseService.get('marketodds/getracemarket/' + eventTypeId);
            }
            getTopRace(eventTypeId) {
                return this.baseService.get('marketodds/gettoprace/' + eventTypeId);
            }
            getMarketOddsById(marketid, depth = 3, eventSource = 2) {
                return this.baseService.get('marketodds/getmarketodds/' + marketid + '/' + depth, { ignoreLoadingBar: true });
            }
            getGameOdds(marketid, depth = 3) {
                return this.baseService.get('marketodds/getgameodds/' + marketid + '/' + depth, { ignoreLoadingBar: true });
            }
            getNextGame(marketid, eventId) {
                return this.baseService.get('marketodds/getnextgame/' + marketid + '/' + eventId, { ignoreLoadingBar: true });
            }
            getMultiMarkets(marketids) {
                return this.baseService.get('marketodds/getmultimarkets/' + marketids.join(','));
            }
            getMultiMarketOdds(data, isBFMarket = false) {
                return this.baseService.post('marketodds/getmultimarketodds', data, { ignoreLoadingBar: true });
            }
            getGameByEventId(eventid) {
                return this.baseService.get('marketodds/getgamebyeventid/' + eventid);
            }
            getSports(top, eventtypeids) {
                return this.baseService.get('marketodds/getsports/' + top + '/' + eventtypeids);
            }
            getPopularSports(top, eventtypeids) {
                return this.baseService.get('marketodds/getpopularsports/' + top + '/' + eventtypeids);
            }
            getRaces() {
                return this.baseService.get('marketodds/GetRaces');
            }
            getRacesForPromo(eventTypeId, day) {
                return this.baseService.get('marketodds/getraceh/' + eventTypeId + '/' + day);
            }
            getOddsJson() {
                return this.baseService.get('marketodds/getoddsjson');
            }
        }
        services.MarketOddsService = MarketOddsService;
        angular.module('intranet.services').service('marketOddsService', MarketOddsService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MarketOddsService.js.map