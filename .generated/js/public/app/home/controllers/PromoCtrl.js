var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class PromoCtrl extends intranet.common.BetControllerBase {
            constructor($scope, baseAuthenticationService, userService, authorizationService, $timeout, toasterService, localStorageHelper, commonDataService, $location, $translate, $filter, $rootScope, $sce, $q, $window, $interval, $stateParams, WSSocketService, WSFairTradeSocketService, vcRecaptchaService, modalService, isMobile, settings, marketOddsService, settingService, eventTypeService, websiteService, offerService, $state) {
                super($scope);
                this.baseAuthenticationService = baseAuthenticationService;
                this.userService = userService;
                this.authorizationService = authorizationService;
                this.$timeout = $timeout;
                this.toasterService = toasterService;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.$location = $location;
                this.$translate = $translate;
                this.$filter = $filter;
                this.$rootScope = $rootScope;
                this.$sce = $sce;
                this.$q = $q;
                this.$window = $window;
                this.$interval = $interval;
                this.$stateParams = $stateParams;
                this.WSSocketService = WSSocketService;
                this.WSFairTradeSocketService = WSFairTradeSocketService;
                this.vcRecaptchaService = vcRecaptchaService;
                this.modalService = modalService;
                this.isMobile = isMobile;
                this.settings = settings;
                this.marketOddsService = marketOddsService;
                this.settingService = settingService;
                this.eventTypeService = eventTypeService;
                this.websiteService = websiteService;
                this.offerService = offerService;
                this.$state = $state;
                this.sidebarOpen = false;
                this.searchOpen = false;
                this.activeSubmenu = '';
                this.$rootScope.viewPort = "width=device-width, initial-scale=1.0,maximum-scale=1";
                this.$scope.gCaptchaPromise = this.$q.defer();
                jQuery('body').removeClass('mbg');
                jQuery('body').addClass('cbg');
                jQuery('body').addClass('promo-body');
                if (this.isMobile.any) {
                    jQuery('body').addClass('mobile-bg');
                }
                if (this.settings.ThemeName == 'dimd2') {
                    jQuery('body').addClass('login-home');
                }
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
                    if (this.settings.ThemeName == 'dimd2') {
                        this.loadDimd2Sliders();
                    }
                    if (this.settings.ThemeName == 'sports') {
                        this.checkState(toState.name);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    if (currenttime) {
                        this.$interval.cancel(currenttime);
                    }
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
            initScopeValues() {
                var haveUserData = this.commonDataService.getLoggedInUserData();
                if (haveUserData) {
                    this.commonDataService.logout();
                }
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
                this.$scope.timezone = intranet.common.helpers.CommonHelper.getTimeZone();
                this.$scope.selectedTimezone = this.$scope.timezone;
            }
            loadInitialData() {
                if (this.$location.$$search.utm_source) {
                    this.localStorageHelper.set('utm_source', this.$location.$$search.utm_source);
                }
                if (this.settings.ThemeName == 'betfair' || this.settings.ThemeName == 'sky') {
                    if (this.$stateParams.msg && this.$stateParams.msg == 'r') {
                        this.$state.go(this.$state.current.name, { msg: '' });
                    }
                    else {
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
                    if (this.settings.WebApp == 'electionexch') {
                        this.$scope.bannerPath = this.settings.ImagePath + 'images/cover-image/plitics.jpg';
                    }
                }
                else if (this.settings.ThemeName == 'lotus') {
                    if (this.$stateParams.msg && this.$stateParams.msg == 'r') {
                        this.$state.go(this.$state.current.name, { msg: '' });
                    }
                    else {
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
                        if (this.isMobile.any) {
                            this.registerScrollEvent();
                        }
                    }, 1000);
                }
                else if (this.settings.ThemeName == 'sports') {
                    if (this.$stateParams.msg && this.$stateParams.msg == 'r') {
                        this.$state.go(this.$state.current.name, { msg: '' });
                    }
                    else {
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
                        if (scroll < 0) {
                            scroll = 0;
                        }
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
                    }
                    else {
                        this.openModal('login-modal');
                    }
                    this.$translate.use('5d78a18f8646534c986671fd');
                    this.$scope.hasAPK = this.settings.HasAPK;
                }
                else {
                    this.$scope.selectedEventTypeName = '!alleventypes';
                    if (this.isMobile.any) {
                        document.body.style.position = "unset";
                    }
                    if (intranet.common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp)) {
                        if (this.settings.WebApp == 'booster99') {
                            this.commonDataService.addGaminIcon();
                        }
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
            loadDimd2Sliders() {
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
            loadCountries() {
                this.settingService.getCountryList()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.countryList = response.data;
                        var selectedCountry = this.$scope.countryList[0];
                        var selectedList = this.$scope.countryList.filter((c) => { return c.isSelected; }) || [];
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
            countryChanged(model) {
                model.otpvia = 2;
            }
            startBkingSlick() {
                this.$timeout(() => {
                    jQuery('.my-slick-wrapper').slick({
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 2000,
                        arrows: false,
                        infinite: true,
                        variableWidth: false
                    });
                }, 1000);
            }
            timezoneChanged(value) {
                this.$scope.selectedTimezone = value;
                this.$rootScope.timezone = value.replace(':', '');
            }
            isActive(path) {
                return (this.$location.$$url == path) ? true : false;
            }
            loadWebsiteDetail() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        this.$scope.captchaMode = data.captchaMode;
                        this.$scope.isRegisterEnabled = data.isRegisterEnabled;
                        this.$scope.hasCasino = data.hasCasino;
                        var lastLoginMethod = this.localStorageHelper.get('loginmethod_' + this.settings.WebApp);
                        if (this.settings.WebApp == 'sportsbar11') {
                            this.$scope.loginMethod = 2;
                        }
                        else if (lastLoginMethod > 0) {
                            this.$scope.loginMethod = lastLoginMethod;
                        }
                        else if (!data.isRegisterEnabled) {
                            this.$scope.loginMethod = 2;
                        }
                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                            this.$scope.gCaptchKey = this.$scope.supportDetail.recaptchaSiteKey;
                            if (this.$scope.supportDetail.chat == true) {
                                this.addChatSupport();
                            }
                        }
                        if (data.hasCasino) {
                            this.$scope.liveGamesMarkets = intranet.common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
                        }
                    }
                }).finally(() => {
                    if (this.settings.ThemeName == 'sports') {
                        this.setSwiperForSports();
                    }
                    if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                        this.getCaptcha();
                    }
                    else if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.GoogleV2) {
                        this.addGoogleCaptcha();
                    }
                });
            }
            clearModelObjects() {
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
            toggleSidebar() {
                this.sidebarOpen = !this.sidebarOpen;
                if (!this.sidebarOpen) {
                    this.activeSubmenu = '';
                }
            }
            closeSidebar() {
                this.sidebarOpen = false;
                this.activeSubmenu = '';
            }
            toggleSearch() {
                this.searchOpen = !this.searchOpen;
            }
            toggleSubmenu(menu) {
                this.activeSubmenu = this.activeSubmenu === menu ? '' : menu;
            }
            openLoginModal() {
                this.openModal('login-modal');
            }
            openSignupModal() {
                this.openModal('verify-modal');
            }
            searchEvents(query) {
            }
            closeAllMOdal(overlayClick = false, event = null) {
                if (!intranet.common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp)) {
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
                        }
                        else {
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
                        }
                        else {
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
            openModal(modalId) {
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
                if (modalId == 'login-modal') {
                    this.remember(false);
                }
                if (modalId == 'login-modal' || modalId == 'register-modal' || modalId == 'demo-login-modal') {
                    this.reloadCaptcha();
                }
                if (modalId == 'register-modal') {
                    var verified_modal = this.localStorageHelper.get('verified-mobile');
                    if (verified_modal && verified_modal.mobileNo) {
                        this.$scope.registerModel.mobile = verified_modal.mobileNo;
                    }
                    if (this.$location.$$search.code) {
                        this.$scope.registerModel.referralCode = this.$location.$$search.code;
                    }
                }
                if (modalId == 'verify-modal' || modalId == 'login-modal' || modalId == 'forget-modal') {
                    if (modalId == 'verify-modal') {
                        this.verification();
                    }
                    if (modalId == 'forget-modal') {
                        this.startForgetPassword();
                    }
                }
            }
            getCaptcha(refresh = true) {
                if (this.$scope.refreshCaptcha) {
                    this.$timeout.cancel(this.$scope.refreshCaptcha);
                }
                this.userService.getCaptcha()
                    .success((response) => {
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
            addGoogleCaptcha() {
                this.vcRecaptchaService.create('captchaholder', {
                    key: this.$scope.gCaptchKey,
                    size: 'invisible'
                }).then((id) => { this.$scope.gWidgetId = id; });
            }
            executeGcaptcha(id, recursive = false) {
                if (!recursive)
                    this.vcRecaptchaService.execute(id);
                var response = this.vcRecaptchaService.getResponse();
                if (!response) {
                    this.$timeout(() => { this.executeGcaptcha(id, true); }, 1000);
                }
                else {
                    this.$scope.gCaptchaPromise.resolve(response);
                }
            }
            getCaptchaResponse() {
                if (this.$scope.gCaptchaPromise.promise.$$state.status != 0) {
                    this.$scope.gCaptchaPromise = this.$q.defer();
                }
                if (this.$scope.gWidgetId != undefined) {
                    this.executeGcaptcha(this.$scope.gWidgetId);
                }
                else {
                    this.$scope.gWidgetId = this.vcRecaptchaService.create('captchaholder', {
                        key: this.$scope.gCaptchKey,
                        size: 'invisible'
                    }).then((id) => {
                        this.executeGcaptcha(id);
                    });
                }
                return this.$q.when(this.$scope.gCaptchaPromise.promise);
            }
            reloadCaptcha() {
                if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                    this.getCaptcha();
                }
                else if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.GoogleV2) {
                    this.vcRecaptchaService.reload();
                }
            }
            aiprediction() {
                this.toasterService.showToast(intranet.common.helpers.ToastType.Error, "Exciting news! Our Betting AI Prediction feature is almost ready, providing accurate real-time insights to optimize your betting strategies. Stay tuned for its release!", 5000);
            }
            addChatSupport() {
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
                };
                document.head.appendChild(newScript);
            }
            hideChat() {
                $zopim.livechat.hideAll();
            }
            chatNow() {
                $zopim.livechat.window.show();
            }
            quicklogin() {
                this.$scope.showLoading = true;
                if ((this.$scope.quickModel.overAge && this.settings.ThemeName == 'bking') || !this.$scope.quickModel.overAge) {
                    var userToken = this.localStorageHelper.getUserTokenFromCookie();
                    var model = {
                        key: '',
                        captcha: this.$scope.quickModel.captcha,
                        IMEI: userToken,
                        device: 'web',
                    };
                    if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                        model.key = this.$scope.captcha.key;
                        var res = this.baseAuthenticationService.authenticate(this.$scope.quickModel.username, this.$scope.quickModel.password, model.IMEI, model);
                        this.executeLogin(res);
                    }
                    else if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.GoogleV2) {
                        this.getCaptchaResponse().then((data) => {
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
            login() {
                this.$scope.showLoading = true;
                if ((this.$scope.quickModel.overAge && this.settings.ThemeName == 'bking') || !this.$scope.quickModel.overAge) {
                    var userToken = this.localStorageHelper.getUserTokenFromCookie();
                    var model = {
                        key: '',
                        captcha: this.$scope.loginModel.captcha,
                        IMEI: userToken,
                        device: 'web',
                        mode: this.$scope.loginMethod,
                        mobile: this.$scope.loginModel.selectedCountry.dialCode
                    };
                    if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                        model.key = this.$scope.captcha.key;
                        var res = this.baseAuthenticationService.authenticate(this.$scope.loginModel.username, this.$scope.loginModel.password, model.IMEI, model);
                        this.executeLogin(res);
                    }
                    else if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.GoogleV2) {
                        this.getCaptchaResponse().then((data) => {
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
            executeLogin(res) {
                res.success((response, status, headers, config) => {
                    if (this.$scope.loginMessages)
                        this.$scope.loginMessages.splice(0);
                    if (response && response.success && status == 200 && response.data) {
                        this.afterLogin(response.data);
                    }
                    else if (status == 401 || status == 403 || status == -1) {
                        this.openModal('login-modal');
                        this.$scope.showLoading = false;
                        this.$scope.loginMessages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, "Username or Password is wrong.", ''));
                    }
                    else {
                        this.$scope.showLoading = false;
                        this.openModal('login-modal');
                        this.$scope.loginMessages = response.messages;
                    }
                }).error(() => { this.$scope.showLoading = false; });
                ;
            }
            remember(set = true) {
                if (set) {
                    var obj = { username: this.$scope.loginModel.username, password: this.$scope.loginModel.password, overAge: this.$scope.loginModel.overAge };
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
            afterLogin(data) {
                if (data) {
                    var id = data.user.languageId.toString();
                    this.$translate.use(id);
                    if (data.user.changePasswordOnLogin == true) {
                        this.$scope.userId = data.user.id;
                        this.openModal('changepassword-modal');
                        this.$scope.showLoading = false;
                    }
                    else {
                        if (data.claims) {
                            if (this.$scope.loginModel.remember) {
                                this.remember();
                            }
                            else {
                                this.localStorageHelper.set('remember_' + this.settings.WebApp, '');
                            }
                            this.localStorageHelper.set('loginmethod_' + this.settings.WebApp, this.$scope.loginMethod);
                            this.authorizationService.loadClaims(data.claims, data.user.userType, data.parent ? data.parent.isOBD : false).then((claims) => {
                                if (data.currency) {
                                    this.settings.CurrencyRate = data.currency.rate;
                                    this.settings.CurrencyCode = data.currency.code;
                                    this.settings.CurrencyFraction = data.currency.fractional;
                                }
                                this.localStorageHelper.set(this.settings.UserData, data);
                                this.WSSocketService.connetWs();
                                if (data.user.userType == intranet.common.enums.UserType.SuperAdmin || data.user.userType == intranet.common.enums.UserType.Manager) {
                                    this.$state.go('admin');
                                }
                                else if ((data.user.userType == intranet.common.enums.UserType.Admin ||
                                    data.user.userType == intranet.common.enums.UserType.Master ||
                                    data.user.userType == intranet.common.enums.UserType.SuperMaster ||
                                    data.user.userType == intranet.common.enums.UserType.Agent ||
                                    data.user.userType == intranet.common.enums.UserType.CP) &&
                                    (this.settings.WebSiteIdealFor == 1 || this.settings.WebSiteIdealFor == 3)) {
                                    var isCPUser = false;
                                    if (data.user.userType == intranet.common.enums.UserType.CP) {
                                        data.user.cpId = data.user.id;
                                        data.user.cpUserType = data.user.userType;
                                        data.user.id = data.parent.id;
                                        data.user.userType = data.parent.userType;
                                        this.localStorageHelper.set(this.settings.UserData, data);
                                        isCPUser = true;
                                    }
                                    if (isCPUser && data.user.userType == intranet.common.enums.UserType.Agent) {
                                        this.$state.go('master.offlinebanking', { tab: 0 });
                                    }
                                    else {
                                        this.$state.go('master.dashboard');
                                    }
                                }
                                else if (data.user.userType == intranet.common.enums.UserType.Operator) {
                                    this.$state.go('operator.dashboard');
                                }
                                else if (data.user.userType == intranet.common.enums.UserType.BM || data.user.userType == intranet.common.enums.UserType.SBM) {
                                    this.$state.go('book.base.feed');
                                }
                                else if (this.settings.WebSiteIdealFor <= 2
                                    && (data.user.userType == intranet.common.enums.UserType.Player || data.user.userType == intranet.common.enums.UserType.Radar)) {
                                    this.checkAgentBanners();
                                    if (this.isMobile.any) {
                                        if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                                            this.$state.go('mobile.seven.base.home');
                                        }
                                        else {
                                            this.$state.go('mobile.base.home');
                                        }
                                    }
                                    else {
                                        this.$state.go('base.home');
                                    }
                                }
                                else {
                                    this.commonDataService.logout(0, false);
                                    this.$scope.loginMessages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, "Username/Password is wrong.", ''));
                                }
                            });
                        }
                        this.$scope.showLoading = false;
                    }
                }
            }
            changePassword() {
                if (this.validatePassword()) {
                    this.$scope.showLoading = true;
                    var model = {
                        currentPassword: this.$scope.changePasswordModel.oldpassword,
                        newPassword: this.$scope.changePasswordModel.newpassword,
                        userId: this.$scope.userId
                    };
                    this.userService.changePassword(model)
                        .success((response) => {
                        if (response.success) {
                            this.getCaptcha();
                            this.openModal('login-modal');
                            this.toasterService.showMessages(response.messages, 3000);
                        }
                        else {
                            this.$scope.changePasswordMessages = response.messages;
                        }
                    }).finally(() => { this.$scope.showLoading = false; });
                }
            }
            validatePassword() {
                this.$scope.changePasswordMessages.splice(0);
                if (!this.commonDataService.validatePassword(this.$scope.changePasswordModel.newpassword)) {
                    var msg = 'Password must be 6 character long, must contain alphabetics and numbers';
                    this.$scope.changePasswordMessages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                else if (this.$scope.changePasswordModel.newpassword !== this.$scope.changePasswordModel.confirmpassword) {
                    var msg = this.$filter('translate')('profile.password.confirm.invalid');
                    this.$scope.changePasswordMessages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                return true;
            }
            checkAgentBanners() {
                var count = 0;
                this.websiteService.getBannerCount(this.isMobile.any)
                    .success((response) => {
                    if (response.success) {
                        count = response.data;
                        if (count > 0) {
                            var today = moment();
                            var promo = this.localStorageHelper.get('agent_banner_' + this.settings.WebApp);
                            var diff = promo && promo.date ? today.diff(promo.date, 'h') : 4;
                            if (diff >= 4 || !promo || promo.count != count) {
                                this.websiteService.getBanners(this.isMobile.any)
                                    .success((res) => {
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
            startDemoLogin() {
                if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                    this.openModal('demo-login-modal');
                }
                else if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.GoogleV2) {
                    this.demoLogin();
                }
            }
            demoLogin() {
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
                if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                    model.key = this.$scope.captcha.key;
                    var res = this.baseAuthenticationService.authenticate(this.$scope.supportDetail.demoUsername, this.$scope.supportDetail.demoPassword, model.IMEI, model);
                    this.demoExecuteLogin(res);
                }
                else if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.GoogleV2) {
                    this.getCaptchaResponse().then((data) => {
                        model.key = data;
                        var res = this.baseAuthenticationService.authenticate(this.$scope.supportDetail.demoUsername, this.$scope.supportDetail.demoPassword, model.IMEI, model);
                        this.demoExecuteLogin(res);
                    });
                }
            }
            demoExecuteLogin(res) {
                res.success((response, status, headers, config) => {
                    if (this.$scope.loginMessages)
                        this.$scope.loginMessages.splice(0);
                    if (response && response.success && status == 200 && response.data) {
                        this.afterLogin(response.data);
                    }
                    else if (status == 401 || status == 403 || status == -1) {
                        if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                            this.openModal('demo-login-modal');
                        }
                        else {
                            this.openModal('login-modal');
                        }
                        this.$scope.showDemoLoading = false;
                        this.$scope.loginMessages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, "Username or Password is wrong.", ''));
                    }
                    else {
                        this.$scope.showDemoLoading = false;
                        if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                            this.openModal('demo-login-modal');
                        }
                        else {
                            this.openModal('login-modal');
                        }
                        this.$scope.loginMessages = response.messages;
                    }
                }).error(() => { this.$scope.showDemoLoading = false; });
                ;
            }
            verification() {
                this.$scope.showLoading = false;
                this.$scope.verifyModel.otpvia = '2';
                var otpCounter = this.localStorageHelper.get('otp-timer');
                if (otpCounter > 0) {
                    this.OTPcounter(otpCounter);
                }
                var otpid = this.localStorageHelper.get('otpid');
                if (otpid) {
                    this.$scope.verifyModel.otpid = otpid;
                }
            }
            confirmOpt() {
                this.$scope.showLoading = true;
                var res;
                res = this.userService.confirmOTP(this.$scope.verifyModel.otp, this.$scope.verifyModel.otpid);
                res.success((response, status, headers, config) => {
                    if (this.$scope.verifyMessages)
                        this.$scope.verifyMessages.splice(0);
                    if (response && response.success && status == 200 && response.data) {
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Successfully verified, Now complete user detail.");
                        this.$scope.verifyModel.mobileNo = this.$scope.verifyModel.selectedCountry.dialCode + '' + this.$scope.verifyModel.mobile;
                        this.localStorageHelper.set('verified-mobile', this.$scope.verifyModel);
                        this.openModal('register-modal');
                    }
                    else {
                        this.$scope.verifyMessages = response.messages;
                    }
                }).finally(() => { this.$scope.showLoading = false; });
            }
            requestNewOtp() {
                var model = {
                    channel: this.$scope.verifyModel.otpvia,
                    mobile: this.$scope.verifyModel.selectedCountry.dialCode + '' + this.$scope.verifyModel.mobile,
                    dialCode: this.$scope.verifyModel.selectedCountry.dialCode,
                    otpType: 1
                };
                this.userService.requestOTP(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.verifyModel.otpid = response.data;
                        this.localStorageHelper.set('otpid', response.data);
                        this.OTPcounter(2 * 60);
                    }
                    this.toasterService.showMessages(response.messages);
                });
            }
            OTPcounter(intval) {
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
            formatTime(totalSeconds) {
                var minutes = 0;
                var remainSeconds = 0;
                if (totalSeconds > 60) {
                    minutes = math.floor(math.divide(totalSeconds, 60));
                    remainSeconds = math.floor(math.mod(totalSeconds, 60));
                }
                else {
                    remainSeconds = totalSeconds;
                }
                if (minutes.toString().length === 1) {
                    minutes = '0' + minutes;
                }
                if (remainSeconds.toString().length === 1) {
                    remainSeconds = '0' + remainSeconds;
                }
                return minutes + ':' + remainSeconds;
            }
            gotoDashboard() {
                this.WSSocketService.connetWs();
                this.WSFairTradeSocketService.connetWs();
                if (this.isMobile.any) {
                    if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                        this.$state.go('mobile.seven.base.home');
                    }
                    else {
                        this.$state.go('mobile.base.home');
                    }
                }
                else {
                    this.$state.go('base.home');
                }
            }
            register() {
                var verified_modal = this.localStorageHelper.get('verified-mobile');
                if (this.validateNewUserPassword() && verified_modal.otpid) {
                    this.$scope.showLoading = true;
                    var userToken = this.localStorageHelper.getUserTokenFromCookie();
                    var model = {
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
                    if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.System) {
                        model.key = this.$scope.captcha.key;
                        this.executeRegistration(model);
                    }
                    else if (this.$scope.captchaMode == intranet.common.enums.CaptchaMode.GoogleV2) {
                        this.vcRecaptchaService.reload();
                        this.getCaptchaResponse().then((data) => {
                            model.key = data;
                            this.executeRegistration(model);
                        });
                    }
                }
            }
            executeRegistration(model) {
                var res;
                res = this.userService.register(model);
                res.success((response, status, headers, config) => {
                    if (this.$scope.registerMessages)
                        this.$scope.registerMessages.splice(0);
                    if (response && response.success && status == 200 && response.data) {
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Successfully registered.");
                        this.localStorageHelper.set('verified-mobile', {});
                        this.openModal('login-modal');
                    }
                    else {
                        this.$scope.registerMessages = response.messages;
                    }
                }).finally(() => { this.$scope.showLoading = false; });
            }
            validateNewUserPassword() {
                this.$scope.registerMessages.splice(0);
                if (!this.commonDataService.validatePassword(this.$scope.registerModel.password)) {
                    var msg = 'Password must be 6 character long, must contain alphabetics and numbers';
                    this.$scope.registerMessages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                else if (this.$scope.registerModel.password !== this.$scope.registerModel.confirmpassword) {
                    var msg = "Password not matched with confirm password.";
                    this.$scope.registerMessages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                return true;
            }
            downloadAPK() {
                this.commonDataService.downloadClientAPK();
            }
            selectOfferFromModal(obj) {
                var modal = new intranet.common.helpers.CreateModal();
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
                    .then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        obj.offer = result.data;
                        this.validateOffer(obj);
                    }
                });
            }
            validateOffer(obj) {
                if (this.$scope.offerCheckTimeout)
                    this.$timeout.cancel(this.$scope.offerCheckTimeout);
                obj.offerLoader = true;
                this.$scope.offerCheckTimeout = this.$timeout(() => {
                    obj.offerMessages = [];
                    var model = {
                        id: obj.offer.id,
                        bonusCode: obj.offer.bonusCode,
                    };
                    this.userService.validateRegisterOffer(model)
                        .success((response) => {
                        if (response.success) {
                            obj.offer = response.data;
                            obj.offer.isValid = true;
                        }
                        else {
                            obj.offer.id = undefined;
                            obj.offer.isValid = false;
                            obj.offerMessages = response.messages;
                        }
                    }).finally(() => { obj.offerLoader = false; });
                }, 1000);
            }
            removeOffer(obj) {
                obj.offer = {};
                obj.offerMessages = [];
            }
            startForgetPassword() {
                this.$scope.showLoading = false;
                this.$scope.forgotModel.otpvia = '2';
                var otpCounter = this.localStorageHelper.get('forget_otp-timer');
                if (otpCounter > 0) {
                    this.OTPcounterForget(otpCounter);
                }
                var otpid = this.localStorageHelper.get('forget_otpid');
                if (otpid) {
                    this.$scope.forgotModel.otpid = otpid;
                }
            }
            OTPcounterForget(intval) {
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
            requestOtpForForget() {
                var model = {
                    channel: this.$scope.forgotModel.otpvia,
                    mobile: this.$scope.forgotModel.selectedCountry.dialCode + '' + this.$scope.forgotModel.mobile,
                    dialCode: this.$scope.forgotModel.selectedCountry.dialCode,
                    otpType: 2
                };
                this.userService.requestOTP(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.forgotModel.otpid = response.data;
                        this.localStorageHelper.set('forget_otpid', response.data);
                        this.OTPcounterForget(1 * 60);
                    }
                    this.toasterService.showMessages(response.messages);
                });
            }
            forgotPassword() {
                if (this.validateForgotPassword()) {
                    this.$scope.showLoading = true;
                    var model = {
                        mobile: this.$scope.forgotModel.selectedCountry.dialCode + '' + this.$scope.forgotModel.mobile,
                        otp: this.$scope.forgotModel.otp,
                        otpId: this.$scope.forgotModel.otpid,
                        newPassword: this.$scope.forgotModel.newpassword
                    };
                    this.userService.resetPasswordByOtp(model).success((response, status, headers, config) => {
                        if (this.$scope.verifyMessages)
                            this.$scope.forgotMessages.splice(0);
                        if (response && response.success && status == 200 && response.data) {
                            this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Successfully reset, Now login with new password.");
                            this.openModal('login-modal');
                        }
                        else {
                            this.$scope.forgotMessages = response.messages;
                        }
                    }).finally(() => { this.$scope.showLoading = false; });
                }
            }
            validateForgotPassword() {
                this.$scope.forgotMessages.splice(0);
                if (!this.commonDataService.validatePassword(this.$scope.forgotModel.newpassword)) {
                    var msg = 'Password must be 6 character long, must contain alphabetics and numbers';
                    this.$scope.forgotMessages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                else if (this.$scope.forgotModel.newpassword !== this.$scope.forgotModel.confirmpassword) {
                    var msg = "Password not matched with confirm password.";
                    this.$scope.forgotMessages.push(new intranet.common.messaging.ResponseMessage(intranet.common.messaging.ResponseMessageType.Error, msg, null));
                    return false;
                }
                return true;
            }
            changeNumber() {
                this.$scope.showLoading = true;
                var res;
                var model = {
                    oldMobileNo: this.$scope.changeMobileModel.oldMobileNo,
                    newMobileNo: this.$scope.changeMobileModel.selectedCountry.dialCode + '' + this.$scope.changeMobileModel.newMobileNo
                };
                res = this.userService.changeMobileNo(model);
                res.success((response, status, headers, config) => {
                    if (this.$scope.changeMobileMessages)
                        this.$scope.changeMobileMessages.splice(0);
                    if (response && response.success && response.data) {
                        this.toasterService.showToast(intranet.common.helpers.ToastType.Info, "Successfully changed.");
                        this.openModal('verify-modal');
                        var userdetail = this.localStorageHelper.get(this.settings.UserData);
                        userdetail.user.mobile = model.newMobileNo;
                    }
                    else {
                        this.$scope.changeMobileMessages = response.messages;
                    }
                }).finally(() => { this.$scope.showLoading = false; });
            }
            CancelChageNumber() {
                this.openModal('verify-modal');
                var userdetail = this.localStorageHelper.get(this.settings.UserData);
            }
            openPrivacyPolicy() {
                var url = this.$state.href('privacypolicy');
                this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
            }
            openCookiePolicy() {
                var url = this.$state.href('cookiepolicy');
                this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
            }
            openTermsConditions() {
                var url = this.$state.href('termsconditions');
                this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
            }
            openResponsibleGambling() {
                var url = this.$state.href('responsiblegambling');
                this.$window.open(this.$sce.trustAsUrl(url), this.settings.Title, 'fullscreen="yes"');
            }
            decideLogin() {
                this.openModal('login-modal');
            }
            checkState(name) {
                if (this.settings.ThemeName == 'sports') {
                    if (name.indexOf('promo.publink') > -1) {
                        this.$scope.needsToHideRightSide = true;
                    }
                    else {
                        this.$scope.needsToHideRightSide = false;
                    }
                }
            }
            getSportsForBking() {
                this.$scope.sports = [];
                this.commonDataService.getSupportDetails()
                    .then((sdata) => {
                    this.eventTypeService.getSports()
                        .success((response) => {
                        if (response.success && response.data) {
                            angular.forEach(response.data, (d) => {
                                if (d.displayOrder > 0 && sdata.eventTypeIds.some((x) => { return x == d.id; })) {
                                    this.$scope.sports.push(d);
                                }
                            });
                            this.$scope.filteredSports = this.$scope.sports.filter((a) => { return a.id != this.settings.HorseRacingId && a.id != this.settings.GreyhoundId; });
                            this.$scope.filteredSports.forEach((a) => { a.checked = true; });
                        }
                    }).finally(() => {
                        this.getPopularMarkets(this.$scope.filteredSports);
                    });
                });
            }
            setSwiper() {
                var newScript = document.createElement("script");
                newScript.src = "https://unpkg.com/swiper/swiper-bundle.min.js";
                document.head.appendChild(newScript);
                newScript.onload = function () {
                    var mySwiper = new Swiper('.swiper-container', {
                        loop: true,
                        autoplay: true,
                        autoHeight: true,
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true,
                        },
                    });
                };
            }
            setSwiperForSports() {
                this.$timeout(() => {
                    var mySwiper = new Swiper('#banners', {
                        loop: true,
                        autoplay: true,
                        autoHeight: true,
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true,
                        },
                        navigation: {
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        },
                    });
                    var mySwiper2 = new Swiper('#right-casino-box', {
                        loop: true,
                        autoplay: true,
                        autoHeight: true,
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true,
                        },
                        navigation: {
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        },
                    });
                    var mySwiper3 = new Swiper('#swiper5', {
                        slidesPerView: this.$scope.hasCasino ? 5 : 2,
                        spaceBetween: 5, freeMode: true,
                    });
                    var bigWinsSwiper = new Swiper('#bigWinsSwiper', {
                        slidesPerView: 'auto',
                        spaceBetween: 8,
                        freeMode: true,
                        grabCursor: true,
                        loop: true,
                        autoplay: {
                            delay: 2000,
                            disableOnInteraction: false,
                        },
                    });
                }, 100);
            }
            getSports() {
                this.$scope.isRequestProcessing = true;
                this.$scope.sports = [];
                this.eventTypeService.getSports()
                    .success((response) => {
                    if (response.success && response.data) {
                        this.$scope.sports = response.data.filter((a) => { return a.displayOrder > 0; });
                        this.getPopularMarkets(this.$scope.sports);
                    }
                }).finally(() => {
                    if (this.$scope.sports.length > 0 && this.settings.ThemeName == 'sky' && !this.isMobile.any) {
                        this.activateSkySlider(4000);
                    }
                });
            }
            getRaces() {
                this.$scope.races = [];
                this.marketOddsService.getRaces()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.races = response.data;
                    }
                }).finally(() => {
                    this.$scope.races.forEach((m) => {
                        m.eventTypeId = this.settings.HorseRacingId;
                        m.eventTypeName = this.$scope.sports.filter((x) => { return x.id == m.eventTypeId; })[0].name;
                        m.countryCode = m.event.countryCode;
                    });
                });
            }
            getRacesGroup(eventTypeId) {
                this.$scope.isRequestProcessing = true;
                this.$scope.races = [];
                this.marketOddsService.getRacesForPromo(eventTypeId, 0)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.races = response.data;
                    }
                }).finally(() => {
                    this.$timeout(() => { this.$scope.isRequestProcessing = false; }, 700);
                    this.$scope.races.forEach((m) => {
                        m.eventTypeId = eventTypeId;
                        m.eventTypeName = this.$scope.sports.filter((x) => { return x.id == m.eventTypeId; })[0].name;
                        m.countryCode = m.event.countryCode;
                    });
                });
            }
            getPopularMarkets(sports) {
                this.$scope.popularMarkets = [];
                var ids = sports.map((x) => { return x.id; });
                this.marketOddsService.getSports(30, ids)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.popularMarkets = response.data;
                    }
                }).finally(() => {
                    if (this.settings.ThemeName == 'sports' || this.settings.ThemeName == 'dimd2' || this.settings.ThemeName == 'sky') {
                        this.countEvents();
                    }
                    this.$scope.popularMarkets.forEach((m) => {
                        if (this.commonDataService.BetInProcess(m.id)) {
                            m.betInProcess = true;
                        }
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
                    if (this.settings.ThemeName == 'dimd2') {
                        this.setEventTypeSource(this.$scope.popularMarkets);
                    }
                });
            }
            setEventTypeSource(lst) {
                angular.forEach(lst, (l) => {
                    var ff = this.$scope.sports.filter((e) => { return e.id == l.eventTypeId; }) || [];
                    if (ff.length > 0) {
                        l.eventTypeSourceId = ff[0].sourceId;
                    }
                });
            }
            countEvents() {
                angular.forEach(this.$scope.sports, (s) => {
                    angular.forEach(this.$scope.popularMarkets, (p) => {
                        if (s.id == p.event.eventType.id) {
                            var event = { id: p.eventId, name: p.event.name };
                            if (!s.competitions) {
                                s.competitions = [];
                                s.competitions.push({ name: p.event.competitionName, id: p.event.competitionId, events: [event] });
                            }
                            else {
                                var cIndex = intranet.common.helpers.Utility.IndexOfObject(s.competitions, 'id', p.event.competitionId);
                                if (cIndex > -1) {
                                    s.competitions[cIndex].events.push(event);
                                }
                                else {
                                    s.competitions.push({ name: p.event.competitionName, id: p.event.competitionId, events: [event] });
                                }
                            }
                        }
                    });
                });
            }
            getOddsJson() {
                this.marketOddsService.getOddsJson()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.odds = response.data;
                    }
                }).finally(() => { this.setOdds(); });
            }
            setOdds() {
                this.$scope.odds.forEach((data) => {
                    this.$scope.popularMarkets.forEach((f) => {
                        if (f.id == data.id) {
                            this.setOddsInMarket(f, data);
                        }
                    });
                });
            }
            subscribeOdds() { }
            getOffers() {
                this.offerService.getOfferList()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.offerList = response.data;
                    }
                }).finally(() => {
                    if (this.settings.ThemeName == 'sky' && this.isMobile.any && this.$scope.offerList.length > 0) {
                        this.activateSkySlider();
                    }
                });
            }
            activateSkySlider(speed = 7000) {
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
            sendLogin() {
                this.$rootScope.$broadcast('open-login-modal');
            }
            sendSignup() {
                this.$rootScope.$broadcast('open-register-modal');
            }
            openOfferModal() {
                var modal = new intranet.common.helpers.CreateModal();
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
            copytext(txt) {
                this.commonDataService.copyText(txt);
            }
            registerScrollEvent() {
                jQuery('.markets-odd').each(function (i, d) {
                    jQuery(d).on('mousedown', function (event) {
                        jQuery('.markets-odd').each(function (index, el) {
                            jQuery(el).attr('user', 1);
                        });
                    });
                });
                jQuery('.markets-odd').each(function (i, d) {
                    jQuery(d).on('touchstart', function (event) {
                        jQuery('.markets-odd').each(function (index, el) {
                            jQuery(el).attr('user', 1);
                        });
                    });
                });
                jQuery('.markets-odd').attr('sleft', 1);
                jQuery('.markets-odd').on('scroll', function (e) {
                    scrollSame(this.scrollLeft);
                    setTimeout(function () { scrollAll(); }, 500);
                });
                var scrollSame = ((svalue) => {
                    jQuery('.markets-odd').each(function (index, div) {
                        jQuery(div).scrollLeft(svalue);
                    });
                });
                var scrollAll = (() => {
                    jQuery('.markets-odd').each(function (index, div) {
                        var oldcount = jQuery(div).attr('sleft');
                        var isuser = jQuery(div).attr('user');
                        if (isuser == 1) {
                            if (oldcount % 2 == 0) {
                                jQuery(div).animate({ scrollLeft: '-=500' }, 1000, 'swing');
                                jQuery(div).attr('sleft', 1);
                                jQuery(div).attr('user', 0);
                            }
                            else {
                                jQuery(div).animate({ scrollLeft: '+=500' }, 1000, 'swing');
                                jQuery(div).attr('sleft', 2);
                                jQuery(div).attr('user', 0);
                            }
                        }
                    });
                });
            }
            openMenu(e, isLeft) {
                e.stopPropagation();
                if (this.$scope.anyMenuOpen) {
                    this.centerClick(e);
                }
                else {
                    if (isLeft) {
                        this.$scope.leftMenuOpen = true;
                    }
                    this.$scope.anyMenuOpen = true;
                }
            }
            centerClick(e) {
                e.stopPropagation();
                if (this.$scope.leftMenuOpen) {
                    this.$scope.anyMenuOpen = false;
                    this.$scope.leftMenuOpen = false;
                }
            }
        }
        home.PromoCtrl = PromoCtrl;
        angular.module('intranet.home').controller('promoCtrl', PromoCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PromoCtrl.js.map