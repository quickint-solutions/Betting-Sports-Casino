var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class FooterCtrl extends intranet.common.ControllerBase {
            constructor($scope, isMobile, $state, commonDataService, settings) {
                super($scope);
                this.isMobile = isMobile;
                this.$state = $state;
                this.commonDataService = commonDataService;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.hasAPK = this.settings.HasAPK;
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
                this.$scope.currentWebApp = this.settings.WebApp;
            }
            loadInitialData() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data.supportDetails && data.supportDetails.length > 3) {
                        this.$scope.supportDetail = JSON.parse(data.supportDetails);
                    }
                });
            }
            downloadAPK() {
                this.commonDataService.downloadClientAPK();
            }
            showLink(state) {
                if (this.$state.current.name.indexOf('promo') > -1) {
                    if (this.isMobile.any) {
                        this.$state.go('mobile.promo.publink.' + state);
                    }
                    else {
                        this.$state.go('promo.publink.' + state);
                    }
                }
                else {
                    if (this.isMobile.any) {
                        this.$state.go('mobile.base.publink.' + state);
                    }
                    else {
                        this.$state.go('base.publink.' + state);
                    }
                }
            }
        }
        home.FooterCtrl = FooterCtrl;
        angular.module('intranet.home').controller('footerCtrl', FooterCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=FooterCtrl.js.map