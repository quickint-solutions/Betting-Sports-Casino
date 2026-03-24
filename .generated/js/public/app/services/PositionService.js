var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class PositionService {
            constructor(baseService, settings) {
                this.baseService = baseService;
                this.settings = settings;
            }
            getEventTypePosition() {
                return this.baseService.get('position/geteventtypeposition');
            }
            getCompetitionPositionbyId(eventtypeid) {
                return this.baseService.get('position/getcompetitionpositionbyid/' + eventtypeid);
            }
            getEventPositionbyId(competitionid) {
                return this.baseService.get('position/geteventpositionbyid/' + competitionid);
            }
            getMarketPositionbyId(eventId) {
                return this.baseService.get('position/getmarketpositionbyid/' + eventId);
            }
            getMarketpositionbyMarketIds(ids) {
                return this.baseService.get('position/getmarketpositionbymarketids/' + ids.join(','));
            }
            getMarketpositionbyMarketId(id) {
                return this.baseService.get('position/getmarketpositionbymarketid/' + id);
            }
            getUserPosition(id, includePT = false) {
                return this.baseService.get('position/getuserposition/' + id + '/' + includePT);
            }
            getUserPositionPost(data) {
                return this.baseService.get('position/getuserposition/' + data.MarketId + '/' + (data.isPT ? data.isPT : false));
            }
            getFancyUserPosition(data) {
                return this.baseService.get('position/getfancyuserposition/' + data.MarketId + '/' + (data.isPT ? data.isPT : false));
            }
            getScorePosition(id, includePT = false) {
                return this.baseService.get('position/getscoreposition/' + id);
            }
            getMyScorePosition(id) {
                return this.baseService.get('position/getmyscoreposition/' + id);
            }
            getFancyPositionByUser(data) {
                return this.baseService.get('position/getfancypositionbyuser/' + data.marketId + '/' + (data.UserId ? data.UserId : -1));
            }
            getScorePositionByUser(data) {
                return this.baseService.get('position/getscorepositionbyuser/' + data.marketId + '/' + (data.UserId ? data.UserId : -1));
            }
            getPositionOddsbyIds(data, isBFMarket = false) {
                return this.baseService.get('position/getpositionoddsbyids/' + data.depth + '/' + data.marketIds.join(','));
            }
            getPositionOddsbyId(id, eventSource = 2) {
                return this.baseService.get('position/getpositionoddsbyid/' + id, { ignoreLoadingBar: true });
            }
            getMarketByEventTypeById(eventtypeid, userid, pt) {
                return this.baseService.get('position/getmarketbyeventtypebyid/' + eventtypeid + '/' + userid + '/' + pt);
            }
            getExposurebyMarketIds(ids) {
                return this.baseService.post('position/getexposurebymarketids', ids);
            }
            getFancyExposurebyMarketIds(ids) {
                return this.baseService.post('position/getfancyexposurebymarketids', ids);
            }
        }
        services.PositionService = PositionService;
        angular.module('intranet.services').service('positionService', PositionService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PositionService.js.map