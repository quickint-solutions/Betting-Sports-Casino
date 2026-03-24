namespace intranet.services {
    export class EventTypeService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        // event type list for grid
        public getEventTypeList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('eventtype', data);
        }
        // get event type list for dropdown
        public getEventTypes(): ng.IHttpPromise<any> {
            return this.baseService.get('eventtype/geteventtype');
        }

        public getActiveEventtype(): ng.IHttpPromise<any> {
            return this.baseService.get('eventtype/getactiveeventtype');
        }

        public addEventType(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('eventtype/addeventtype', data, { ignoreTimeout: true });
        }
        public updateEventType(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('eventtype/updateeventtype', data, { ignoreTimeout: true });
        }

        public getSports(): ng.IHttpPromise<any> {
            return this.baseService.get('eventtype/getsports');
        }
    }

    angular.module('intranet.services').service('eventTypeService', EventTypeService);
}