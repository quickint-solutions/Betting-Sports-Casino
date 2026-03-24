var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class CommonProcessService {
                constructor(settings, $location, $q, settingService, isMobile) {
                    this.settings = settings;
                    this.$location = $location;
                    this.$q = $q;
                    this.settingService = settingService;
                    this.isMobile = isMobile;
                }
                onLoadLocationSelection() {
                    if (this.$location.$$search.code) {
                        if (this.isMobile.any) {
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
                    else if (this.isMobile.any) {
                        if (this.settings.IsMobileSeperate) {
                            window.location.href = this.settings.MobileUrl;
                        }
                        else {
                            common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                                ? this.$location.path('/mobile/m-promo')
                                : this.$location.path('/mobile/login');
                        }
                    }
                    else {
                        common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                            ? this.$location.path('/promo')
                            : this.$location.path('/login');
                    }
                }
                siteLiveNow() {
                    if (this.settings.IsFaaS) {
                        this.$location.path('/fs');
                    }
                    else {
                        if (this.isMobile.any) {
                            common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                                ? this.$location.path('/mobile/m-promo')
                                : this.$location.path('/mobile/login');
                        }
                        else {
                            common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                                ? this.$location.path('/promo')
                                : this.$location.path('/login');
                        }
                    }
                }
                isAPILive() {
                    var defer = this.$q.defer();
                    defer.resolve({ continue: true });
                    return defer.promise;
                }
            }
            services.CommonProcessService = CommonProcessService;
            angular.module('intranet.common.services').service('commonProcessService', CommonProcessService);
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CommonProcessService.js.map