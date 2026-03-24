namespace intranet.services {

    export class ExposureService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public getTopSizeMatched(): ng.IHttpPromise<any> {
            return this.baseService.get('exposure/gettopsizematched');
        }

        public getTopExposure(): ng.IHttpPromise<any> {
            return this.baseService.get('exposure/gettopexposure');
        }

        //public getHorseRaceTotalMatched(): ng.IHttpPromise<any> {
        //    return this.baseService.get('exposure/gethorseracetotalmatched');
        //}

        public getEventTypeExposure(): ng.IHttpPromise<any> {
            return this.baseService.get('exposure/geteventtypeexposure');
        }

        public getExposure(): ng.IHttpPromise<any> {
            return this.baseService.get('exposure/getexposure');
        }
    }

    angular.module('intranet.services').service('exposureService', ExposureService);
}