var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class FeedService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getMarketOddsById(marketid) {
                return this.baseService.get('feedmarket/getfixedodds/' + marketid);
            }
            getFixedOddsByRunner(marketrunnerid) {
                return this.baseService.get('feedmarket/getfixedoddsbyrunner/' + marketrunnerid);
            }
            saveFeedByRunner(data) {
                return this.baseService.post('feedmarket/updateodds', data, { timeout: this.baseService.longTime });
            }
            updateSessionOdds(data) {
                return this.baseService.post('feedmarket/updatesessionodds', data, { timeout: this.baseService.longTime });
            }
            cancelSessionBet(betid) {
                return this.baseService.get('feedmarket/cancelbet/' + betid, { timeout: this.baseService.longTime });
            }
            cancelOdds(marketid) {
                return this.baseService.get('feedmarket/cancelodds/' + marketid, { timeout: this.baseService.longTime });
            }
            cancelSessionOdds(marketid) {
                return this.baseService.get('feedmarket/cancelsessionodds/' + marketid, { timeout: this.baseService.longTime });
            }
            getSessionBetSizes(data) {
                return this.baseService.post('feedmarket/getbetsize', data, { ignoreLoadingBar: true });
            }
            getSessionOpenBets(marketid) {
                return this.baseService.get('feedmarket/getbets/' + marketid);
            }
            getScorePosition(marketid) {
                return this.baseService.get('feedmarket/getscoreposition/' + marketid);
            }
            AddUpdateOdds(data) {
                return this.baseService.post('feedmarket/addupdateodds', data, { timeout: this.baseService.longTime });
            }
            updateGameString(data) {
                return this.baseService.post('feedmarket/updategamestring', data);
            }
            getGameString(marketid) {
                return this.baseService.get('feedmarket/getgamestring/' + marketid);
            }
            setGameTimer(marketid, seconds) {
                return this.baseService.get('feedmarket/updatetimer/' + marketid + '/' + seconds);
            }
            setTableStatus(eventid, tablestatus) {
                return this.baseService.get('feedmarket/openclosetable/' + eventid + '/' + tablestatus);
            }
        }
        services.FeedService = FeedService;
        angular.module('intranet.services').service('feedService', FeedService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FeedService.js.map