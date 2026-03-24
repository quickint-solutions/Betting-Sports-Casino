module intranet.services {
    export class PositionService {
        constructor(private baseService: common.services.BaseService,
            private settings: common.IBaseSettings) {
        }

        // markets for position
        public getEventTypePosition(): ng.IHttpPromise<any> {
            return this.baseService.get('position/geteventtypeposition');
        }
        public getCompetitionPositionbyId(eventtypeid: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getcompetitionpositionbyid/' + eventtypeid);
        }
        public getEventPositionbyId(competitionid: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/geteventpositionbyid/' + competitionid);
        }
        public getMarketPositionbyId(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getmarketpositionbyid/' + eventId);
        }

        public getMarketpositionbyMarketIds(ids: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getmarketpositionbymarketids/' + ids.join(','));
        }
        public getMarketpositionbyMarketId(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getmarketpositionbymarketid/' + id);
        }
        public getUserPosition(id: any, includePT: boolean = false): ng.IHttpPromise<any> {
            return this.baseService.get('position/getuserposition/' + id + '/' + includePT);
        }
        public getUserPositionPost(data: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getuserposition/' + data.MarketId + '/' + (data.isPT ? data.isPT : false));
        }
        public getFancyUserPosition(data: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getfancyuserposition/' + data.MarketId + '/' + (data.isPT ? data.isPT : false));
        }

        public getScorePosition(id: any, includePT: boolean = false): ng.IHttpPromise<any> {
            return this.baseService.get('position/getscoreposition/' + id);
        }
        public getMyScorePosition(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getmyscoreposition/' + id);
        }
        public getFancyPositionByUser(data: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getfancypositionbyuser/' + data.marketId + '/' + (data.UserId ? data.UserId : -1));
        }

        public getScorePositionByUser(data: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getscorepositionbyuser/' + data.marketId + '/' + (data.UserId ? data.UserId : -1));
        }


        public getPositionOddsbyIds(data: any, isBFMarket: boolean = false): ng.IHttpPromise<any> {
            //if (this.settings.IsBetfairLabel && isBFMarket) {
            //    return this.baseService.outsideGetRadar('marketodds/getmultimarketodds/' + data.depth + '/' + data.marketIds.join(','));
            //} else {
            return this.baseService.get('position/getpositionoddsbyids/' + data.depth + '/' + data.marketIds.join(','));
            //  }
        }
        public getPositionOddsbyId(id: any, eventSource: any = 2): ng.IHttpPromise<any> {
            //if (this.settings.IsBetfairLabel && eventSource == 1) {
            //    return this.baseService.outsideGetRadar('marketodds/getmarketodds/' + id + '/' + 3, { ignoreLoadingBar: true });
            //} else {
            return this.baseService.get('position/getpositionoddsbyid/' + id, { ignoreLoadingBar: true });
            // }
        }

        //public getMarketByEventType(eventtypeid: any, pt: any): ng.IHttpPromise<any> {
        //    return this.baseService.get('position/getmarketbyeventtype/' + eventtypeid + '/' + pt );
        //}
        public getMarketByEventTypeById(eventtypeid: any, userid: any, pt: any): ng.IHttpPromise<any> {
            return this.baseService.get('position/getmarketbyeventtypebyid/' + eventtypeid + '/' + userid + '/' + pt);
        }


        public getExposurebyMarketIds(ids: any): ng.IHttpPromise<any> {
            return this.baseService.post('position/getexposurebymarketids', ids);
        }
        public getFancyExposurebyMarketIds(ids: any): ng.IHttpPromise<any> {
            return this.baseService.post('position/getfancyexposurebymarketids', ids);
        }

    }

    angular.module('intranet.services').service('positionService', PositionService);
}