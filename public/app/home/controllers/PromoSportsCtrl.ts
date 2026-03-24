module intranet.home {
    export interface IPromoSportsScope extends intranet.common.IScopeBase {
        swiperReady: boolean;
        webImagePath: any;
        liveGamesMarkets: any[];
        liveGameTypes: any[];
    }

    export class PromoSportsCtrl extends intranet.common.ControllerBase<IPromoSportsScope>
        implements intranet.common.init.IInit {
        constructor($scope: IPromoSportsScope,
            private $timeout: any,
            private isMobile: any,
            private commonDataService: common.services.CommonDataService,
            private $state: any,
            private settings: intranet.common.IBaseSettings) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            this.$scope.liveGamesMarkets = common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
        }

        public loadInitialData(): void {
            if (this.settings.ThemeName == 'sports') {
                this.setSwiperForSports();
            }
            else if (this.settings.ThemeName == 'dimd2') {
                this.$scope.liveGameTypes = common.helpers.CommonHelper.GetCasinoType(this.settings.ThemeName);
            }
        }

        private openFDCasino(lg) {
            this.commonDataService.setGameId(lg.tableId);
            if (this.isMobile.any) {
                this.$state.go('mobile.base.fdlivegames');
            } else {
                if (this.settings.ThemeName == 'dimd2') {
                    this.$state.go('base.home.livegames');
                } else {
                    this.$state.go('base.livegames');
                }
            }
        }

        private openCasino(id) {
            this.commonDataService.setGameId(id);
            if (this.isMobile.any) {
                this.$state.go('mobile.base.fdlivegames');
            } else {
                this.$state.go('base.livegames');
            }
        }

        private setSwiperForSports(): void {
            this.$timeout(() => {
                var mySwiper3 = new Swiper('#swiper8', {
                    // Optional parameters
                    slidesPerView: (this.isMobile.any ? 4 : 8),
                    spaceBetween: 5, freeMode: true,
                });
                var mySwiper4 = new Swiper('#indian-casino', {
                    // Optional parameters
                    slidesPerView: (this.isMobile.any ? 1 : 3),
                    spaceBetween: 30,
                    loop: true,
                    autoplay: true,
                    freeMode: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
                var mySwiper5 = new Swiper('#live-casino', {
                    // Optional parameters
                    slidesPerView: (this.isMobile.any ? 1 : 3),
                    spaceBetween: 15,
                    loop: true,
                    autoplay: true,
                    freeMode: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
                var mySwiper6 = new Swiper('#slot-casino', {
                    // Optional parameters
                    slidesPerView: (this.isMobile.any ? 1 : 5),
                    spaceBetween: 15,
                    loop: true,
                    autoplay: true,
                    freeMode: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
                this.$scope.swiperReady = true;
            }, 10);
        }

        private openLoginModal() {
            this.$rootScope.$emit('open-login-modal');
        }

    }
    angular.module('intranet.home').controller('promoSportsCtrl', PromoSportsCtrl);
}