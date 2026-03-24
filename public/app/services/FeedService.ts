namespace intranet.services {

    export class FeedService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public getMarketOddsById(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/getfixedodds/' + marketid);
        }

        public getFixedOddsByRunner(marketrunnerid: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/getfixedoddsbyrunner/' + marketrunnerid);
        }

        public saveFeedByRunner(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('feedmarket/updateodds', data, { timeout: this.baseService.longTime });
        }

        public updateSessionOdds(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('feedmarket/updatesessionodds', data, { timeout: this.baseService.longTime });
        }

        public cancelSessionBet(betid: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/cancelbet/' + betid, { timeout: this.baseService.longTime });
        }

        public cancelOdds(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/cancelodds/' + marketid, { timeout: this.baseService.longTime });
        }

        public cancelSessionOdds(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/cancelsessionodds/' + marketid, { timeout: this.baseService.longTime });
        }

        public getSessionBetSizes(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('feedmarket/getbetsize', data, { ignoreLoadingBar: true });
        }

        public getSessionOpenBets(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/getbets/' + marketid);
        }

        public getScorePosition(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/getscoreposition/' + marketid);
        }

        public AddUpdateOdds(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('feedmarket/addupdateodds', data, { timeout: this.baseService.longTime });
        }

        public updateGameString(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('feedmarket/updategamestring', data);
        }

        public getGameString(marketid: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/getgamestring/' + marketid);
        }


        public setGameTimer(marketid: any, seconds: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/updatetimer/' + marketid + '/' + seconds);
        }

        public setTableStatus(eventid: any, tablestatus: any): ng.IHttpPromise<any> {
            return this.baseService.get('feedmarket/openclosetable/' + eventid + '/' + tablestatus);
        }
    }

    angular.module('intranet.services').service('feedService', FeedService);
}