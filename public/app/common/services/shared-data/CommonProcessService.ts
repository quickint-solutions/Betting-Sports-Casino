namespace intranet.common.services {
    export class CommonProcessService {
        constructor(private settings: common.IBaseSettings,
            private $location: any,
            private $q: ng.IQService,
            private settingService: intranet.services.SettingService,
            private isMobile: any) {
        }

        private isMobileView(): boolean {
            return this.isMobile.any || window.innerWidth < 992;
        }

        public onLoadLocationSelection(): void {
            //this.settingService.checkAPIstatus()
            //    .then((response: any) => {
            //        if (response && response.apiStatus == false) {
            //            this.$location.path('/maintenance');
            //        } 
            //    });

            //if (this.settings.IsFaaS) {
            //    this.$location.path('/fs');
            //}
            //else {

            if (this.$location.$$search.code) {
                if (this.isMobileView()) {

                    common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp)
                        ? this.$location.path('/mobile/m-promo') + '?code=' + this.$location.$$search.code
                        : this.$location.path('/mobile/register') + '?code=' + this.$location.$$search.code;
                }
                else {
                    common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp)
                        ? this.$location.path('/promo') + '?code=' + this.$location.$$search.code
                        : this.$location.path('/register') + '?code=' + this.$location.$$search.code;
                }
            }
            else if (this.isMobileView()) {
                if (this.settings.IsMobileSeperate) { window.location.href = this.settings.MobileUrl; } else {
                    common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                        ? this.$location.path('/mobile/m-promo')
                        : this.$location.path('/mobile/login');
                }
            } else {
                common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                    ? this.$location.path('/promo')
                    : this.$location.path('/login');
            }
            //}
        }

        public siteLiveNow(): void {
            if (this.settings.IsFaaS) {
                this.$location.path('/fs');
            }
            else {
                if (this.isMobileView()) {
                    common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                        ? this.$location.path('/mobile/m-promo')
                        : this.$location.path('/mobile/login');
                } else {
                    common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                        ? this.$location.path('/promo')
                        : this.$location.path('/login');
                }
            }
        }

        public isAPILive(): ng.IPromise<any> {
            var defer = this.$q.defer();
            //this.settingService.checkAPIstatus()
            //    .then((response: any) => {
            //        if (response && response.apiStatus == false) {
            //            this.$location.path('/maintenance');
            //            defer.resolve({ continue: false });
            //        } else { defer.resolve({ continue: true }); }
            //    }).finally(() => { defer.resolve({ continue: true }); });
            defer.resolve({ continue: true });
            return defer.promise;
        }
    }

    angular.module('intranet.common.services').service('commonProcessService', CommonProcessService);
}