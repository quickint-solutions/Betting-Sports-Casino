var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class PageNotFoundCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, $state, isMobile, $rootScope) {
                super($scope);
                this.settings = settings;
                this.$state = $state;
                this.isMobile = isMobile;
                this.$rootScope = $rootScope;
            }
            goBack() {
                if (this.$rootScope.currentState.name) {
                    if (this.$rootScope.currentStateParams) {
                        this.$state.go(this.$rootScope.currentState.name, this.$rootScope.currentStateParams);
                    }
                    else {
                        this.$state.go(this.$rootScope.currentState.name);
                    }
                }
                else {
                    if (this.isMobile.any) {
                        if (this.settings.IsMobileSeperate) {
                            window.location.href = this.settings.MobileUrl;
                        }
                        else {
                            intranet.common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                                ? this.$state.go('mobile.promo')
                                : this.$state.go('mobile.login');
                        }
                    }
                    else {
                        intranet.common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                            ? this.$state.go('promo')
                            : this.$state.go('login');
                    }
                }
            }
        }
        home.PageNotFoundCtrl = PageNotFoundCtrl;
        angular.module('intranet.home').controller('pageNotFoundCtrl', PageNotFoundCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PageNotFoundCtrl.js.map