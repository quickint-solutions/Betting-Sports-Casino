var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class NotificationService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            sendNotification(data, header) {
                var url = "https://fcm.googleapis.com/fcm/send";
                return this.baseService.outsidePost(url, data, header);
            }
        }
        services.NotificationService = NotificationService;
        angular.module('intranet.services').service('notificationService', NotificationService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=NotificationService.js.map