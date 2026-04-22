module intranet.home {
    export interface IPromoScope extends intranet.common.IBetScopeBase {
        supportDetail: any;
        imagePath: any;
        currentWebApp: string;
        isRegisterEnabled: any;
        webImagePath: any;

        spinnerImg: any;
        showLoading: boolean;
        showDemoLoading: boolean;

        //download app
        downloadApp: boolean;

        refreshCaptcha: any;
        captcha: any;
        quickModel: any;
        loginModel: any;
        userId: any;
        loginMessages: any[];
        loginMethod: any;//1=mobile,2=username

        demoLoginModel: any;

        changePasswordModel: any;
        changePasswordMessages: common.messaging.ResponseMessage[];

        changeMobileModel: any;
        changeMobileMessages: common.messaging.ResponseMessage[];

        verifyMessages: common.messaging.ResponseMessage[];
        verifyModel: any;
        timer_otp: any;
        resendTimer: any;

        registerModel: any;
        registerMessages: common.messaging.ResponseMessage[];
        offerCheckTimeout: any;

        forgotModel: any;
        forgotMessages: common.messaging.ResponseMessage[];

        displayName: string;

        captchaMode: any;
        gWidgetId: any;
        gCaptchaPromise: any;
        gCaptchKey: any;

        currentDate: any;
        carouselIndex: any;

        liveGamesMarkets: any[];
        countryList: any;

        sports: any[];
        races: any[];
        popularMarkets: any[];
        odds: any[];
        hasAnyDrawMarket: any;
        hasAPK: any;
        bannerPath: any;
        horseId: any;
        greyhoundId: any;
        footerTemplate: any;
        hasCasino: boolean;
        offerList: any[];
        offerLoaded: boolean;

        timezone: any;
        selectedTimezone: any;
        leftMenuOpen: any;
        anyMenuOpen: any;

        filteredSports: any[];
        selectedEventTypeName: any;

        needsToHideRightSide: boolean;
        isLightTheme: boolean;
        isRequestProcessing: boolean;
        authTab: string;

        originalGamesSwiper: any;
        auraGamesSwiper: any;
        vimplayGamesSwiper: any;
        swiperPrev: (key: string) => void;
        swiperNext: (key: string) => void;

        // Dynamic game sections (null = loading, [] = empty/failed, Game[] = loaded).
        bigWins: services.IGame[] | null;
        fairbetGames: services.IGame[] | null;
        auraGames: services.IGame[] | null;
        vimplayGames: services.IGame[] | null;
        gameFallbackImage: string;
        bigWinsTones: string[];
        bigWinsTags: string[];
    }

    export class PromoCtrl extends intranet.common.BetControllerBase<IPromoScope>
        implements intranet.common.init.IInit {
        constructor($scope: IPromoScope,
            private baseAuthenticationService: common.services.BaseAuthenticationService,
            private userService: services.UserService,
            private authorizationService: intranet.common.services.AuthorizationService,
            public $timeout: ng.ITimeoutService,
            public toasterService: common.services.ToasterService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public commonDataService: common.services.CommonDataService,
            private $location: any,
            private $translate: any,
            private $filter: any,
            public $rootScope: any,
            private $sce: any,
            private $q: any,
            private $window: any,
            private $interval: any,
            private $stateParams: any,
            public WSSocketService: any,
            private WSFairTradeSocketService: any,
            private vcRecaptchaService: any,
            public modalService: common.services.ModalService,
            private isMobile: any,
            public settings: common.IBaseSettings,
            private marketOddsService: services.MarketOddsService,
            private settingService: services.SettingService,
            private eventTypeService: services.EventTypeService,
            private websiteService: services.WebsiteService,
            private offerService: services.OfferService,
            private gameListService: services.GameListService,
            private $state: ng.ui.IStateService) {
            super($scope);

            this.$rootScope.viewPort = "width=device-width, initial-scale=1.0,maximum-scale=1";

            this.$scope.gCaptchaPromise = this.$q.defer();

            jQuery('body').removeClass('mbg');
            jQuery('body').addClass('cbg');
            jQuery('body').addClass('promo-body');

            this.$scope.authTab = 'login';

            // Light theme toggle initialization
            var savedTheme = this.localStorageHelper.get('theme_mode');
            this.$scope.isLightTheme = savedTheme === 'light';
            if (this.$scope.isLightTheme) {
                jQuery('body').addClass('light-theme');
            }

            if (this.isMobile.any) { jQuery('body').addClass('mobile-bg'); }

           
            if (this.settings.ThemeName == 'dimd2') { jQuery('body').addClass('login-home'); }

            var currenttime = null;
            currenttime = this.$interval(() => {
                this.$scope.currentDate = new Date();
            }, 1000);

            var rootlogin = this.$rootScope.$on('open-login-modal', () => { this.openModal('login-modal'); });
            var rootsignup = this.$rootScope.$on('open-register-modal', () => { this.openModal('verify-modal'); });

            var stateWatcher = $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
                if ((toState.name == 'promo' || toState.name == 'mobile.promo') && fromState.name != toState.name) {
                    if (this.settings.ThemeName == 'sports') {
                        this.setSwiperForSports();
                    }
                }
                if (this.settings.ThemeName == 'dimd2') { this.loadDimd2Sliders(); }
                if (this.settings.ThemeName == 'sports') {
                    this.checkState(toState.name);
                }
            });

            this.$scope.$on('$destroy', () => {
                if (currenttime) { this.$interval.cancel(currenttime); }
                this.$timeout.cancel(this.$scope.timer_otp);
                this.$timeout.cancel(this.$scope.refreshCaptcha);
                jQuery("body").removeClass('modal-open');
                jQuery("html").removeClass('html-scroll-off');
                jQuery('body').removeClass('promo-body');
                rootlogin();
                rootsignup();
                stateWatcher();
            });

            super.init(this);
        }

        public initScopeValues() {
            var haveUserData = this.commonDataService.getLoggedInUserData();
            if (haveUserData) { this.commonDataService.logout(); }

            this.$scope.imagePath = this.settings.ImagePath;
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            this.$scope.currentWebApp = this.settings.WebApp;
            this.$scope.downloadApp = this.settings.HasAPK;
            this.$scope.spinnerImg = this.commonDataService.rippleImg;
            this.$scope.showLoading = false;
            this.$scope.loginMethod = 1;

            this.$scope.loginMessages = [];
            this.$scope.changePasswordMessages = [];
            this.$scope.registerMessages = [];
            this.$scope.forgotMessages = [];
            this.$scope.changeMobileMessages = [];

            this.$scope.countryList = [];
            this.$scope.supportDetail = {};

            this.$scope.changePasswordModel = {};
            this.$scope.quickModel = {};
            this.$scope.loginModel = {};
            this.$scope.demoLoginModel = {};
            this.$scope.registerModel = {};
            this.$scope.verifyModel = {};
            this.$scope.forgotModel = {};
            this.$scope.changeMobileModel = {};

            this.$scope.displayName = this.settings.Title;

            this.$scope.carouselIndex = 0;

            this.$scope.footerTemplate = this.isMobile.any ? this.settings.ThemeName + '/template/mobile-footer.html' : this.settings.ThemeName + '/template/footer.html';
            this.$scope.races = [];
            this.$scope.popularMarkets = [];
            this.$scope.horseId = this.settings.HorseRacingId;
            this.$scope.greyhoundId = this.settings.GreyhoundId;
            this.$scope.resendTimer = 0;


            this.$scope.timezone = common.helpers.CommonHelper.getTimeZone();
            this.$scope.selectedTimezone = this.$scope.timezone;

            // Dynamic game sections — start in loading state; populated by loadGameSections().
            this.$scope.bigWins = null;
            this.$scope.fairbetGames = null;
            this.$scope.auraGames = null;
            this.$scope.vimplayGames = null;
            this.$scope.gameFallbackImage = this.$scope.webImagePath + 'casino/img/placeholder.jpg';
            // Visual tone cycling for Big Wins cards (matches the hardcoded palette that was there before).
            this.$scope.bigWinsTones = [
                'tone-copper','tone-gold','tone-lime','tone-ruby','tone-violet','tone-olive',
                'tone-plum','tone-sand','tone-orange','tone-fuchsia','tone-amber','tone-emerald',
                'tone-flame','tone-aqua'
            ];
            this.$scope.bigWinsTags = [
                'tag-coral','tag-gold','tag-lime','tag-ruby','tag-violet','tag-olive',
                'tag-plum','tag-sand','tag-orange','tag-fuchsia','tag-amber','tag-emerald',
                'tag-flame','tag-aqua'
            ];
        }

        public loadInitialData() {
            if (this.$location.$$search.utm_source) {
                this.localStorageHelper.set('utm_source', this.$location.$$search.utm_source);
            }

            if (this.settings.ThemeName == 'betfair' || this.settings.ThemeName == 'sky') {
                if (this.$stateParams.msg && this.$stateParams.msg == 'r') {
                    this.$state.go(this.$state.current.name, { msg: '' });
                } else {
                    this.loadCountries();
                    this.loadWebsiteDetail();
                    this.getSports();
                    this.getRaces();
                    this.getOddsJson();
                    this.getOffers();
                }
                if (this.$location.$$search.code) {
                    this.openModal('verify-modal');
                }
                this.$translate.use('5d78a18f8646534c986671fd');
                this.$scope.hasAPK = this.settings.HasAPK;
                this.$scope.bannerPath = this.settings.ImagePath + 'images/promo-banner.jpg';
                if (this.settings.WebApp == 'electionexch') { this.$scope.bannerPath = this.settings.ImagePath + 'images/cover-image/plitics.jpg'; }
            }
            else if (this.settings.ThemeName == 'lotus') {
                if (this.$stateParams.msg && this.$stateParams.msg == 'r') {
                    this.$state.go(this.$state.current.name, { msg: '' });
                } else {
                    this.loadCountries();
                    this.loadWebsiteDetail();
                    this.getSports();
                    this.getRaces();
                    this.getOddsJson(); this.getOffers();
                }
                if (this.$location.$$search.code) {
                    this.openModal('verify-modal');
                }
                this.$translate.use('5d78a18f8646534c986671fd');
                this.$scope.hasAPK = this.settings.HasAPK;
                this.$scope.bannerPath = this.settings.ImagePath + 'images/promo-banner.jpg';

                this.$timeout(() => {
                    jQuery('.top-banner').slick({
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        swipeToSlide: true,
                        autoplay: true,
                        autoplaySpeed: 2000,
                        arrows: false,
                        infinite: true,
                        variableWidth: true
                    });
                    jQuery('.exchangeGames-content').slick({
                        slidesToShow: 1,
                        slidesToScroll: 3,
                        autoplay: false,
                        autoplaySpeed: 2000,
                        arrows: false,
                        infinite: true,
                        variableWidth: true,
                        swipeToSlide: true
                    });
                    jQuery('.popularGames-content').slick({
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: false,
                        autoplaySpeed: 2000,
                        arrows: false,
                        infinite: true,
                        variableWidth: true,
                        swipeToSlide: true
                    });
                    if (this.isMobile.any) { this.registerScrollEvent(); }
                }, 1000);
            }
            else if (this.settings.ThemeName == 'sports') {
                if (this.$stateParams.msg && this.$stateParams.msg == 'r') {
                    this.$state.go(this.$state.current.name, { msg: '' });
                } else {
                    this.loadCountries();
                    this.loadWebsiteDetail();
                    this.getSports();
                    this.getRaces();
                    this.getOddsJson();
                    this.getOffers();
                }
                if (this.$location.$$search.code) {
                    this.openModal('verify-modal');
                }
            }
            else if (this.settings.ThemeName == 'dimd2') {
                this.$scope.selectedEventTypeName = this.settings.CricketId;
                this.loadCountries();
                this.loadWebsiteDetail();
                this.getSports();
                this.getOddsJson();
                this.getOffers();
                this.loadDimd2Sliders();

                var scroll = 0;
                jQuery('.sport-tabs .arrow-right').click(function () {
                    scroll = scroll + 200;
                    jQuery('#taj_home_sports_list').animate({ scrollLeft: scroll }, 50);
                });
                jQuery('.sport-tabs .arrow-left').click(function () {
                    scroll = scroll - 200;
                    if (scroll < 0) { scroll = 0; }
                    jQuery('#taj_home_sports_list').animate({ scrollLeft: scroll }, 50);

                });
            }
            else if (this.settings.ThemeName == 'dimd') {
                if (this.$stateParams.msg && this.$stateParams.msg == 'r') {
                    this.$state.go(this.$state.current.name, { msg: '' });
                }

                this.loadCountries();
                this.loadWebsiteDetail();

                if (this.$location.$$search.code) {
                    this.openModal('verify-modal');
                } else {
                    this.openModal('login-modal');
                }
                this.$translate.use('5d78a18f8646534c986671fd');
                this.$scope.hasAPK = this.settings.HasAPK;
            }
            else {
                this.$scope.selectedEventTypeName = '!alleventypes';
                if (this.isMobile.any) { document.body.style.position = "unset"; }
                if (common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp)) {
                    if (this.settings.WebApp == 'booster99') { this.commonDataService.addGaminIcon(); }
                }
                if (this.$stateParams.msg && this.$stateParams.msg == 'r') {
                    this.$state.go(this.$state.current.name, { msg: '' });
                }
                else {
                    this.loadCountries();
                    this.loadWebsiteDetail();
                    this.getSportsForBking();
                    this.getOddsJson();
                    this.startBkingSlick();
                    this.getOffers();
                }
                if (this.$location.$$search.code) {
                    this.openModal('verify-modal');
                }
            }
        }

        private loadDimd2Sliders() {
            waitForElement('home-banner', function () {
                jQuery('#home-banner').carousel({ ride: 'carousel' });
            });

            waitForElement('.home-casiono-icons.new-launch .hooper-track', function () {
                jQuery('.home-casiono-icons.new-launch .hooper-track').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 3000,
                    infinite: true,
                    fade: true,
                    easing: 'linear',
                });
            }, true);
            waitForElement('.top-winner-list-box-container1', function () {
                jQuery('.top-winner-list-box-container1').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 2000,
                    //centerMode: true,
                    arrows: false,
                    infinite: true,
                    easing: 'linear',
                    variableWidth: true,
                });
            }, true);

            waitForElement('.login-fixture', function () {
                jQuery('.login-fixture').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 2000,
                    //centerMode: true,
                    arrows: false,
                    infinite: true,
                    easing: 'linear',
                    variableWidth: true,
                });
            }, true);

            waitForElement('.upcoming-fixure .hooper-track', function () {
                jQuery('.upcoming-fixure .hooper-track').slick({
                    vertical: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 2000,
                    infinite: true,
                    easing: 'linear',
                });
            }, true);

            waitForElement('.top-results .hooper-track', function () {
                jQuery('.top-results .hooper-track').slick({
                    vertical: true,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 2000,
                    infinite: true,
                    easing: 'linear',
                });
            }, true);

            waitForElement('.home-casiono-icons.casino .hooper-track', function () {
                jQuery('.home-casiono-icons.casino .hooper-track').slick({
                    vertical: true,
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 3000,
                    infinite: true,
                    easing: 'linear',
                    verticalSwiping: true
                });
            }, true);

            if (this.isMobile.any) {
                waitForElement('.point-casino-list .hooper-track', function () {
                    jQuery('.point-casino-list .hooper-track').slick({
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        autoplay: true,
                        autoplaySpeed: 3000,
                        infinite: true,
                        fade: false,
                        easing: 'linear',
                    });
                }, true);

                waitForElement('.point-casino-carousal .slick-track', function () {
                    jQuery('.point-casino-carousal .slick-track').slick({
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        autoplay: true,
                        autoplaySpeed: 3000,
                        infinite: true,
                        fade: false,
                        easing: 'linear',
                    });
                }, true);
            }

        }

        private loadCountries() {
            this.settingService.getCountryList()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.countryList = response.data;
                        var selectedCountry = this.$scope.countryList[0];
                        var selectedList = this.$scope.countryList.filter((c: any) => { return c.isSelected; }) || [];
                        if (selectedList.length > 0) {
                            selectedCountry = selectedList[0];
                        }

                        this.$scope.verifyModel.selectedCountry = {};
                        angular.copy(selectedCountry, this.$scope.verifyModel.selectedCountry);

                        this.$scope.forgotModel.selectedCountry = {};
                        angular.copy(selectedCountry, this.$scope.forgotModel.selectedCountry);

                        this.$scope.changeMobileModel.selectedCountry = {};
                        angular.copy(selectedCountry, this.$scope.changeMobileModel.selectedCountry);

                        this.$scope.loginModel.selectedCountry = {};
                        angular.copy(selectedCountry, this.$scope.loginModel.selectedCountry);
                    }
                });
        }

        private countryChanged(model: any) {
            model.otpvia = 2;
        }

        private startBkingSlick() {
            this.$timeout(() => {
                jQuery('.my-slick-wrapper').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 2000,
                    //centerMode: true,
                    arrows: false,
                    infinite: true,
                    variableWidth: false
                });
            }, 1000);
        }

        private timezoneChanged(value: any): void {
            this.$scope.selectedTimezone = value;
            this.$rootScope.timezone = value.replace(':', '');
        }

        private isActive(path: string): any {
            return (this.$location.$$url == path) ? true : false;
        }

        private loadWebsiteDetail(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        this.$scope.captchaMode = data.captchaMode;
                        this.$scope.isRegisterEnabled = data.isRegisterEnabled;
                        this.$scope.hasCasino = data.hasCasino;


                        var lastLoginMethod = this.localStorageHelper.get('loginmethod_' + this.settings.WebApp);
                        if (this.settings.WebApp == 'sportsbar11') { this.$scope.loginMethod = 2; }
                        else if (lastLoginMethod > 0) { this.$scope.loginMethod = lastLoginMethod; }
                        else if (!data.isRegisterEnabled) { this.$scope.loginMethod = 2; }

                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                            this.$scope.gCaptchKey = this.$scope.supportDetail.recaptchaSiteKey;

                            if (this.$scope.supportDetail.chat == true) {
                                this.addChatSupport();
                            }
                        }

                        if (data.hasCasino) {
                            this.$scope.liveGamesMarkets = common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
                        }
                    }
                }).finally(() => {
                    if (this.settings.ThemeName == 'sports') {
                        this.setSwiperForSports();
                        this.loadGameSections();
                    }
                    if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                        this.getCaptcha();
                    } else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                        this.addGoogleCaptcha();
                    }
                });
        }

        // Fetches the four game sections in parallel and re-inits swipers once the DOM has the new slides.
        // Each promise writes [] on failure so the template's empty-state path fires instead of spinning forever.
        public loadGameSections(): void {
            if (!this.gameListService) { return; }
            var bigWins = this.gameListService.getRecentBigWins(24)
                .then((games: services.IGame[]) => { this.$scope.bigWins = games || []; })
                .catch(() => { this.$scope.bigWins = []; });

            var fairbet = this.gameListService.getGamesByProvider(services.PROVIDER_FAIRBET)
                .then((games: services.IGame[]) => { this.$scope.fairbetGames = games || []; })
                .catch(() => { this.$scope.fairbetGames = []; });

            var aura = this.gameListService.getGamesByProvider(services.PROVIDER_AURA)
                .then((games: services.IGame[]) => { this.$scope.auraGames = games || []; })
                .catch(() => { this.$scope.auraGames = []; });

            var vimplay = this.gameListService.getGamesByProvider(services.PROVIDER_VIMPLAY)
                .then((games: services.IGame[]) => { this.$scope.vimplayGames = games || []; })
                .catch(() => { this.$scope.vimplayGames = []; });

            this.$q.all([bigWins, fairbet, aura, vimplay]).finally(() => {
                // Re-init swipers on the next tick so they see the rendered ng-repeat slides.
                this.$timeout(() => { this.setSwiperForSports(); }, 0);
            });
        }

        // Click handler for the 4 dynamic sections.
        // - If backend returned a ready-to-open directGameUrl (logged-in users or public-launch games),
        //   redirect to it without opening an iframe.
        // - Otherwise fall back to the existing openCasinoGame(tableId) flow, which stashes the
        //   tableId in localStorage and opens the login modal. This is the same behavior the old
        //   hardcoded cards had — required because the promo page forces logout on init and the
        //   upstream endpoint isn't callable anonymously.
        public openGame(game: services.IGame): void {
            if (!game) { return; }
            if (game.directGameUrl) {
                this.$window.open(game.directGameUrl, '_blank');
                return;
            }
            if (game.tableId) {
                // Stash the full game so after login we route directly to the right provider view.
                this.localStorageHelper.set('pending_casino_game_meta', {
                    tableId:    game.tableId,
                    uniqueKey:  game.uniqueKey || '',
                    providerId: game.providerId || 0,
                    isVirtual:  !!game.isVirtual,
                    name:       game.name || '',
                });
                this.openCasinoGame(game.tableId);
            }
        }

        private clearModelObjects(): void {
            this.$scope.quickModel.username = '';
            this.$scope.quickModel.password = '';
            this.$scope.quickModel.captcha = '';

            this.$scope.loginModel.username = '';
            this.$scope.loginModel.password = '';
            this.$scope.loginModel.captcha = '';

            this.$scope.changePasswordModel.oldpassword = '';
            this.$scope.changePasswordModel.newpassword = '';
            this.$scope.changePasswordModel.confirmpassword = '';

            this.$scope.registerModel.email = '';
            this.$scope.registerModel.mobile = '';
            this.$scope.registerModel.username = '';
            this.$scope.registerModel.password = '';
            this.$scope.registerModel.confirmpassword = '';
            this.$scope.registerModel.captcha = '';
            this.$scope.registerModel.code = '';

            this.$scope.verifyModel.mobile = '';
            this.$scope.verifyModel.otp = '';

            this.$scope.forgotModel.mobile = '';
            this.$scope.forgotModel.otp = '';
            this.$scope.forgotModel.otpid = '';
            this.$scope.forgotModel.newpassword = '';
            this.$scope.forgotModel.confirmpassword = '';
        }

        // ===== Sidebar & Header methods =====
        public sidebarOpen: boolean = false;
        public searchOpen: boolean = false;
        public activeSubmenu: string = '';
        public supportFlyoutOpen: boolean = false;
        public sportsFlyoutOpen: boolean = false;

        public toggleSidebar(): void {
            this.sidebarOpen = !this.sidebarOpen;
            if (!this.sidebarOpen) {
                this.activeSubmenu = '';
            }
        }

        public closeSidebar(): void {
            this.sidebarOpen = false;
            this.activeSubmenu = '';
        }

        public toggleSearch(): void {
            this.searchOpen = !this.searchOpen;
        }

        public toggleSubmenu(menu: string): void {
            this.activeSubmenu = this.activeSubmenu === menu ? '' : menu;
        }

        public openLoginModal(): void {
            this.openModal('login-modal');
        }

        public openSignupModal(): void {
            this.openModal('verify-modal');
        }

        public switchAuthTab(tab: string): void {
            this.$scope.authTab = tab;
            if (tab === 'login') {
                this.reloadCaptcha();
                this.remember(false);
            }
            if (tab === 'signup') {
                this.verification();
            }
        }

        public searchEvents(query: string): void {
            // Search handled by existing search logic if available
        }

        public toggleSupportFlyout($event?: any): void {
            if ($event && $event.stopPropagation) $event.stopPropagation();
            this.sportsFlyoutOpen = false;
            this.supportFlyoutOpen = !this.supportFlyoutOpen;
        }

        public toggleSportsFlyout($event?: any): void {
            if ($event && $event.stopPropagation) $event.stopPropagation();
            this.supportFlyoutOpen = false;
            this.sportsFlyoutOpen = !this.sportsFlyoutOpen;
        }

        public closeIconFlyouts(): void {
            this.supportFlyoutOpen = false;
            this.sportsFlyoutOpen = false;
        }

        public toggleTheme(): void {
            this.$scope.isLightTheme = !this.$scope.isLightTheme;
            if (this.$scope.isLightTheme) {
                jQuery('body').addClass('light-theme');
                this.localStorageHelper.set('theme_mode', 'light');
            } else {
                jQuery('body').removeClass('light-theme');
                this.localStorageHelper.set('theme_mode', 'dark');
            }
        }
        // ===== End Sidebar & Header methods =====

        private closeAllMOdal(overlayClick: boolean = false, event: any = null): void {
            if (!common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp)) {
                jQuery("body").removeClass('modal-open');
                jQuery("html").removeClass('html-scroll-off');
                this.clearModelObjects();
                jQuery('.bform-popup').each(function () {
                    jQuery(this).css('display', 'none');
                });
            }
            else if (this.settings.ThemeName == 'dimd2') {
                if (overlayClick) {
                    if (jQuery(event.target).closest('.no-close')[0] && !jQuery(event.target).hasClass('popup-close')) {
                        //return false;
                    } else {
                        this.$timeout(() => {
                            this.clearModelObjects();
                            jQuery('.modal-overlay').removeClass('disp');
                        }, 100);
                    }
                }
                else {
                    jQuery('.modal-overlay').removeClass('disp');
                    this.clearModelObjects();
                }
            }
            else {

                if (overlayClick) {
                    if (jQuery(event.target).closest('.no-close')[0] && !jQuery(event.target).hasClass('popup-close')) {
                        //return false;
                    } else {
                        this.$timeout(() => {
                            this.clearModelObjects();
                            jQuery('.modal-overlay').removeClass('disp');
                            jQuery('.inner-modal').removeClass('disp');
                        }, 100);
                    }
                }
                else {
                    jQuery('.modal-overlay').removeClass('disp');
                    jQuery('.inner-modal').removeClass('disp');
                    jQuery('.box-login').removeClass('disp');
                    this.clearModelObjects();
                }
            }
        }

        public openModal(modalId: any): void {
            // Map login-modal and verify-modal to combined auth-modal
            if (modalId === 'login-modal' || modalId === 'verify-modal') {
                this.$scope.authTab = (modalId === 'verify-modal') ? 'signup' : 'login';
                modalId = 'auth-modal';
            }

            if (this.settings.ThemeName == 'dimd2') {
                this.closeAllMOdal();
                jQuery('#' + modalId).addClass('disp');
            }
            else {
                this.closeAllMOdal();
                jQuery('#' + modalId).addClass('disp');
                jQuery('#' + modalId + " input:visible:first").focus();

                this.$timeout(() => {
                    jQuery('#' + modalId + ' .inner-modal').addClass('disp');
                }, 200);
            }

            if (this.$scope.authTab === 'login') { this.remember(false); }
            if (this.$scope.authTab === 'login' || modalId == 'register-modal' || modalId == 'demo-login-modal') {
                this.reloadCaptcha();
            }
            if (modalId == 'register-modal') {
                var verified_modal = this.localStorageHelper.get('verified-mobile');
                if (verified_modal && verified_modal.mobileNo) { this.$scope.registerModel.mobile = verified_modal.mobileNo; }
                if (this.$location.$$search.code) { this.$scope.registerModel.referralCode = this.$location.$$search.code; }
            }
            if (this.$scope.authTab === 'signup' || modalId == 'forget-modal') {
                if (this.$scope.authTab === 'signup') { this.verification(); }
                if (modalId == 'forget-modal') { this.startForgetPassword(); }
            }
        }

        public openCasinoGame(tableId: string): void {
            this.commonDataService.setGameId(tableId);
            this.localStorageHelper.set('pending_casino_game', tableId);
            this.openModal('login-modal');
        }

        public getCaptcha(refresh: boolean = true) {
            if (this.$scope.refreshCaptcha) { this.$timeout.cancel(this.$scope.refreshCaptcha); }
            this.userService.getCaptcha()
                .success((response: intranet.common.messaging.IResponse<any>) => {
                    if (response && response.success) {
                        this.$scope.captcha = response.data;
                    }
                }).finally(() => {
                    if (refresh) {
                        this.$scope.refreshCaptcha = this.$timeout(() => {
                            this.getCaptcha();
                        }, 120000);
                    }
                });
        }

        private addGoogleCaptcha(): void {
            this.vcRecaptchaService.create('captchaholder', {
                key: this.$scope.gCaptchKey,
                size: 'invisible'
            }).then((id: any) => { this.$scope.gWidgetId = id; });
        }

        private executeGcaptcha(id: any, recursive: boolean = false): void {
            if (!recursive) this.vcRecaptchaService.execute(id);

            var response = this.vcRecaptchaService.getResponse();
            if (!response) { this.$timeout(() => { this.executeGcaptcha(id, true); }, 1000); }
            else {
                this.$scope.gCaptchaPromise.resolve(response);
            }
        }

        private getCaptchaResponse(): ng.IHttpPromise<any> {
            if (this.$scope.gCaptchaPromise.promise.$$state.status != 0) { this.$scope.gCaptchaPromise = this.$q.defer(); }
            if (this.$scope.gWidgetId != undefined) {
                this.executeGcaptcha(this.$scope.gWidgetId);
            }
            else {
                this.$scope.gWidgetId = this.vcRecaptchaService.create('captchaholder', {
                    key: this.$scope.gCaptchKey,
                    size: 'invisible'
                }).then((id: any) => {
                    this.executeGcaptcha(id);
                });
            }
            return this.$q.when(this.$scope.gCaptchaPromise.promise);
        }

        private reloadCaptcha(): void {
            if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                this.getCaptcha();
            } else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                this.vcRecaptchaService.reload();
            }

        }

        private aiprediction() {
            this.toasterService.showToast(common.helpers.ToastType.Error, "Exciting news! Our Betting AI Prediction feature is almost ready, providing accurate real-time insights to optimize your betting strategies. Stay tuned for its release!", 5000);
        }

        // CHAT now
        private addChatSupport(): void {
            var self = this;
            var newScript = document.createElement("script");
            newScript.src = "https://static.zdassets.com/ekr/snippet.js?key=18fb4e23-226b-4d81-aa29-dbabb793585c";
            newScript.id = 'ze-snippet';
            newScript.onload = function () {
                zE(function () {
                    $zopim(function () {
                        $zopim.livechat.hideAll();
                        $zopim.livechat.window.onHide(self.hideChat);
                    });
                });
            }
            document.head.appendChild(newScript);
        }

        private hideChat(): void {
            $zopim.livechat.hideAll();
        }

        private chatNow(): void {
            $zopim.livechat.window.show();
        }


        // Login and Change password
        public quicklogin(): void {
            this.$scope.showLoading = true;
            if ((this.$scope.quickModel.overAge && this.settings.ThemeName == 'bking') || !this.$scope.quickModel.overAge) {
                //this.$scope.showLoading = true;
                var userToken = this.localStorageHelper.getUserTokenFromCookie();
                var model = {
                    key: '',
                    captcha: this.$scope.quickModel.captcha,
                    IMEI: userToken,
                    device: 'web',
                };
                if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                    model.key = this.$scope.captcha.key;
                    var res = this.baseAuthenticationService.authenticate(this.$scope.quickModel.username, this.$scope.quickModel.password, model.IMEI, model);
                    this.executeLogin(res);
                }
                else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                    this.getCaptchaResponse().then((data: any) => {
                        model.key = data;
                        var res = this.baseAuthenticationService.authenticate(this.$scope.quickModel.username, this.$scope.quickModel.password, model.IMEI, model);
                        this.executeLogin(res);
                    });
                }
            }
            else {
                this.$scope.quickModel.showAgeMsg = true;
            }
        }

        public login(): void {
            this.$scope.showLoading = true;
            if ((this.$scope.quickModel.overAge && this.settings.ThemeName == 'bking') || !this.$scope.quickModel.overAge) {
                //this.$scope.showLoading = true;
                var userToken = this.localStorageHelper.getUserTokenFromCookie();
                var model = {
                    key: '',
                    captcha: this.$scope.loginModel.captcha,
                    IMEI: userToken,
                    device: 'web',
                    mode: this.$scope.loginMethod,
                    mobile: this.$scope.loginModel.selectedCountry.dialCode
                };
                if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                    model.key = this.$scope.captcha.key;
                    var res = this.baseAuthenticationService.authenticate(this.$scope.loginModel.username, this.$scope.loginModel.password, model.IMEI, model);
                    this.executeLogin(res);
                }
                else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                    this.getCaptchaResponse().then((data: any) => {
                        model.key = data;
                        var res = this.baseAuthenticationService.authenticate(this.$scope.loginModel.username, this.$scope.loginModel.password, model.IMEI, model);
                        this.executeLogin(res);
                    });
                }
            }
            else {
                this.$scope.loginModel.showAgeMsg = true;
            }
        }

        public executeLogin(res: any): void {
            res.success((response: common.messaging.IResponse<any>, status, headers, config) => {
                if (this.$scope.loginMessages) this.$scope.loginMessages.splice(0);
                if (response && response.success && status == 200 && response.data) {
                    this.afterLogin(response.data);
                }
                else if (status == 401 || status == 403 || status == -1) {
                    this.openModal('login-modal');
                    this.$scope.showLoading = false;
                    this.$scope.loginMessages.push(new common.messaging.ResponseMessage(common.messaging.ResponseMessageType.Error, "Username or Password is wrong.", ''));
                } else {
                    this.$scope.showLoading = false;
                    this.openModal('login-modal');
                    this.$scope.loginMessages = response.messages;
                }
            }).error(() => { this.$scope.showLoading = false; });;
        }

        private remember(set: boolean = true): void {
            if (set) {
                var obj = { username: this.$scope.loginModel.username, password: this.$scope.loginModel.password, overAge: this.$scope.loginModel.overAge }
                this.localStorageHelper.set('remember_' + this.settings.WebApp, JSON.stringify(obj));
            }
            else {
                var stored = this.localStorageHelper.get('remember_' + this.settings.WebApp);
                if (stored) {
                    stored = JSON.parse(stored);
                    this.$scope.loginModel.username = stored.username;
                    this.$scope.loginModel.password = stored.password;
                    this.$scope.loginModel.overAge = stored.overAge;
                }
            }
        }

        private afterLogin(data: any): void {
            if (data) {
                // translate content by user's language
                var id = data.user.languageId.toString();
                this.$translate.use(id);

                if (data.user.changePasswordOnLogin == true) {
                    this.$scope.userId = data.user.id;
                    this.openModal('changepassword-modal');
                    this.$scope.showLoading = false;
                }
                else {
                    if (data.claims) {
                        if (this.$scope.loginModel.remember) { this.remember(); }
                        else { this.localStorageHelper.set('remember_' + this.settings.WebApp, ''); }
                        this.localStorageHelper.set('loginmethod_' + this.settings.WebApp, this.$scope.loginMethod);

                        this.authorizationService.loadClaims(data.claims, data.user.userType, data.parent ? data.parent.isOBD : false).then((claims: any) => {
                            //console.log(claims);
                            // set currency
                            if (data.currency) {
                                this.settings.CurrencyRate = data.currency.rate;
                                this.settings.CurrencyCode = data.currency.code;
                                this.settings.CurrencyFraction = data.currency.fractional;
                            }

                            //store user detail
                            this.localStorageHelper.set(this.settings.UserData, data);

                            // start web socket
                            this.WSSocketService.connetWs();
                            //this.WSFairTradeSocketService.connetWs();

                            if (data.user.userType == common.enums.UserType.SuperAdmin || data.user.userType == common.enums.UserType.Manager) {
                                this.$state.go('admin');
                            }
                            else if ((data.user.userType == common.enums.UserType.Admin ||
                                data.user.userType == common.enums.UserType.Master ||
                                data.user.userType == common.enums.UserType.SuperMaster ||
                                data.user.userType == common.enums.UserType.Agent ||
                                data.user.userType == common.enums.UserType.CP) &&
                                (this.settings.WebSiteIdealFor == 1 || this.settings.WebSiteIdealFor == 3)) {

                                var isCPUser = false;
                                // set parentid in self id while usertype CP
                                if (data.user.userType == common.enums.UserType.CP) {
                                    data.user.cpId = data.user.id;
                                    data.user.cpUserType = data.user.userType;
                                    data.user.id = data.parent.id;
                                    data.user.userType = data.parent.userType;
                                    this.localStorageHelper.set(this.settings.UserData, data);
                                    isCPUser = true;
                                }
                                if (isCPUser && data.user.userType == common.enums.UserType.Agent) {
                                    this.$state.go('master.offlinebanking', { tab: 0 });
                                } else {
                                    this.$state.go('master.dashboard');
                                }
                            }
                            else if (data.user.userType == common.enums.UserType.Operator) {
                                this.$state.go('operator.dashboard');
                            }
                            else if (data.user.userType == common.enums.UserType.BM || data.user.userType == common.enums.UserType.SBM) {
                                this.$state.go('book.base.feed');
                            }
                            else if (this.settings.WebSiteIdealFor <= 2
                                && (data.user.userType == common.enums.UserType.Player || data.user.userType == common.enums.UserType.Radar)) {



                                this.checkAgentBanners();

                                // Clear any pending-casino-game hints from the promo click path so
                                // they don't leak into the home session. Post-login always routes to
                                // the home page; users click the specific game from there (where
                                // MarketHighlightCtrl.openGame handles the direct-table launch).
                                this.localStorageHelper.set('pending_casino_game', '');
                                this.localStorageHelper.set('pending_casino_game_meta', '');
                                this.commonDataService.setGameId('');
                                this.commonDataService.setPendingGame(null);

                                // redirect to respective panel
                                if (this.isMobile.any) {
                                    if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                                        this.$state.go('mobile.seven.base.home');
                                    }
                                    else {
                                        this.$state.go('mobile.base.home');
                                    }
                                } else {
                                    this.$state.go('base.home');
                                }

                            } else {
                                this.commonDataService.logout(0, false);
                                this.$scope.loginMessages.push(new common.messaging.ResponseMessage(common.messaging.ResponseMessageType.Error, "Username/Password is wrong.", ''));
                            }

                        });
                    }
                    this.$scope.showLoading = false;
                }
            }
        }

        public changePassword(): void {
            if (this.validatePassword()) {
                this.$scope.showLoading = true;
                var model = {
                    currentPassword: this.$scope.changePasswordModel.oldpassword,
                    newPassword: this.$scope.changePasswordModel.newpassword,
                    userId: this.$scope.userId
                };
                this.userService.changePassword(model)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.getCaptcha();
                            this.openModal('login-modal');
                            this.toasterService.showMessages(response.messages, 3000);
                        } else {
                            this.$scope.changePasswordMessages = response.messages;
                        }
                    }).finally(() => { this.$scope.showLoading = false; });
            }
        }

        private validatePassword(): boolean {
            this.$scope.changePasswordMessages.splice(0);
            if (!this.commonDataService.validatePassword(this.$scope.changePasswordModel.newpassword)) {
                var msg: string = 'Password must be 6 character long, must contain alphabetics and numbers';
                this.$scope.changePasswordMessages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            else if (this.$scope.changePasswordModel.newpassword !== this.$scope.changePasswordModel.confirmpassword) {
                var msg: string = this.$filter('translate')('profile.password.confirm.invalid');
                this.$scope.changePasswordMessages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            return true;
        }

        private checkAgentBanners() {
            var count = 0;
            this.websiteService.getBannerCount(this.isMobile.any)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        count = response.data;
                        if (count > 0) {
                            var today = moment();
                            var promo = this.localStorageHelper.get('agent_banner_' + this.settings.WebApp);
                            var diff = promo && promo.date ? today.diff(promo.date, 'h') : 4;
                            if (diff >= 4 || !promo || promo.count != count) {
                                this.websiteService.getBanners(this.isMobile.any)
                                    .success((res: common.messaging.IResponse<any>) => {
                                        if (res.success && res.data) {
                                            this.commonDataService.ShowAgentBanners(res.data, count);
                                        }
                                    });
                            }
                        }
                        else if (this.$scope.currentWebApp == 'drpapaya' || this.$scope.currentWebApp == 'drpapayaio') {
                            var today = moment();
                            var promo = this.localStorageHelper.get('agent_banner_' + this.settings.WebApp);
                            var diff = promo && promo.date ? today.diff(promo.date, 'h') : 1;
                            if (diff >= 1) {
                                var bannerPaths = [{ imageContent: this.settings.ImagePath + 'images/' + this.settings.WebApp + '/banners/Banner01.jpg' }];
                                this.commonDataService.ShowAgentBanners(bannerPaths, 1);
                            }
                        }
                    }
                });
        }

        private startDemoLogin() {
            if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                this.openModal('demo-login-modal');
            }
            else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                this.demoLogin();
            }
        }

        private demoLogin() {
            this.$scope.showDemoLoading = true;
            var userToken = this.localStorageHelper.getUserTokenFromCookie();
            var model = {
                key: '',
                captcha: this.$scope.demoLoginModel.captcha,
                IMEI: userToken,
                device: 'web',
                mode: 2,
                mobile: ''
            };

            if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                model.key = this.$scope.captcha.key;
                var res = this.baseAuthenticationService.authenticate(this.$scope.supportDetail.demoUsername, this.$scope.supportDetail.demoPassword, model.IMEI, model);
                this.demoExecuteLogin(res);
            }
            else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                this.getCaptchaResponse().then((data: any) => {
                    model.key = data;
                    var res = this.baseAuthenticationService.authenticate(this.$scope.supportDetail.demoUsername, this.$scope.supportDetail.demoPassword, model.IMEI, model);
                    this.demoExecuteLogin(res);
                });
            }
        }

        public demoExecuteLogin(res: any): void {
            res.success((response: common.messaging.IResponse<any>, status, headers, config) => {
                if (this.$scope.loginMessages) this.$scope.loginMessages.splice(0);
                if (response && response.success && status == 200 && response.data) {
                    this.afterLogin(response.data);
                }
                else if (status == 401 || status == 403 || status == -1) {
                    if (this.$scope.captchaMode == common.enums.CaptchaMode.System) { this.openModal('demo-login-modal'); }
                    else { this.openModal('login-modal'); }
                    this.$scope.showDemoLoading = false;
                    this.$scope.loginMessages.push(new common.messaging.ResponseMessage(common.messaging.ResponseMessageType.Error, "Username or Password is wrong.", ''));
                } else {
                    this.$scope.showDemoLoading = false;
                    if (this.$scope.captchaMode == common.enums.CaptchaMode.System) { this.openModal('demo-login-modal'); }
                    else { this.openModal('login-modal'); }
                    this.$scope.loginMessages = response.messages;
                }
            }).error(() => { this.$scope.showDemoLoading = false; });;
        }

        // OTP verification
        private verification(): void {
            // otpvia = 1:sms, 2:whatsapp, 
            this.$scope.showLoading = false;

            // this.$scope.verifyModel.mobile = data.user.mobile;
            this.$scope.verifyModel.otpvia = '2';
            //this.$scope.changeMobileModel.oldMobileNo = data.user.mobile;

            //this.localStorageHelper.set('otp-timer', 10);
            var otpCounter = this.localStorageHelper.get('otp-timer');
            if (otpCounter > 0) { this.OTPcounter(otpCounter); }

            var otpid = this.localStorageHelper.get('otpid');
            if (otpid) { this.$scope.verifyModel.otpid = otpid; }
        }

        public confirmOpt(): void {
            this.$scope.showLoading = true;
            var res: ng.IHttpPromise<any>;
            res = this.userService.confirmOTP(this.$scope.verifyModel.otp, this.$scope.verifyModel.otpid);
            res.success((response: common.messaging.IResponse<any>, status, headers, config) => {
                if (this.$scope.verifyMessages) this.$scope.verifyMessages.splice(0);
                if (response && response.success && status == 200 && response.data) {
                    this.toasterService.showToast(common.helpers.ToastType.Info, "Successfully verified, Now complete user detail.");
                    this.$scope.verifyModel.mobileNo = this.$scope.verifyModel.selectedCountry.dialCode + '' + this.$scope.verifyModel.mobile;
                    this.localStorageHelper.set('verified-mobile', this.$scope.verifyModel);
                    this.openModal('register-modal');
                }
                else {
                    this.$scope.verifyMessages = response.messages;
                }
            }).finally(() => { this.$scope.showLoading = false; });
        }

        private requestNewOtp(): void {
            var model: any = {
                channel: this.$scope.verifyModel.otpvia,
                mobile: this.$scope.verifyModel.selectedCountry.dialCode + '' + this.$scope.verifyModel.mobile,
                dialCode: this.$scope.verifyModel.selectedCountry.dialCode,
                otpType: 1 // 1=register,2=forget
            }
            this.userService.requestOTP(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.verifyModel.otpid = response.data;
                        this.localStorageHelper.set('otpid', response.data);
                        this.OTPcounter(2 * 60);
                    }
                    this.toasterService.showMessages(response.messages);
                });
        }

        private OTPcounter(intval: any): void {
            var interval = intval;
            this.$timeout.cancel(this.$scope.timer_otp);

            var startdelay = (() => {
                if (interval > 0) {
                    interval = interval - 1;
                    this.$scope.timer_otp = this.$timeout(() => {
                        this.$scope.resendTimer = interval;
                        this.localStorageHelper.set('otp-timer', interval);
                        startdelay();
                    }, 1000);
                }
            });
            startdelay();
        }

        private formatTime(totalSeconds: any): any {
            var minutes: any = 0;
            var remainSeconds: any = 0;
            if (totalSeconds > 60) {
                minutes = math.floor(math.divide(totalSeconds, 60));
                remainSeconds = math.floor(math.mod(totalSeconds, 60));
            }
            else {
                remainSeconds = totalSeconds
            }
            if (minutes.toString().length === 1) { minutes = '0' + minutes; }
            if (remainSeconds.toString().length === 1) { remainSeconds = '0' + remainSeconds; }
            return minutes + ':' + remainSeconds;
        }

        private gotoDashboard(): void {
            // start web socket
            this.WSSocketService.connetWs();
            this.WSFairTradeSocketService.connetWs();

            if (this.isMobile.any) {
                if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                    this.$state.go('mobile.seven.base.home');
                }
                else {
                    this.$state.go('mobile.base.home');
                }
            } else {
                this.$state.go('base.home');
            }
        }

        // Registration
        public register(): void {
            var verified_modal = this.localStorageHelper.get('verified-mobile');

            if (this.validateNewUserPassword() && verified_modal.otpid) {
                this.$scope.showLoading = true;
                var userToken = this.localStorageHelper.getUserTokenFromCookie();
                var model: any = {
                    referralCode: this.$scope.registerModel.referralCode,
                    captcha: this.$scope.registerModel.captcha,
                    IMEI: userToken,
                    device: 'web',
                    username: this.$scope.registerModel.username,
                    password: this.$scope.registerModel.password,
                    email: this.$scope.registerModel.email,
                    mobile: verified_modal.mobileNo,
                    name: this.$scope.registerModel.username,
                    sid: verified_modal.otpid,
                    otp: verified_modal.otp,
                    utmSource: this.localStorageHelper.get('utm_source')
                };
                if (this.$scope.registerModel.offer && this.$scope.registerModel.offer.id) {
                    model.offerId = this.$scope.registerModel.offer.id;
                    model.bonusCode = this.$scope.registerModel.offer.bonusCode;
                }

                if (this.$scope.captchaMode == common.enums.CaptchaMode.System) {
                    model.key = this.$scope.captcha.key;
                    this.executeRegistration(model);
                }
                else if (this.$scope.captchaMode == common.enums.CaptchaMode.GoogleV2) {
                    this.vcRecaptchaService.reload();
                    this.getCaptchaResponse().then((data: any) => {
                        model.key = data;
                        this.executeRegistration(model);
                    });
                }
            }
        }

        private executeRegistration(model: any): void {
            var res: ng.IHttpPromise<any>;
            res = this.userService.register(model);
            res.success((response: common.messaging.IResponse<any>, status, headers, config) => {
                if (this.$scope.registerMessages) this.$scope.registerMessages.splice(0);
                if (response && response.success && status == 200 && response.data) {
                    this.toasterService.showToast(common.helpers.ToastType.Info, "Successfully registered.");
                    this.localStorageHelper.set('verified-mobile', {});
                    this.openModal('login-modal');
                }
                else {
                    this.$scope.registerMessages = response.messages;
                }
            }).finally(() => { this.$scope.showLoading = false; });
        }

        private validateNewUserPassword(): boolean {
            this.$scope.registerMessages.splice(0);
            if (!this.commonDataService.validatePassword(this.$scope.registerModel.password)) {
                var msg: string = 'Password must be 6 character long, must contain alphabetics and numbers';
                this.$scope.registerMessages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            else if (this.$scope.registerModel.password !== this.$scope.registerModel.confirmpassword) {
                var msg: string = "Password not matched with confirm password.";
                this.$scope.registerMessages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            return true;
        }

        private downloadAPK(): void {
            this.commonDataService.downloadClientAPK();
        }

        private selectOfferFromModal(obj: any) {
            var modal = new common.helpers.CreateModal();
            modal.header = this.settings.Title + ' Offers';
            modal.data = {
                forSelection: 4
            };
            modal.options.actionButton = '';
            modal.bodyUrl = this.settings.ThemeName + '/home/account/select-offer-modal.html';
            modal.controller = 'selectOfferModalCtrl';
            modal.size = 'lg';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults)
                .then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        obj.offer = result.data;
                        this.validateOffer(obj);
                    }
                });
        }

        private validateOffer(obj: any) {
            if (this.$scope.offerCheckTimeout) this.$timeout.cancel(this.$scope.offerCheckTimeout);
            obj.offerLoader = true;
            this.$scope.offerCheckTimeout = this.$timeout(() => {
                obj.offerMessages = [];
                var model = {
                    id: obj.offer.id,
                    bonusCode: obj.offer.bonusCode,
                };
                this.userService.validateRegisterOffer(model)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            obj.offer = response.data;
                            obj.offer.isValid = true;
                        } else {
                            obj.offer.id = undefined;
                            obj.offer.isValid = false;
                            obj.offerMessages = response.messages;
                        }

                    }).finally(() => { obj.offerLoader = false; });
            }, 1000);
        }

        private removeOffer(obj: any) {
            obj.offer = {}; obj.offerMessages = [];
        }

        //Forgot password
        private startForgetPassword(): void {
            this.$scope.showLoading = false;

            this.$scope.forgotModel.otpvia = '2';

            var otpCounter = this.localStorageHelper.get('forget_otp-timer');
            if (otpCounter > 0) { this.OTPcounterForget(otpCounter); }

            var otpid = this.localStorageHelper.get('forget_otpid');
            if (otpid) { this.$scope.forgotModel.otpid = otpid; }
        }

        private OTPcounterForget(intval: any): void {
            var interval = intval;
            this.$timeout.cancel(this.$scope.timer_otp);

            var startdelay = (() => {
                if (interval > 0) {
                    interval = interval - 1;
                    this.$scope.timer_otp = this.$timeout(() => {
                        this.$scope.resendTimer = interval;
                        this.localStorageHelper.set('forget_otp-timer', interval);
                        startdelay();
                    }, 1000);
                }
            });
            startdelay();
        }

        private requestOtpForForget(): void {
            var model: any = {
                channel: this.$scope.forgotModel.otpvia,
                mobile: this.$scope.forgotModel.selectedCountry.dialCode + '' + this.$scope.forgotModel.mobile,
                dialCode: this.$scope.forgotModel.selectedCountry.dialCode,
                otpType: 2 // 1=register,2=forget
            }
            this.userService.requestOTP(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.forgotModel.otpid = response.data;
                        this.localStorageHelper.set('forget_otpid', response.data);
                        this.OTPcounterForget(1 * 60);
                    }

                    this.toasterService.showMessages(response.messages);
                });
        }

        private forgotPassword(): void {
            if (this.validateForgotPassword()) {
                this.$scope.showLoading = true;
                var model: any = {
                    mobile: this.$scope.forgotModel.selectedCountry.dialCode + '' + this.$scope.forgotModel.mobile,
                    otp: this.$scope.forgotModel.otp,
                    otpId: this.$scope.forgotModel.otpid,
                    newPassword: this.$scope.forgotModel.newpassword
                };
                this.userService.resetPasswordByOtp(model).success((response: common.messaging.IResponse<any>, status, headers, config) => {
                    if (this.$scope.verifyMessages) this.$scope.forgotMessages.splice(0);
                    if (response && response.success && status == 200 && response.data) {
                        this.toasterService.showToast(common.helpers.ToastType.Info, "Successfully reset, Now login with new password.");
                        this.openModal('login-modal');
                    }
                    else {
                        this.$scope.forgotMessages = response.messages;
                    }
                }).finally(() => { this.$scope.showLoading = false; });
            }
        }

        private validateForgotPassword(): boolean {
            this.$scope.forgotMessages.splice(0);
            if (!this.commonDataService.validatePassword(this.$scope.forgotModel.newpassword)) {
                var msg: string = 'Password must be 6 character long, must contain alphabetics and numbers';
                this.$scope.forgotMessages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            else if (this.$scope.forgotModel.newpassword !== this.$scope.forgotModel.confirmpassword) {
                var msg: string = "Password not matched with confirm password.";
                this.$scope.forgotMessages.push(new common.messaging.ResponseMessage(
                    common.messaging.ResponseMessageType.Error,
                    msg, null));
                return false;
            }
            return true;
        }

        // Change mobile number
        private changeNumber(): void {
            this.$scope.showLoading = true;
            var res: ng.IHttpPromise<any>;
            var model = {
                oldMobileNo: this.$scope.changeMobileModel.oldMobileNo,
                newMobileNo: this.$scope.changeMobileModel.selectedCountry.dialCode + '' + this.$scope.changeMobileModel.newMobileNo
            }
            res = this.userService.changeMobileNo(model);
            res.success((response: common.messaging.IResponse<any>, status, headers, config) => {
                if (this.$scope.changeMobileMessages) this.$scope.changeMobileMessages.splice(0);
                if (response && response.success && response.data) {
                    this.toasterService.showToast(common.helpers.ToastType.Info, "Successfully changed.");
                    this.openModal('verify-modal');
                    var userdetail = this.localStorageHelper.get(this.settings.UserData);
                    userdetail.user.mobile = model.newMobileNo;
                }
                else {
                    this.$scope.changeMobileMessages = response.messages;
                }
            }).finally(() => { this.$scope.showLoading = false; });
        }

        private CancelChageNumber(): void {
            this.openModal('verify-modal');
            var userdetail = this.localStorageHelper.get(this.settings.UserData);
        }

        private openPrivacyPolicy(): void {
            var url = this.$state.href('privacypolicy');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private openCookiePolicy(): void {
            var url = this.$state.href('cookiepolicy');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private openTermsConditions(): void {
            var url = this.$state.href('termsconditions');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private openResponsibleGambling(): void {
            var url = this.$state.href('responsiblegambling');
            this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
        }

        private decideLogin() {
            this.openModal('login-modal');
        }

        private checkState(name: string): void {
            if (this.settings.ThemeName == 'sports') {
                if (name.indexOf('promo.publink') > -1) {
                    this.$scope.needsToHideRightSide = true;
                } else { this.$scope.needsToHideRightSide = false; }
            }
        }

        // bking
        private getSportsForBking() {
            this.$scope.sports = [];
            this.commonDataService.getSupportDetails()
                .then((sdata: any) => {
                    this.eventTypeService.getSports()
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success && response.data) {
                                angular.forEach(response.data, (d: any) => {
                                    if (d.displayOrder > 0 && sdata.eventTypeIds.some((x: any) => { return x == d.id; })) {
                                        this.$scope.sports.push(d);
                                    }
                                });
                                this.$scope.filteredSports = this.$scope.sports.filter((a: any) => { return a.id != this.settings.HorseRacingId && a.id != this.settings.GreyhoundId; });
                                this.$scope.filteredSports.forEach((a: any) => { a.checked = true; });
                            }
                        }).finally(() => {
                            this.getPopularMarkets(this.$scope.filteredSports);
                        });
                });
        }

        private setSwiper(): void {
            var newScript = document.createElement("script");
            newScript.src = "https://unpkg.com/swiper/swiper-bundle.min.js";
            document.head.appendChild(newScript);
            newScript.onload = function () {
                var mySwiper = new Swiper('.swiper-container', {
                    // Optional parameters
                    loop: true,
                    autoplay: true,
                    autoHeight: true,
                    // If we need pagination
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },

                    // Navigation arrows
                    //navigation: {
                    //    nextEl: '.swiper-button-next',
                    //    prevEl: '.swiper-button-prev',
                    //},

                    // And if we need scrollbar

                })
            }
        }

        private setSwiperForSports(): void {
            this.$timeout(() => {
                var mySwiper = new Swiper('#banners', {
                    loop: true,
                    speed: 1200,
                    autoplay: { delay: 4000, disableOnInteraction: false },
                    autoHeight: true,
                    pagination: { el: '.banner .swiper-pagination', clickable: true },
                    effect: 'slide',
                    direction: 'horizontal',
                    slidesPerView: 1,
                    grabCursor: true,
                })
                var mySwiper2 = new Swiper('#right-casino-box', {
                    // Optional parameters
                    loop: true,
                    autoplay: true,
                    autoHeight: true,
                })
                var mySwiper3 = new Swiper('#swiper5', {
                    // Optional parameters
                    slidesPerView: this.$scope.hasCasino ? 5 : 2,
                    spaceBetween: 5, freeMode: true,
                })
                var bigWinsSwiper = new Swiper('#bigWinsSwiper', {
                    slidesPerView: 'auto',
                    spaceBetween: 8,
                    freeMode: true,
                    grabCursor: true,
                    loop: true,
                    loopAdditionalSlides: 10,
                    autoplay: {
                        delay: 2000,
                        disableOnInteraction: false,
                    },
                })
                var mobileBigWinsSwiper = new Swiper('#mobileBigWinsSwiper', {
                    slidesPerView: 'auto',
                    spaceBetween: 10,
                    freeMode: true,
                    grabCursor: true,
                    loop: true,
                    loopAdditionalSlides: 10,
                    autoplay: {
                        delay: 2000,
                        disableOnInteraction: false,
                    },
                })
                var originalGamesConfig = {
                    slidesPerView: 'auto',
                    spaceBetween: 10,
                    freeMode: true,
                    grabCursor: true,
                    loop: false,
                };
                var origSwiper = new Swiper('#originalGamesSwiper', originalGamesConfig);
                new Swiper('#mobileOriginalGamesSwiper', originalGamesConfig);
                var auraSwiper = new Swiper('#auraGamesSwiper', originalGamesConfig);
                new Swiper('#mobileAuraGamesSwiper', originalGamesConfig);
                var vimplaySwiper = new Swiper('#vimplayGamesSwiper', originalGamesConfig);
                new Swiper('#mobileVimplayGamesSwiper', originalGamesConfig);
                this.$scope.originalGamesSwiper = origSwiper;
                this.$scope.auraGamesSwiper = auraSwiper;
                this.$scope.vimplayGamesSwiper = vimplaySwiper;

                var scrollSwiper = (s: any, direction: number) => {
                    if (!s) return;
                    var slideW = s.slides && s.slides[0] ? s.slides[0].offsetWidth + (s.params.spaceBetween || 0) : 200;
                    var containerW = s.el ? s.el.offsetWidth : 800;
                    var scrollBy = Math.max(slideW, Math.floor(containerW * 0.8 / slideW) * slideW);
                    var currentTranslate = s.translate || 0;
                    var maxTranslate = s.maxTranslate ? s.maxTranslate() : 0;
                    var minTranslate = s.minTranslate ? s.minTranslate() : 0;
                    var newTranslate = currentTranslate + (direction * -1 * scrollBy);
                    if (newTranslate > minTranslate) newTranslate = minTranslate;
                    if (newTranslate < maxTranslate) newTranslate = maxTranslate;
                    s.setTransition(400);
                    s.setTranslate(newTranslate);
                    if (s.updateActiveIndex) s.updateActiveIndex();
                    if (s.updateSlidesClasses) s.updateSlidesClasses();
                };

                var bindNav = (swiperInstance: any, section: string) => {
                    var sel = '.' + section + ' .ogs-nav-btn';
                    var btns: any = document.querySelectorAll(sel);
                    if (btns.length === 0) {
                        // Fallback for non-class sections (e.g., Fairbet)
                        if (section === 'original-games-section') {
                            btns = document.querySelectorAll('.original-games-section:not(.aura-games-section):not(.vimplay-games-section) .ogs-nav-btn');
                        }
                    }
                    for (var i = 0; i < btns.length; i++) {
                        (function (btn: any) {
                            var isPrev = btn.classList.contains('ogs-nav-prev');
                            btn.onclick = function (ev: any) {
                                ev.preventDefault();
                                scrollSwiper(swiperInstance, isPrev ? -1 : 1);
                            };
                        })(btns[i]);
                    }
                };
                bindNav(origSwiper, 'original-games-section');
                bindNav(auraSwiper, 'aura-games-section');
                bindNav(vimplaySwiper, 'vimplay-games-section');

                this.$scope.swiperPrev = (key: string) => scrollSwiper((this.$scope as any)[key], -1);
                this.$scope.swiperNext = (key: string) => scrollSwiper((this.$scope as any)[key], 1);
            }, 100);
        }


        // for sky
        private getSports() {
            this.$scope.isRequestProcessing = true;
            this.$scope.sports = [];
            this.eventTypeService.getSports()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.sports = response.data.filter((a: any) => { return a.displayOrder > 0 });
                        this.getPopularMarkets(this.$scope.sports);
                    }
                }).finally(() => {

                    if (this.$scope.sports.length > 0 && this.settings.ThemeName == 'sky' && !this.isMobile.any) {
                        this.activateSkySlider(4000);
                    }
                });
        }

        private getRaces() {
            this.$scope.races = [];
            this.marketOddsService.getRaces()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.races = response.data;
                    }
                }).finally(() => {
                    this.$scope.races.forEach((m: any) => {
                        m.eventTypeId = this.settings.HorseRacingId;
                        m.eventTypeName = this.$scope.sports.filter((x: any) => { return x.id == m.eventTypeId; })[0].name;
                        m.countryCode = m.event.countryCode
                    });
                });
        }

        private getRacesGroup(eventTypeId: any) {
            this.$scope.isRequestProcessing = true;
            this.$scope.races = [];
            this.marketOddsService.getRacesForPromo(eventTypeId, 0)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.races = response.data;
                    }
                }).finally(() => {
                    this.$timeout(() => { this.$scope.isRequestProcessing = false; }, 700);
                    this.$scope.races.forEach((m: any) => {
                        m.eventTypeId = eventTypeId;
                        m.eventTypeName = this.$scope.sports.filter((x: any) => { return x.id == m.eventTypeId; })[0].name;
                        m.countryCode = m.event.countryCode;
                    });
                });
        }

        private getPopularMarkets(sports: any[]) {
            this.$scope.popularMarkets = [];
            var ids = sports.map((x: any) => { return x.id });
            this.marketOddsService.getSports(30, ids)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.popularMarkets = response.data;
                    }
                }).finally(() => {

                    if (this.settings.ThemeName == 'sports' || this.settings.ThemeName == 'dimd2' || this.settings.ThemeName == 'sky') {
                        this.countEvents();
                    }

                    this.$scope.popularMarkets.forEach((m: any) => {
                        if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                        if (m.marketRunner.length > 2) {
                            this.$scope.hasAnyDrawMarket = true;
                            m.hasAnyDrawMarket = true;
                        }
                        m.eventTypeId = m.event.eventType.id;
                        m.eventTypeName = m.event.eventType.name;
                        m.hasVideo = m.event.videoId ? true : false;
                        m.hasFancy = m.event.hasFancy ? true : false;
                    });

                    this.$scope.isRequestProcessing = false;
                    this.setOdds();

                    if (this.settings.ThemeName == 'dimd2') { this.setEventTypeSource(this.$scope.popularMarkets); }
                });
        }

        private setEventTypeSource(lst: any[]) {
            angular.forEach(lst, (l) => {
                var ff = this.$scope.sports.filter((e: any) => { return e.id == l.eventTypeId }) || [];
                if (ff.length > 0) {
                    l.eventTypeSourceId = ff[0].sourceId;
                }
            });
        }

        private countEvents() {
            angular.forEach(this.$scope.sports, (s: any) => {
                angular.forEach(this.$scope.popularMarkets, (p: any) => {
                    if (s.id == p.event.eventType.id) {
                        var event = { id: p.eventId, name: p.event.name };

                        if (!s.competitions) {
                            s.competitions = [];
                            s.competitions.push({ name: p.event.competitionName, id: p.event.competitionId, events: [event] });
                        }
                        else {
                            var cIndex = common.helpers.Utility.IndexOfObject(s.competitions, 'id', p.event.competitionId);
                            if (cIndex > -1) {
                                s.competitions[cIndex].events.push(event);
                            } else {
                                s.competitions.push({ name: p.event.competitionName, id: p.event.competitionId, events: [event] });
                            }
                        }
                    }
                });
            });
        }

        private getOddsJson() {
            this.marketOddsService.getOddsJson()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.odds = response.data;
                    }
                }).finally(() => { this.setOdds(); });
        }

        private setOdds() {
            this.$scope.odds.forEach((data: any) => {
                this.$scope.popularMarkets.forEach((f: any) => {
                    if (f.id == data.id) {
                        this.setOddsInMarket(f, data);
                    }
                });
            });
        }

        public subscribeOdds() { }

        private getOffers() {
            this.offerService.getOfferList()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.$scope.offerList = response.data; }
                }).finally(() => {
                    if (this.settings.ThemeName == 'sky' && this.isMobile.any && this.$scope.offerList.length > 0) {
                        this.activateSkySlider();
                    }
                });
        }

        private activateSkySlider(speed = 7000) {
            this.$timeout(() => {
                jQuery('.slider').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    speed: 2000,
                    autoplaySpeed: speed,
                    lazyLoad: 'progressive',
                    arrows: false,
                }).slickAnimation();
            }, 500);
        }

        private sendLogin() {
            this.$rootScope.$broadcast('open-login-modal');
        }

        private sendSignup() {
            this.$rootScope.$broadcast('open-register-modal');
        }

        private openOfferModal() {
            var modal = new common.helpers.CreateModal();
            modal.header = this.settings.Title + ' Offers';
            modal.data = {
                forSelection: 3
            };
            modal.options.actionButton = '';
            modal.bodyUrl = this.settings.ThemeName + '/home/account/select-offer-modal.html';
            modal.controller = 'selectOfferModalCtrl';
            modal.size = 'lg';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private copytext(txt: any) {
            this.commonDataService.copyText(txt);
        }

        // lotus special
        private registerScrollEvent(): void {
            //jQuery(document).ready(() => {
            jQuery('.markets-odd').each(function (i: any, d: any) {
                jQuery(d).on('mousedown', function (event: any) {
                    jQuery('.markets-odd').each(function (index: any, el: any) {
                        jQuery(el).attr('user', 1)
                    });
                });
            });
            jQuery('.markets-odd').each(function (i: any, d: any) {
                jQuery(d).on('touchstart', function (event: any) {
                    jQuery('.markets-odd').each(function (index: any, el: any) {
                        jQuery(el).attr('user', 1)
                    });
                });
            });

            jQuery('.markets-odd').attr('sleft', 1);
            jQuery('.markets-odd').on('scroll', function (e: any) {
                scrollSame(this.scrollLeft);
                setTimeout(function () { scrollAll(); }, 500);
            });
            var scrollSame = ((svalue: any) => {
                jQuery('.markets-odd').each(function (index: any, div: any) {
                    jQuery(div).scrollLeft(svalue);
                });
            });
            var scrollAll = (() => {
                jQuery('.markets-odd').each(function (index: any, div: any) {
                    var oldcount: any = jQuery(div).attr('sleft');
                    var isuser: any = jQuery(div).attr('user');
                    if (isuser == 1) {
                        if (oldcount % 2 == 0) {
                            jQuery(div).animate({ scrollLeft: '-=500' }, 1000, 'swing');
                            jQuery(div).attr('sleft', 1);
                            jQuery(div).attr('user', 0);
                        } else {
                            jQuery(div).animate({ scrollLeft: '+=500' }, 1000, 'swing');
                            jQuery(div).attr('sleft', 2);
                            jQuery(div).attr('user', 0);
                        }
                    }
                });
            });
            // });
        }

        private openMenu(e: any, isLeft: boolean): void {
            e.stopPropagation();
            if (this.$scope.anyMenuOpen) {
                this.centerClick(e);
            }
            else {
                if (isLeft) { this.$scope.leftMenuOpen = true; }
                this.$scope.anyMenuOpen = true;
            }
        }

        private centerClick(e: any): void {
            e.stopPropagation();
            if (this.$scope.leftMenuOpen) {
                this.$scope.anyMenuOpen = false;
                this.$scope.leftMenuOpen = false;
            }
        }

    }
    angular.module('intranet.home').controller('promoCtrl', PromoCtrl);
}