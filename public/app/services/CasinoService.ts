module intranet.services {

    export class CasinoService {
        constructor(private baseService: common.services.BaseService) {
        }


        public getLaunchToken(): ng.IHttpPromise<any> {
            return this.baseService.get('ezugi/launchezugi');
        }

    }

    angular.module('intranet.services').service('casinoService', CasinoService);
}