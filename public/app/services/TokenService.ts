module intranet.services {

    export class TokenService {
        constructor(private baseService: common.services.BaseService) {
        }

        public getLiveTokens(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('getlivetoken', data);
        }

        public getLoginHistory(): ng.IHttpPromise<any> {
            return this.baseService.get('token/loginhistory');
        }
        public getLoginHistoryById(memberid: any): ng.IHttpPromise<any> {
            return this.baseService.get('token/loginhistorybyid/' + memberid);
        }

        public getLiveToken(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('token/getlivetoken', data);
        }

        public deleteTokenById(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('token/deletetokenbyid/' + id);
        }

        public getBlockIPList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('token/getblockiplist', data);
        }

        public blockIP(ip: any): ng.IHttpPromise<any> {
            return this.baseService.get('token/blockip/' + ip + '/');
        }

        public unBlockIP(ip: any): ng.IHttpPromise<any> {
            return this.baseService.get('token/unblockip/' + ip + '/');
        }
    }

    angular.module('intranet.services').service('tokenService', TokenService);
}