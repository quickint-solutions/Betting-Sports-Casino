namespace intranet.services {
    export class EventService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }
        public getEventList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('event', data);
        }
        public addEvent(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('event/addevent', data);
        }
        public updateEvent(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('event/updateevent', data);
        }
        public searchEvent(eventTypeId: any): ng.IHttpPromise<any> {
            return this.baseService.get('event/searchevent/' + eventTypeId);
        }

        public searchCometition(eventTypeId: any): ng.IHttpPromise<any> {
            return this.baseService.get('event/competitionbyeventtypeid/' + eventTypeId);
        }
        public searchEventByCompetition(eventTypeId: any,comepetitionId: any): ng.IHttpPromise<any> {
            return this.baseService.get('event/eventbycompetitionid/' + eventTypeId + '/' + comepetitionId);
        }

        public searchGames(eventTypeId: any): ng.IHttpPromise<any> {
            return this.baseService.get('event/searchgames/' + eventTypeId);
        }

        public GetMarketPtStatus(eventTypeId: any): ng.IHttpPromise<any> {
            return this.baseService.get('managemarket/getmarketlockstatus/' + eventTypeId);
        }
        public GetMarketPtStatusByEventId(eventId: any): ng.IHttpPromise<any> {
            return this.baseService.get('managemarket/getmarketstatusbyeventid/' + eventId);
        }
        public UpdateMarketPtStatus(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('managemarket/updatemarketlockstatus' , data);
        }

        public getCasinoLock(): ng.IHttpPromise<any> {
            return this.baseService.get('managemarket/getcasinolock');
        }
        public updateCasinoLock(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('managemarket/updatecasinolock', data);
        }
    }
    angular.module('intranet.services').service('eventService', EventService);
}