namespace intranet.services {
    export class GoogleTagManagerService {

        /* @ngInject */
        constructor(private baseService: common.services.BaseService,
            private $window: any) {
        }


        public push(data: any) {
            try {
                this.$window.dataLayer.push(data);
            } catch (e) {  }
        }

    }

    angular.module('intranet.services').service('googleTagManagerService', GoogleTagManagerService);
}