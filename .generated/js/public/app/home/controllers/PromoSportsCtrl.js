var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class PromoSportsCtrl extends intranet.common.ControllerBase {
            constructor($scope, $timeout, isMobile, commonDataService, $state, settings) {
                super($scope);
                this.$timeout = $timeout;
                this.isMobile = isMobile;
                this.commonDataService = commonDataService;
                this.$state = $state;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
                this.$scope.liveGamesMarkets = intranet.common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
            }
            loadInitialData() {
                if (this.settings.ThemeName == 'sports') {
                    this.setSwiperForSports();
                }
                else if (this.settings.ThemeName == 'dimd2') {
                    this.$scope.liveGameTypes = intranet.common.helpers.CommonHelper.GetCasinoType(this.settings.ThemeName);
                }
            }
            openFDCasino(lg) {
                this.commonDataService.setGameId(lg.tableId);
                if (this.isMobile.any) {
                    this.$state.go('mobile.base.fdlivegames');
                }
                else {
                    if (this.settings.ThemeName == 'dimd2') {
                        this.$state.go('base.home.livegames');
                    }
                    else {
                        this.$state.go('base.livegames');
                    }
                }
            }
            openCasino(id) {
                this.commonDataService.setGameId(id);
                if (this.isMobile.any) {
                    this.$state.go('mobile.base.fdlivegames');
                }
                else {
                    this.$state.go('base.livegames');
                }
            }
            setSwiperForSports() {
                this.$timeout(() => {
                    var mySwiper3 = new Swiper('#swiper8', {
                        slidesPerView: (this.isMobile.any ? 4 : 8),
                        spaceBetween: 5, freeMode: true,
                    });
                    var mySwiper4 = new Swiper('#indian-casino', {
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
            openLoginModal() {
                this.$rootScope.$emit('open-login-modal');
            }
        }
        home.PromoSportsCtrl = PromoSportsCtrl;
        angular.module('intranet.home').controller('promoSportsCtrl', PromoSportsCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PromoSportsCtrl.js.map