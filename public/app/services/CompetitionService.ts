namespace intranet.services {
    export class CompetitionService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }


        public getCompetitionList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('competition', data);
        }
        public getCompetitions(): ng.IHttpPromise<any> {
            return this.baseService.get('competition/getcompetition');
        }
        public addCompetition(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('competition/addcompetition', data);
        }
        public updateCompetition(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('competition/updatecompetition', data);
        }
        public searchCompetitions(eventTypeId: any): ng.IHttpPromise<any> {
            return this.baseService.get('competition/searchcompetition/' + eventTypeId);
        }
    }

    angular.module('intranet.services').service('competitionService', CompetitionService);
}