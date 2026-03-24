var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class MessageService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            bookMakerEnquiry(data) {
                return this.baseService.post('message/bmenquiry', data);
            }
            playerEnquiry(data) {
                return this.baseService.post('message/playerenquiry', data);
            }
            getAnnouncement() {
                return this.baseService.get('message/getannouncement');
            }
            getInquiries(data) {
                return this.baseService.post('message', data);
            }
            outsideJsonp(url) {
                return this.baseService.outsideJsonp(url);
            }
        }
        services.MessageService = MessageService;
        angular.module('intranet.services').service('messageService', MessageService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MessageService.js.map