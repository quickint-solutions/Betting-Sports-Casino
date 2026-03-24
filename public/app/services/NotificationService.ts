module intranet.services {

    export class NotificationService {
        constructor(private baseService: common.services.BaseService) {
        }



        public sendNotification(data: any, header: any): ng.IHttpPromise<any> {
            var url = "https://fcm.googleapis.com/fcm/send";
            return this.baseService.outsidePost(url, data, header);
        }

    }

    angular.module('intranet.services').service('notificationService', NotificationService);
}