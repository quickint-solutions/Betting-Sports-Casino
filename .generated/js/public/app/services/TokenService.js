var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class TokenService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getLiveTokens(data) {
                return this.baseService.post('getlivetoken', data);
            }
            getLoginHistory() {
                return this.baseService.get('token/loginhistory');
            }
            getLoginHistoryById(memberid) {
                return this.baseService.get('token/loginhistorybyid/' + memberid);
            }
            getLiveToken(data) {
                return this.baseService.post('token/getlivetoken', data);
            }
            deleteTokenById(id) {
                return this.baseService.get('token/deletetokenbyid/' + id);
            }
            getBlockIPList(data) {
                return this.baseService.post('token/getblockiplist', data);
            }
            blockIP(ip) {
                return this.baseService.get('token/blockip/' + ip + '/');
            }
            unBlockIP(ip) {
                return this.baseService.get('token/unblockip/' + ip + '/');
            }
        }
        services.TokenService = TokenService;
        angular.module('intranet.services').service('tokenService', TokenService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=TokenService.js.map