var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class LanguageService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getLanguage(data) {
                return this.baseService.post('language', data);
            }
            getLanguages() {
                return this.baseService.get('language/getlanguage');
            }
            addLanguage(data) {
                return this.baseService.post('language/addlanguage', data);
            }
            updateLanguage(data) {
                return this.baseService.post('language/updatelanguage', data);
            }
            deleteLanguage(id) {
                return this.baseService.get('language/deletelanguage/' + id);
            }
        }
        services.LanguageService = LanguageService;
        angular.module('intranet.services').service('languageService', LanguageService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LanguageService.js.map