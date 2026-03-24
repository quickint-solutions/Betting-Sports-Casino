namespace intranet.services {
    export class MessageService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }
        public bookMakerEnquiry(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('message/bmenquiry', data);
        }

        public playerEnquiry(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('message/playerenquiry', data);
        }

        public getAnnouncement(): ng.IHttpPromise<any> {
            return this.baseService.get('message/getannouncement');
        }

        public getInquiries(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('message', data);
        }

        public outsideJsonp(url: any): ng.IHttpPromise<any> {
            return this.baseService.outsideJsonp(url);
        }
    }
    angular.module('intranet.services').service('messageService', MessageService);
}