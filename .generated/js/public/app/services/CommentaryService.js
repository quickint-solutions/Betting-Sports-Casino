var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class CommentaryService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getTeams(eventId) {
                return this.baseService.get('commentary/getteams/' + eventId);
            }
            getCommentary(eventId) {
                return this.baseService.get('commentary/getcommentary/' + eventId);
            }
            ballStart(eventId) {
                return this.baseService.get('commentary/ballstart/' + eventId);
            }
            updateCommentary(data) {
                return this.baseService.post('commentary/updatecommentary', data);
            }
            updateScoreProvider(eventid, isbetfairscore) {
                return this.baseService.get('commentary/updatescorestatus/' + eventid + '/' + isbetfairscore);
            }
            getBFTennisScore(eventId) {
                var url = "https://ips.betfair.com/inplayservice/v1/scores?alt=json&eventIds=" + eventId + "&locale=en";
                return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
            }
            getBFSoccerScore(eventId) {
                var url = "https://ips.betfair.com/inplayservice/v1/eventTimeline?alt=json&eventId=" + eventId + "&locale=en&productType=EXCHANGE&regionCode=ASIA";
                return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
            }
            getBFCricketScore(eventId) {
                var url = "https://ips.betfair.com/inplayservice/v1/scores?alt=json&eventIds=" + eventId + "&locale=en&productType=EXCHANGE&regionCode=ASIA";
                return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
            }
        }
        services.CommentaryService = CommentaryService;
        angular.module('intranet.services').service('commentaryService', CommentaryService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CommentaryService.js.map