var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class CompetitionService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getCompetitionList(data) {
                return this.baseService.post('competition', data);
            }
            getCompetitions() {
                return this.baseService.get('competition/getcompetition');
            }
            addCompetition(data) {
                return this.baseService.post('competition/addcompetition', data);
            }
            updateCompetition(data) {
                return this.baseService.post('competition/updatecompetition', data);
            }
            searchCompetitions(eventTypeId) {
                return this.baseService.get('competition/searchcompetition/' + eventTypeId);
            }
        }
        services.CompetitionService = CompetitionService;
        angular.module('intranet.services').service('competitionService', CompetitionService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CompetitionService.js.map