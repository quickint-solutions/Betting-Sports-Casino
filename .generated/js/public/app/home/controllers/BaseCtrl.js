var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class BaseCtrl extends intranet.common.ControllerBase {
            constructor($scope, marketService, toasterService, localStorageHelper, settings, eventTypeService, commonDataService, userService, languageService, translationService, accountService, settingService, $rootScope, modalService, $timeout, $interval, $window, $state, websiteService, offerService, $sce, $location) {
                super($scope);
                this.marketService = marketService;
                this.toasterService = toasterService;
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                this.eventTypeService = eventTypeService;
                this.commonDataService = commonDataService;
                this.userService = userService;
                this.languageService = languageService;
                this.translationService = translationService;
                this.accountService = accountService;
                this.settingService = settingService;
                this.$rootScope = $rootScope;
                this.modalService = modalService;
                this.$timeout = $timeout;
                this.$interval = $interval;
                this.$window = $window;
                this.$state = $state;
                this.websiteService = websiteService;
                this.offerService = offerService;
                this.$sce = $sce;
                this.$location = $location;
                this.sidebarOpen = false;
                this.searchOpen = false;
                this.userMenuOpen = false;
                this.activeSubmenu = null;
                var self = this;
                this.commonDataService.setBackground();
                var refreshBalance = this.$rootScope.$on("balance-changed", () => {
                    this.getBalance();
                });
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => {
                    this.betProcessStarted(data.marketId);
                });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => {
                    this.betProcessComplete(data.marketId);
                });
                var currenttime = null;
                if (this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'bking') {
                    currenttime = this.$interval(() => {
                        this.$scope.currentDate = new Date();
                    }, 1000);
                }
                var wsListnerAnnouncement = this.$rootScope.$on("ws-announcement-changed", (event, response) => {
                    if (response.success) {
                        this.getAnnouncement();
                    }
                });
                var wsListnerBalance = this.$rootScope.$on("ws-balance-changed", (event, response) => {
                    if (response.success) {
                        this.getBalance();
                    }
                });
                var wsListnerDeposit = this.$rootScope.$on("ws-deposit-request-confirm", (event, response) => {
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Info, response.data, 10000);
                    this.playAudio();
                });
                var wsListnerWithdrawal = this.$rootScope.$on("ws-withdrawal-request-confirm", (event, response) => {
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Warning, response.data, 10000);
                    this.playAudio();
                });
                var stateWatcher = $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
                    if (toState.name == 'base.home' && fromState.name != toState.name) {
                        if (this.settings.ThemeName == 'sports') {
                            this.playLottieForAnnoucement(1000);
                        }
                    }
                });
                this.$scope.$on('$destroy', () => {
                    refreshBalance();
                    place_bet_started();
                    place_bet_ended();
                    if (currenttime) {
                        this.$interval.cancel(currenttime);
                    }
                    wsListnerAnnouncement();
                    wsListnerBalance();
                    wsListnerDeposit();
                    wsListnerWithdrawal();
                    stateWatcher();
                });
                document.body.addEventListener('scroll', function (event) {
                    self.scrollChanged(self);
                });
                this.scrollChanged(self);
                this.calMainContentHeight(self);
                super.init(this);
            }
            scrollChanged(self) {
                var getHeaderHeight = (() => {
                    if (self.$scope.announcement && self.$scope.announcement.length > 0) {
                        return 177.8;
                    }
                    else {
                        return 149;
                    }
                });
                var fixRightHeight = 112.2;
                var footerHeight = intranet.common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) ?
                    (this.settings.WebApp == 'booster99' ? 323.8 :
                        this.settings.WebApp == 'silverexch' ? 158.8 : 197.8) :
                    72.8;
                if (document.body.scrollTop >= getHeaderHeight()) {
                    var totalScroll = document.body.scrollTop + document.body.offsetHeight;
                    var bottomLine = (document.body.scrollHeight - footerHeight);
                    var bottomHeight = (totalScroll > bottomLine) ? (totalScroll - bottomLine) : 0;
                    self.$scope.rightPlaceBetHeight = window.innerHeight - fixRightHeight - bottomHeight;
                }
                else {
                    self.$scope.rightPlaceBetHeight = window.innerHeight - (getHeaderHeight() - document.body.scrollTop) - fixRightHeight;
                }
            }
            calMainContentHeight(self) {
                if (this.$location.$$url == '/live-games') {
                    self.$scope.mainContentMinHeight = 'unset';
                }
                else {
                    if (self.$scope.announcement && self.$scope.announcement.length > 0) {
                        self.$scope.mainContentMinHeight = window.innerHeight - 28.8 - 30 - 91 - 72.8;
                    }
                    else {
                        self.$scope.mainContentMinHeight = window.innerHeight - 30 - 91 - 72.8;
                    }
                }
            }
            betProcessStarted(marketId) {
                this.commonDataService.BetProcessStarted(marketId);
            }
            betProcessComplete(marketId) {
                this.commonDataService.BetProcessComplete(marketId);
                this.getBalance();
            }
            timezoneChanged(value) {
                this.$scope.selectedTimezone = value;
                this.$rootScope.timezone = value.replace(':', '');
            }
            initScopeValues() {
                this.$scope.timezone = intranet.common.helpers.CommonHelper.getTimeZone();
                this.$scope.selectedTimezone = this.$scope.timezone;
                this.$rootScope.timezone = intranet.common.helpers.CommonHelper.getTimeZone();
                this.$scope.eventList = [];
                this.$scope.supportDetail = {};
                this.$scope.lastSelectedIndex = -1;
                this.$scope.oneClickEnable = false;
                var oneclick = this.localStorageHelper.get(this.settings.OneClickConfig);
                if (oneclick && math.number(oneclick) > 0) {
                    this.$scope.oneClickEnable = true;
                }
                this.$scope.hasAPK = this.settings.HasAPK;
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
                this.$scope.openMenu = false;
                this.$scope.isPromoSite = intranet.common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp);
                this.$scope.currentWebApp = this.settings.WebApp;
                this.$scope.displayName = this.settings.Title;
                this.$scope.footerTemplate = this.settings.ThemeName + '/template/footer.html';
                this.$scope.imagePath = this.settings.ImagePath;
                this.$scope.topMenuSelectNumber = 0;
            }
            loadInitialData() {
                this.getOffers();
                this.loadWebsiteDetail();
                this.loadStakeConfig();
                this.getBetConfig();
                this.loadEventTypes();
                this.getLanguages();
                this.getBalance();
                this.getUserData();
                this.getAnnouncement();
                if (this.settings.IsLMTAvailable) {
                    this.commonDataService.setLMTScript();
                }
                if (this.settings.ThemeName == 'bking') {
                    this.checkUserMenuClick();
                }
                if (this.settings.WebApp == 'booster99') {
                    this.commonDataService.addGaminIcon();
                }
                this.commonDataService.initFreshchat(false);
            }
            loadWebsiteDetail() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                        }
                        this.$scope.hasCasino = data.hasCasino;
                        this.$scope.isB2C = data.isB2C;
                        this.$scope.hasReferral = data.hasReferral;
                    }
                });
                if (this.commonDataService.isOBD()) {
                    var newScript = document.createElement("script");
                    newScript.src = "https://unpkg.com/tesseract.js@v2.0.0-beta.1/dist/tesseract.min.js";
                    document.head.appendChild(newScript);
                }
            }
            isActive(path) {
                return (this.$location.$$url == path) ? 'active' : '';
            }
            isActiveBool(path) {
                return (this.$location.$$url == path) ? true : false;
            }
            isActiveMenu(id) {
                if (this.$location.$$url == (id == this.settings.HorseRacingId || id == this.settings.GreyhoundId ? '/sport/1/' + id + '/racing' : '/sport/1/' + id + '/market')) {
                    return 'active';
                }
            }
            showOneClick() {
                return (this.$location.path().indexOf('/account/') >= 0) ? false : true;
            }
            CheckInsideClick(event) {
                if (event.target.innerText != "Cancel")
                    event.stopPropagation();
            }
            loadStakeConfig() {
                var luser = this.commonDataService.getLoggedInUserData();
                if (luser.stakeConfigs) {
                    var result = this.localStorageHelper.get(this.settings.StakeConfig);
                    if (result) {
                        this.$scope.stakeConfig = result;
                    }
                    else {
                        this.$scope.stakeConfig = luser.stakeConfigs;
                    }
                    this.$scope.stakeConfig.inlineBet = false;
                    if (this.settings.ThemeName == 'sports') {
                        this.$scope.stakeConfig.inlineBet = true;
                    }
                    this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
                    this.$timeout(() => { this.$rootScope.$broadcast(this.settings.StakeConfig); }, 500);
                }
            }
            saveStakeConfig() {
                this.userService.updateStakeConfig(this.$scope.stakeConfig)
                    .success((response) => {
                    if (response.success) {
                        this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
                        this.$rootScope.$broadcast(this.settings.StakeConfig);
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
            }
            openStakeConfigModal() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'Chips Setting';
                modal.data = this.$scope.stakeConfig;
                modal.size = 'md';
                modal.bodyUrl = this.settings.ThemeName + '/home/account/stake-config-modal.html';
                modal.controller = 'stakeConfigModalCtrl';
                modal.options.showFooter = false;
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            oneClickEnabled(click) {
                this.$scope.oneClickEnable = !this.$scope.oneClickEnable;
                if (this.$scope.oneClickEnable) {
                    this.storeOneClickValueInStorage();
                }
                else {
                    this.localStorageHelper.set(this.settings.OneClickConfig, 0);
                }
            }
            storeOneClickValueInStorage() {
                var result = this.localStorageHelper.get(this.settings.StakeConfig);
                if (result) {
                    this.$scope.stakeConfig = result;
                    var selected = this.$scope.stakeConfig.oneClickStake.filter((e) => { return e.isActive == true; });
                    if (selected.length > 0) {
                        this.localStorageHelper.set(this.settings.OneClickConfig, selected[0].stake);
                    }
                }
            }
            inlineBetChanged(inlinebet = null) {
                if (this.$scope.stakeConfig) {
                    if (inlinebet != null) {
                        this.$scope.stakeConfig.inlineBet = inlinebet;
                    }
                    this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
                }
            }
            logout() {
                this.commonDataService.logout();
            }
            loadEventTypes() {
                this.eventTypeService.getEventTypes()
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.commonDataService.setEventTypes(response.data);
                            this.commonDataService.getEventTypes()
                                .then((data) => { this.$scope.eventTypes = data; });
                        }
                    }
                });
            }
            getBetConfig() {
                var luser = this.commonDataService.getLoggedInUserData();
                if (luser && luser.betConfigs) {
                    this.commonDataService.setUserBetConfig(luser.betConfigs);
                }
            }
            menuClick(id, name) {
                var url = 'base.home.sport.market';
                if (id == this.settings.HorseRacingId || id == this.settings.GreyhoundId) {
                    if (this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus') {
                        url = 'base.home.sport.upcomingrace';
                    }
                    else {
                        url = 'base.home.sport.racingmarket';
                    }
                }
                if (id == this.settings.LiveGamesId) {
                    url = 'base.home.sport.livegames';
                }
                else if (id == this.settings.VirtualGameId) {
                    url = 'base.home.sport.virtualgames';
                }
                var breadcrumb = [];
                breadcrumb.push({ name: name, nodetype: 1, id: id, url: url, eventTypeId: id });
                this.localStorageHelper.set(this.settings.SportTreeHeader, breadcrumb);
                this.$state.go(url, { nodetype: 1, id: id, eventTypeId: id });
            }
            getLanguages() {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.selectedLanguage = result.languageId.toString();
                }
                this.languageService.getLanguages()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.languageList = response.data;
                    }
                });
            }
            languageChanged() {
                this.userService.changeUserLanguage(this.$scope.selectedLanguage)
                    .success((res) => {
                    this.toasterService.showMessages(res.messages, 3000);
                    if (res.success) {
                        this.translationService.setLanguage(this.$scope.selectedLanguage);
                    }
                });
            }
            getUserData() {
                this.$scope.user = this.commonDataService.getLoggedInUserData();
            }
            getBalance() {
                this.accountService.getBalance()
                    .success((res) => {
                    if (res.success) {
                        this.$scope.balanceInfo = res.data;
                        this.localStorageHelper.set('balance_' + this.settings.WebApp, res.data.balance + res.data.creditLimit);
                        this.localStorageHelper.set('only_balance_' + this.settings.WebApp, res.data.balance);
                    }
                });
            }
            getAnnouncement() {
                this.settingService.getNotifications()
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.$scope.announcement = response.data.join(' | ');
                            this.playLottieForAnnoucement();
                        }
                        else {
                            this.$scope.announcement = undefined;
                        }
                    }
                }).finally(() => {
                    this.scrollChanged(this);
                    this.calMainContentHeight(this);
                });
            }
            playLottieForAnnoucement(delay = 10) {
                if (this.settings.ThemeName == 'sports' && this.$scope.announcement) {
                    this.$timeout(() => {
                        var animation = bodymovin.loadAnimation({
                            animationData: intranet.common.helpers.CommonHelper.getAnnoucementJson(),
                            container: document.getElementById('announce-lottie'),
                            renderer: 'svg',
                            loop: true,
                            autoplay: true,
                            name: "Demo Animation",
                        });
                    }, delay);
                }
            }
            changePassword() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'profile.password.change.modal.header';
                modal.data = {
                    userId: this.$scope.user.id
                };
                modal.size = 'md';
                modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
                modal.controller = 'changePasswordModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            downloadAPK() {
                this.commonDataService.downloadClientAPK();
            }
            openVideo() {
                var url = this.$state.href('glctv');
                this.$window.open(this.$sce.trustAsUrl(url), "Video Container", "width=800,height=350,left=400,top=150");
            }
            openRules() {
                this.commonDataService.openWebsiteRules();
            }
            eventSelected(e) {
                this.$scope.searchEvent = '';
                this.$scope.eventList.splice(0);
                if (e.eventType.id == this.settings.HorseRacingId || e.eventType.id == this.settings.HorseRacingId) {
                    this.$rootScope.$emit("sporttree-br-changed", { eventTypeId: e.eventType.id });
                    this.$state.go('base.home.sport.upcomingrace', { nodetype: 1, id: e.eventType.id, eventTypeId: e.eventType.id, marketid: e.id });
                }
                else {
                    this.$rootScope.$emit("sporttree-br-changed", { eventTypeId: e.eventType.id });
                    this.$state.go('base.home.sport.fullmarket', { nodetype: 2, id: e.event.competitionId, eventId: e.event.id, eventTypeId: e.eventType.id });
                }
            }
            searchEvent(search) {
                if (search && search.length >= 3) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.marketService.searchMarketByEventName(search);
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.eventList = response.data;
                        });
                    }
                }
                else {
                    if (this.$scope.eventList)
                        this.$scope.eventList.splice(0);
                }
            }
            openTermsForClient() {
                this.commonDataService.showLotusFooterMsg(this.$scope, 7).then(() => {
                    this.commonDataService.showLotusFooterMsg(this.$scope, 5).then(() => {
                        this.commonDataService.showLotusFooterMsg(this.$scope, 6).then(() => {
                            this.userService.firstLoginDone();
                        });
                    });
                });
            }
            getOffers() {
                this.offerService.getOfferList()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.offerList = response.data;
                    }
                });
            }
            openOfferModal() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = this.settings.Title + ' Offers';
                modal.data = {
                    forSelection: 2
                };
                modal.options.actionButton = '';
                modal.bodyUrl = this.settings.ThemeName + '/home/account/select-offer-modal.html';
                modal.controller = 'selectOfferModalCtrl';
                modal.size = 'lg';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            playAudio() {
                var audio = new Audio('audio/dw-client.mp3');
                audio.play();
            }
            checkUserMenuClick() {
                var self = this;
                window.onclick = function (event) {
                    if (!jQuery(event.target).closest('.drop_down')[0]) {
                        self.$scope.openMenu = false;
                    }
                };
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
            toggleSidebar() {
                this.sidebarOpen = !this.sidebarOpen;
                if (!this.sidebarOpen) {
                    this.activeSubmenu = null;
                }
            }
            closeSidebar() {
                this.sidebarOpen = false;
                this.activeSubmenu = null;
            }
            toggleSearch() {
                this.searchOpen = !this.searchOpen;
            }
            toggleUserMenu() {
                this.userMenuOpen = !this.userMenuOpen;
            }
            closeUserMenu() {
                this.userMenuOpen = false;
            }
            toggleSubmenu(menu) {
                this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
            }
            openLoginModal() {
                this.$rootScope.$broadcast('open-login-modal');
            }
            openSignupModal() {
                this.$rootScope.$broadcast('open-register-modal');
            }
            openCasinoGame(game) {
                this.$rootScope.$broadcast('open-casino-game', { game: game });
            }
            openPromotions() {
                this.$rootScope.$broadcast('open-promotions');
            }
            openBonus() {
                this.$rootScope.$broadcast('open-bonus');
            }
            searchEvents(search) {
                this.searchEvent(search);
            }
            goToEvent(event) {
                this.searchOpen = false;
                this.$scope.searchEvent = '';
                if (event && event.id) {
                    this.$state.go('base.home.event', { id: event.id });
                }
            }
        }
        home.BaseCtrl = BaseCtrl;
        angular.module('intranet.home').controller('baseCtrl', BaseCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BaseCtrl.js.map