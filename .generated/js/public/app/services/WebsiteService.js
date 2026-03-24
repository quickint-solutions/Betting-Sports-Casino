var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class WebsiteService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getWebsiteList(data) {
                return this.baseService.post('website', data);
            }
            getWebsites() {
                return this.baseService.get('website/getwebsites');
            }
            addWebsite(data) {
                return this.baseService.post('website/addwebsite', data);
            }
            updateWebsite(data) {
                return this.baseService.post('website/updatewebsite', data);
            }
            deleteWebsite(id) {
                return this.baseService.get('website/deletewebsite/' + id);
            }
            getSupportDetail() {
                return this.baseService.get('website/supportdetail');
            }
            clearAllCache() {
                return this.baseService.get('website/clearcache');
            }
            updatePaymentDetails(data) {
                return this.baseService.post('website/updatepgdetails', data);
            }
            updateOTPConfig(data) {
                return this.baseService.post('website/updateotpconfig', data);
            }
            getPaymentDetails(websiteId) {
                return this.baseService.get('website/getpgdetails/' + websiteId, { timeout: this.baseService.reportTime });
            }
            getPGInfo() {
                return this.baseService.get('website/getpginfo');
            }
            createWallet(websiteid, wallettype) {
                return this.baseService.get('website/createWallet/' + websiteid + '/' + wallettype, { timeout: this.baseService.reportTime });
            }
            updateWhatsapp(data) {
                return this.baseService.post('website/updatesupportdetails', data);
            }
            updateOffPaymentDetails(data) {
                return this.baseService.post('website/updateoffpaymentdetails', data);
            }
            getAgentBanners(data) {
                return this.baseService.post('website/getagentbanner', data);
            }
            addAgentBanner(data) {
                return this.baseService.post('website/addagentbanner', data);
            }
            deleteAgentBanner(id) {
                return this.baseService.get('website/deleteagentbanner/' + id);
            }
            changeActiveAgentBanner(bannerid, isActive) {
                return this.baseService.get('website/changeactiveagentbanner/' + bannerid + '/' + isActive);
            }
            getBanners(isMobile) {
                return this.baseService.get('website/getbanners/' + isMobile);
            }
            getBannerCount(isMobile) {
                return this.baseService.get('website/getbannercount/' + isMobile);
            }
        }
        services.WebsiteService = WebsiteService;
        angular.module('intranet.services').service('websiteService', WebsiteService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=WebsiteService.js.map