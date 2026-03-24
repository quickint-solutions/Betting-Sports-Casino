module intranet.services {

    export class ConfigService {
        constructor(private baseService: common.services.BaseService) {
        }

        public getStakeConfig(): ng.IHttpPromise<any> {
            return this.baseService.get('config/getstakeconfig');
        }

        public saveStakeConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('config/updatestakeconfig', data);
        }

        public saveOneClickStakeConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('config/updateoneclickstakeconfig', data);
        }

        public getBetConfigOfChild(memberId: any): ng.IHttpPromise<any> {
            return this.baseService.get('config/getbetconfig/' + memberId);
        }
       

        public updateBetConfigOfChild(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('config/updatebetconfig', data, { timeout: this.baseService.longTime });
        }

        public getBTConfig(userId: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getbtconfig/' + userId);
        }
        public updateBTConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatebtconfig', data);
        }

        public updatePtConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updateptconfig', data);
        }

        public getPtConfig(userid: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getptconfig/' + userid);
        }

        public getDownlinePt(userid: any, searchid: any = 0): ng.IHttpPromise<any> {
            if (searchid > 0) {
                return this.baseService.get('user/getdownlinept/' + userid + '/' + searchid);
            }
            else {
                return this.baseService.get('user/getdownlinept/' + userid);
            }
        }
    }

    angular.module('intranet.services').service('configService', ConfigService);
}