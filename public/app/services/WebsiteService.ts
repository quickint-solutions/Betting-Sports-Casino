namespace intranet.services {
    export class WebsiteService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public getWebsiteList(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('website', data);
        }

        public getWebsites(): ng.IHttpPromise<any> {
            return this.baseService.get('website/getwebsites');
        }

        public addWebsite(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('website/addwebsite', data);
        }

        public updateWebsite(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('website/updatewebsite', data);
        }

        public deleteWebsite(id: number): ng.IHttpPromise<any> {
            return this.baseService.get('website/deletewebsite/' + id);
        }

        public getSupportDetail(): ng.IHttpPromise<any> {
            return this.baseService.get('website/supportdetail');
        }

        public clearAllCache(): ng.IHttpPromise<any> {
            return this.baseService.get('website/clearcache');
        }

        public updatePaymentDetails(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('website/updatepgdetails', data);
        }

        public updateOTPConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('website/updateotpconfig', data);
        }

        public getPaymentDetails(websiteId: any): ng.IHttpPromise<any> {
            return this.baseService.get('website/getpgdetails/' + websiteId, { timeout: this.baseService.reportTime });
        }

        public getPGInfo(): ng.IHttpPromise<any> {
            return this.baseService.get('website/getpginfo');
        }

        public createWallet(websiteid: any, wallettype: any): ng.IHttpPromise<any> {
            return this.baseService.get('website/createWallet/' + websiteid + '/' + wallettype, { timeout: this.baseService.reportTime });
        }

        public updateWhatsapp(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('website/updatesupportdetails', data);
        }

        public updateOffPaymentDetails(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('website/updateoffpaymentdetails', data);
        }


        public getAgentBanners(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('website/getagentbanner', data);
        }
        public addAgentBanner(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('website/addagentbanner', data);
        }
        public deleteAgentBanner(id: number): ng.IHttpPromise<any> {
            return this.baseService.get('website/deleteagentbanner/' + id);
        }
        public changeActiveAgentBanner(bannerid: any, isActive: any): ng.IHttpPromise<any> {
            return this.baseService.get('website/changeactiveagentbanner/' + bannerid + '/' + isActive);
        }
        public getBanners(isMobile: any): ng.IHttpPromise<any> {
            return this.baseService.get('website/getbanners/' + isMobile);
        }
        public getBannerCount(isMobile: any): ng.IHttpPromise<any> {
            return this.baseService.get('website/getbannercount/' + isMobile);
        }
    }

    angular.module('intranet.services').service('websiteService', WebsiteService);

}