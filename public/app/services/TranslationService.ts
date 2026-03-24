namespace intranet.services {

    export class TranslationService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService,
            private $translate: any,
            private settings: common.IBaseSettings,
            private localStorageHelper: common.helpers.LocalStorageHelper) {
        }

        public addTranslations(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('translation/addtranslationforall', data);
        }

        public getTranslationsById(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('translation/translationbylanguageid', data);
        }

        public updateTranslations(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('translation/updatetranslation', data);
        }

        public deleteTranslation(id: number): ng.IHttpPromise<any> {
            return this.baseService.get('translation/deletetranslation/' + id);
        }

        public setLanguage(lang: string): void {
            this.$translate.use(lang);
            var result = this.localStorageHelper.get(this.settings.UserData);
            if (result) {
                result.user.languageId = lang;
                this.localStorageHelper.set(this.settings.UserData, result);
            }
        }

        public getTranslations(lang: string, config: ng.IRequestShortcutConfig): ng.IHttpPromise<any> {
            return this.baseService.get('translation/gettranslations/' + lang, config);
        }

        public getTranslationByCode(code: any, config: ng.IRequestShortcutConfig): ng.IHttpPromise<any> {
            return this.baseService.get('translation/gettranslationbycode/' + code, config);
        }
    }

    angular.module('intranet.services').service('translationService', TranslationService);
}