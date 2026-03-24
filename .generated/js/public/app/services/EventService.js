var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class EventService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getEventList(data) {
                return this.baseService.post('event', data);
            }
            addEvent(data) {
                return this.baseService.post('event/addevent', data);
            }
            updateEvent(data) {
                return this.baseService.post('event/updateevent', data);
            }
            searchEvent(eventTypeId) {
                return this.baseService.get('event/searchevent/' + eventTypeId);
            }
            searchCometition(eventTypeId) {
                return this.baseService.get('event/competitionbyeventtypeid/' + eventTypeId);
            }
            searchEventByCompetition(eventTypeId, comepetitionId) {
                return this.baseService.get('event/eventbycompetitionid/' + eventTypeId + '/' + comepetitionId);
            }
            searchGames(eventTypeId) {
                return this.baseService.get('event/searchgames/' + eventTypeId);
            }
            GetMarketPtStatus(eventTypeId) {
                return this.baseService.get('managemarket/getmarketlockstatus/' + eventTypeId);
            }
            GetMarketPtStatusByEventId(eventId) {
                return this.baseService.get('managemarket/getmarketstatusbyeventid/' + eventId);
            }
            UpdateMarketPtStatus(data) {
                return this.baseService.post('managemarket/updatemarketlockstatus', data);
            }
            getCasinoLock() {
                return this.baseService.get('managemarket/getcasinolock');
            }
            updateCasinoLock(data) {
                return this.baseService.post('managemarket/updatecasinolock', data);
            }
        }
        services.EventService = EventService;
        angular.module('intranet.services').service('eventService', EventService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EventService.js.map