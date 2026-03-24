namespace intranet.services {

    export class LanguageService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public getLanguage(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('language', data);
        }

        public getLanguages(): ng.IHttpPromise<any> {
            return this.baseService.get('language/getlanguage');
        }

        public addLanguage(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('language/addlanguage', data);
        }

        public updateLanguage(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('language/updatelanguage', data);
        }

        public deleteLanguage(id: number): ng.IHttpPromise<any> {
            return this.baseService.get('language/deletelanguage/' + id);
        }
    }

    angular.module('intranet.services').service('languageService', LanguageService);
}