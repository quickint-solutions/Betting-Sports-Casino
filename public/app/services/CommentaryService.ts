module intranet.services {

    export class CommentaryService {
        constructor(private baseService: common.services.BaseService) {
        }

        public getTeams(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('commentary/getteams/' + eventId);
        }

        public getCommentary(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('commentary/getcommentary/' + eventId);
        }

        public ballStart(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('commentary/ballstart/' + eventId);
        }

        public updateCommentary(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('commentary/updatecommentary', data);
        }

        public updateScoreProvider(eventid: any, isbetfairscore: boolean): ng.IHttpPromise<any> {
            return this.baseService.get('commentary/updatescorestatus/' + eventid + '/' + isbetfairscore);
        }

        public getBFTennisScore(eventId: any): ng.IHttpPromise<any> {
            var url = "https://ips.betfair.com/inplayservice/v1/scores?alt=json&eventIds=" + eventId + "&locale=en";
            return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
        }

        public getBFSoccerScore(eventId: any): ng.IHttpPromise<any> {
            var url = "https://ips.betfair.com/inplayservice/v1/eventTimeline?alt=json&eventId=" + eventId + "&locale=en&productType=EXCHANGE&regionCode=ASIA";
            return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
        }

        public getBFCricketScore(eventId: any): ng.IHttpPromise<any> {
            var url = "https://ips.betfair.com/inplayservice/v1/scores?alt=json&eventIds=" + eventId + "&locale=en&productType=EXCHANGE&regionCode=ASIA";
            return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
        }
    }

    angular.module('intranet.services').service('commentaryService', CommentaryService);
}