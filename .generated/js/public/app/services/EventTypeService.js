var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class EventTypeService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getEventTypeList(data) {
                return this.baseService.post('eventtype', data);
            }
            getEventTypes() {
                return this.baseService.get('eventtype/geteventtype');
            }
            getActiveEventtype() {
                return this.baseService.get('eventtype/getactiveeventtype');
            }
            addEventType(data) {
                return this.baseService.post('eventtype/addeventtype', data, { ignoreTimeout: true });
            }
            updateEventType(data) {
                return this.baseService.post('eventtype/updateeventtype', data, { ignoreTimeout: true });
            }
            getSports() {
                return this.baseService.get('eventtype/getsports');
            }
        }
        services.EventTypeService = EventTypeService;
        angular.module('intranet.services').service('eventTypeService', EventTypeService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=EventTypeService.js.map