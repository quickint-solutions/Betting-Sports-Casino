var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class ConfigService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getStakeConfig() {
                return this.baseService.get('config/getstakeconfig');
            }
            saveStakeConfig(data) {
                return this.baseService.post('config/updatestakeconfig', data);
            }
            saveOneClickStakeConfig(data) {
                return this.baseService.post('config/updateoneclickstakeconfig', data);
            }
            getBetConfigOfChild(memberId) {
                return this.baseService.get('config/getbetconfig/' + memberId);
            }
            updateBetConfigOfChild(data) {
                return this.baseService.post('config/updatebetconfig', data, { timeout: this.baseService.longTime });
            }
            getBTConfig(userId) {
                return this.baseService.get('user/getbtconfig/' + userId);
            }
            updateBTConfig(data) {
                return this.baseService.post('user/updatebtconfig', data);
            }
            updatePtConfig(data) {
                return this.baseService.post('user/updateptconfig', data);
            }
            getPtConfig(userid) {
                return this.baseService.get('user/getptconfig/' + userid);
            }
            getDownlinePt(userid, searchid = 0) {
                if (searchid > 0) {
                    return this.baseService.get('user/getdownlinept/' + userid + '/' + searchid);
                }
                else {
                    return this.baseService.get('user/getdownlinept/' + userid);
                }
            }
        }
        services.ConfigService = ConfigService;
        angular.module('intranet.services').service('configService', ConfigService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ConfigService.js.map