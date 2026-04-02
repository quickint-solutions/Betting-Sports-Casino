module intranet.home {
    export interface IFooterScope extends intranet.common.IScopeBase {
        hasAPK: any;
        supportDetail: any;
        webImagePath: any;
        currentWebApp: any;
    }

    export class FooterCtrl extends intranet.common.ControllerBase<IFooterScope>
        implements intranet.common.init.IInit {
        constructor($scope: IFooterScope,
            private isMobile: any,
            private $state: ng.ui.IStateService,
            private commonDataService: common.services.CommonDataService,
            private settings: intranet.common.IBaseSettings,
            private $timeout: any) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.hasAPK = this.settings.HasAPK;
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            this.$scope.currentWebApp = this.settings.WebApp;
        }

        public loadInitialData(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data.supportDetails && data.supportDetails.length > 3) {
                        this.$scope.supportDetail = JSON.parse(data.supportDetails);
                    }
                });

            this.initFooterSwipers();
        }

        private initFooterSwipers(): void {
        }

        private downloadAPK(): void {
            this.commonDataService.downloadClientAPK();
        }

        public openCasinoGame(tableId: string): void {
            this.commonDataService.setGameId(tableId);
            if (this.$state.current.name.indexOf('promo') > -1) {
                if (this.isMobile.any) {
                    this.$state.go('mobile.promo.casino');
                } else {
                    this.$state.go('promo.casino');
                }
            } else {
                if (this.isMobile.any) {
                    this.$state.go('mobile.base.casino');
                } else {
                    this.$state.go('base.casino');
                }
            }
        }

        private showLink(state: any) {
            if (this.$state.current.name.indexOf('promo') > -1) {
                if (this.isMobile.any) {
                    this.$state.go('mobile.promo.publink.' + state);
                } else {
                    this.$state.go('promo.publink.' + state);
                }
            } else {
                if (this.isMobile.any) {
                    this.$state.go('mobile.base.publink.' + state);
                } else {
                    this.$state.go('base.publink.' + state);
                }
            }
        }
    }
    angular.module('intranet.home').controller('footerCtrl', FooterCtrl);
}