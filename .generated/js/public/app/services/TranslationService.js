var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class TranslationService {
            constructor(baseService, $translate, settings, localStorageHelper) {
                this.baseService = baseService;
                this.$translate = $translate;
                this.settings = settings;
                this.localStorageHelper = localStorageHelper;
            }
            addTranslations(data) {
                return this.baseService.post('translation/addtranslationforall', data);
            }
            getTranslationsById(data) {
                return this.baseService.post('translation/translationbylanguageid', data);
            }
            updateTranslations(data) {
                return this.baseService.post('translation/updatetranslation', data);
            }
            deleteTranslation(id) {
                return this.baseService.get('translation/deletetranslation/' + id);
            }
            setLanguage(lang) {
                this.$translate.use(lang);
                var result = this.localStorageHelper.get(this.settings.UserData);
                if (result) {
                    result.user.languageId = lang;
                    this.localStorageHelper.set(this.settings.UserData, result);
                }
            }
            getTranslations(lang, config) {
                return this.baseService.get('translation/gettranslations/' + lang, config);
            }
            getTranslationByCode(code, config) {
                return this.baseService.get('translation/gettranslationbycode/' + code, config);
            }
        }
        services.TranslationService = TranslationService;
        angular.module('intranet.services').service('translationService', TranslationService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=TranslationService.js.map