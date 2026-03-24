module intranet.home {
    export interface IPageNotFoundScope extends intranet.common.IScopeBase {
        backurl: string;
    }

    export class PageNotFoundCtrl extends intranet.common.ControllerBase<IPageNotFoundScope> {
        constructor($scope: IPageNotFoundScope,
            private settings: intranet.common.IBaseSettings,
            private $state: any,
            private isMobile: any,
            protected $rootScope: any) {
            super($scope);
        }


        private goBack(): void {
            if (this.$rootScope.currentState.name) {
                if (this.$rootScope.currentStateParams) {
                    this.$state.go(this.$rootScope.currentState.name, this.$rootScope.currentStateParams);
                }
                else {
                    this.$state.go(this.$rootScope.currentState.name);
                }
            } else {
                if (this.isMobile.any) {
                    if (this.settings.IsMobileSeperate) { window.location.href = this.settings.MobileUrl; } else {
                        common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                            ? this.$state.go('mobile.promo')
                            : this.$state.go('mobile.login');
                    }
                }
                else {
                    common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) && this.settings.WebSiteIdealFor <= 2
                        ? this.$state.go('promo')
                        : this.$state.go('login');
                }
            }
        }
    }
    angular.module('intranet.home').controller('pageNotFoundCtrl', PageNotFoundCtrl);
}