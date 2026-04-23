module intranet.home {
    export interface IBaseScope extends intranet.common.IScopeBase {
        stakeConfig: any;
        lastSelectedIndex: number;
        oneClickEnable: boolean;

        timezone: any;
        selectedTimezone: any;
        currentDate: any;
        eventTypes: any[];
        offerList: any[];

        languageList: any[];
        selectedLanguage: any;
        balanceInfo: any;
        user: any;

        enableLoader: boolean;

        announcement: string;

        // has andriod APK
        hasAPK: boolean;
        hasCasino: boolean;

        promiseItem: any;
        eventList: any[];
        searchEvent: any;

        rightPlaceBetHeight: any;
        mainContentMinHeight: any;

        totalBetsCount: any;
        webImagePath: any;
        openMenu: any;
        isPromoSite: any;
        supportDetail: any;

        currentWebApp: any;
        displayName: any;

        isB2C: boolean;
        hasReferral: boolean;
        footerTemplate: any;
        imagePath: any;

        topMenuSelectNumber: any;
        isLightTheme: boolean;
    }

    export class BaseCtrl extends intranet.common.ControllerBase<IBaseScope>
        implements intranet.common.init.IInit {
        constructor($scope: IBaseScope,
            private marketService: services.MarketService,
            private toasterService: intranet.common.services.ToasterService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings,
            private eventTypeService: services.EventTypeService,
            private commonDataService: common.services.CommonDataService,
            private userService: services.UserService,
            private languageService: services.LanguageService,
            private translationService: services.TranslationService,
            private accountService: services.AccountService,
            private settingService: services.SettingService,
            protected $rootScope: any,
            private modalService: common.services.ModalService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $window: any,
            private $state: any,
            private websiteService: services.WebsiteService,
            private offerService: services.OfferService,
            private $sce: ng.ISCEService,
            private $location: any) {
            super($scope);

            var self = this;

            this.commonDataService.setBackground();

            // Light theme toggle initialization
            var savedTheme = this.localStorageHelper.get('theme_mode');
            this.$scope.isLightTheme = savedTheme === 'light';
            if (this.$scope.isLightTheme) {
                jQuery('body').addClass('light-theme');
            }

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
                this.toasterService.showToast(common.helpers.ToastType.Info, response.data, 10000);
                this.playAudio();
            });
            var wsListnerWithdrawal = this.$rootScope.$on("ws-withdrawal-request-confirm", (event, response) => {
                this.toasterService.showToast(common.helpers.ToastType.Warning, response.data, 10000);
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
                if (currenttime) { this.$interval.cancel(currenttime); }
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

        private scrollChanged(self: any): void {
            var getHeaderHeight = (() => {
                if (self.$scope.announcement && self.$scope.announcement.length > 0) {
                    return 177.8;
                } else {
                    return 149;
                }
            });

            var fixRightHeight = 112.2;
            var footerHeight =
                common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp) ?
                    (this.settings.WebApp == 'booster99' ? 323.8 :
                        this.settings.WebApp == 'silverexch' ? 158.8 : 197.8) :
                    72.8;

            if (document.body.scrollTop >= getHeaderHeight()) {
                var totalScroll = document.body.scrollTop + document.body.offsetHeight;
                var bottomLine = (document.body.scrollHeight - footerHeight);
                var bottomHeight = (totalScroll > bottomLine) ? (totalScroll - bottomLine) : 0;

                self.$scope.rightPlaceBetHeight = window.innerHeight - fixRightHeight - bottomHeight;
            } else {
                self.$scope.rightPlaceBetHeight = window.innerHeight - (getHeaderHeight() - document.body.scrollTop) - fixRightHeight;
            }

        }

        private calMainContentHeight(self: any) {
            if (this.$location.$$url == '/live-games') {
                self.$scope.mainContentMinHeight = 'unset';
            } else {
                if (self.$scope.announcement && self.$scope.announcement.length > 0) {
                    self.$scope.mainContentMinHeight = window.innerHeight - 28.8 - 30 - 91 - 72.8;
                } else {
                    self.$scope.mainContentMinHeight = window.innerHeight - 30 - 91 - 72.8;
                }
            }
        }

        private betProcessStarted(marketId: any): void {
            this.commonDataService.BetProcessStarted(marketId);
        }

        private betProcessComplete(marketId: any): void {
            this.commonDataService.BetProcessComplete(marketId);
            this.getBalance();
        }

        private timezoneChanged(value: any): void {
            this.$scope.selectedTimezone = value;
            this.$rootScope.timezone = value.replace(':', '');
        }

        public initScopeValues() {
            this.$scope.timezone = common.helpers.CommonHelper.getTimeZone();
            this.$scope.selectedTimezone = this.$scope.timezone;
            this.$rootScope.timezone = common.helpers.CommonHelper.getTimeZone();
            this.$scope.eventList = [];
            this.$scope.supportDetail = {};
            this.$scope.lastSelectedIndex = -1;
            this.$scope.oneClickEnable = false;
            var oneclick = this.localStorageHelper.get(this.settings.OneClickConfig);
            if (oneclick && math.number(oneclick) > 0) { this.$scope.oneClickEnable = true; }
            this.$scope.hasAPK = this.settings.HasAPK;

            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            this.$scope.openMenu = false;
            this.$scope.isPromoSite = common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp);
            this.$scope.currentWebApp = this.settings.WebApp;
            this.$scope.displayName = this.settings.Title;

            this.$scope.footerTemplate = this.settings.ThemeName + '/template/footer.html';
            this.$scope.imagePath = this.settings.ImagePath;
            this.$scope.topMenuSelectNumber = 0;
        }

        public loadInitialData() {
            //if (this.settings.IsFirstLogin == true) { this.openTermsForClient(); }
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

            if (this.settings.WebApp == 'booster99') { this.commonDataService.addGaminIcon(); }


            //this.fdService.launchFairDeal()
            //    .success((response: common.messaging.IResponse<any>) => {
            //        console.log(response);
            //    });

            this.commonDataService.initFreshchat(false);
        }


        private loadWebsiteDetail(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
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

        private isActive(path: string): string {
            return (this.$location.$$url == path) ? 'active' : '';
        }

        private isActiveBool(path: string): boolean {
            return (this.$location.$$url == path) ? true : false;
        }

        private isActiveMenu(id: any): string {
            if (this.$location.$$url == (id == this.settings.HorseRacingId || id == this.settings.GreyhoundId ? '/sport/1/' + id + '/racing' : '/sport/1/' + id + '/market')) {
                return 'active';
            }
        }


        private showOneClick(): boolean {
            return (this.$location.path().indexOf('/account/') >= 0) ? false : true;
        }

        private CheckInsideClick(event: any): void {
            if (event.target.innerText != "Cancel")
                event.stopPropagation();
        }

        private loadStakeConfig(): void {
            var luser = this.commonDataService.getLoggedInUserData();
            if (luser.stakeConfigs) {
                var result = this.localStorageHelper.get(this.settings.StakeConfig);
                if (result) { this.$scope.stakeConfig = result }
                else { this.$scope.stakeConfig = luser.stakeConfigs; }

                this.$scope.stakeConfig.inlineBet = false;
                if (this.settings.ThemeName == 'sports') { this.$scope.stakeConfig.inlineBet = true; }
                this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
                this.$timeout(() => { this.$rootScope.$broadcast(this.settings.StakeConfig); }, 500);
            }
        }


        public saveStakeConfig(): void {
            this.userService.updateStakeConfig(this.$scope.stakeConfig)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
                        this.$rootScope.$broadcast(this.settings.StakeConfig);
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
        }

        private openStakeConfigModal(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'Chips Setting';
            modal.data = this.$scope.stakeConfig;
            modal.size = 'md';
            modal.bodyUrl = this.settings.ThemeName + '/home/account/stake-config-modal.html';
            modal.controller = 'stakeConfigModalCtrl';
            modal.options.showFooter = false;
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private oneClickEnabled(click: any): void {
            this.$scope.oneClickEnable = !this.$scope.oneClickEnable;
            if (this.$scope.oneClickEnable) {
                this.storeOneClickValueInStorage();
            } else { this.localStorageHelper.set(this.settings.OneClickConfig, 0); }
        }

        private storeOneClickValueInStorage(): void {
            var result = this.localStorageHelper.get(this.settings.StakeConfig);
            if (result) {
                this.$scope.stakeConfig = result;
                var selected: any[] = this.$scope.stakeConfig.oneClickStake.filter((e: any) => { return e.isActive == true; });
                if (selected.length > 0) {
                    this.localStorageHelper.set(this.settings.OneClickConfig, selected[0].stake);
                }
            }
        }

        private inlineBetChanged(inlinebet: boolean = null): void {
            if (this.$scope.stakeConfig) {
                if (inlinebet != null) { this.$scope.stakeConfig.inlineBet = inlinebet; }
                this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
            }
        }

        private logout(): void {
            this.commonDataService.logout();
        }

        // load event types for tab control
        private loadEventTypes(): void {
            this.eventTypeService.getEventTypes()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.commonDataService.setEventTypes(response.data);
                            this.commonDataService.getEventTypes()
                                .then((data: any) => { this.$scope.eventTypes = data; });
                        }
                    }
                });
        }

        private getBetConfig(): void {
            var luser = this.commonDataService.getLoggedInUserData();
            if (luser && luser.betConfigs) {
                this.commonDataService.setUserBetConfig(luser.betConfigs);
            }
        }

        private menuClick(id: any, name: any): void {
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

            var breadcrumb: any[] = [];
            //breadcrumb.push({ name: 'Sport' });
            breadcrumb.push({ name: name, nodetype: 1, id: id, url: url, eventTypeId: id });
            this.localStorageHelper.set(this.settings.SportTreeHeader, breadcrumb);
            this.$state.go(url, { nodetype: 1, id: id, eventTypeId: id });
        }

        private getLanguages(): void {
            // get current list
            var result = this.commonDataService.getLoggedInUserData();
            if (result) { this.$scope.selectedLanguage = result.languageId.toString(); }

            // get all language list
            this.languageService.getLanguages()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.languageList = response.data;
                    }
                });
        }

        private languageChanged(): void {
            this.userService.changeUserLanguage(this.$scope.selectedLanguage)
                .success((res: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(res.messages, 3000);
                    if (res.success) {
                        this.translationService.setLanguage(this.$scope.selectedLanguage);
                    }
                });
        }

        private getUserData(): void {
            this.$scope.user = this.commonDataService.getLoggedInUserData();
        }

        private getBalance(): void {
            this.accountService.getBalance()
                .success((res: common.messaging.IResponse<any>) => {
                    if (res.success) {
                        this.$scope.balanceInfo = res.data;
                        this.localStorageHelper.set('balance_' + this.settings.WebApp, res.data.balance + res.data.creditLimit);
                        this.localStorageHelper.set('only_balance_' + this.settings.WebApp, res.data.balance);
                    }
                });
        }

        private getAnnouncement(): void {
            this.settingService.getNotifications()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.$scope.announcement = response.data.join(' | ');
                            this.playLottieForAnnoucement();
                        } else {
                            this.$scope.announcement = undefined;
                        }
                    }
                }).finally(() => {
                    this.scrollChanged(this);
                    this.calMainContentHeight(this);
                });
        }

        private playLottieForAnnoucement(delay = 10) {
            if (this.settings.ThemeName == 'sports' && this.$scope.announcement) {
                this.$timeout(() => {
                    var animation = bodymovin.loadAnimation({
                        animationData: common.helpers.CommonHelper.getAnnoucementJson(),
                        container: document.getElementById('announce-lottie'), // required
                        // path: 'data.json', // required
                        renderer: 'svg', // required
                        loop: true, // optional
                        autoplay: true, // optional
                        name: "Demo Animation", // optional
                    });
                }, delay);
            }
        }

        private changePassword(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'profile.password.change.modal.header';
            modal.data = {
                userId: this.$scope.user.id
            }
            modal.size = 'md';
            modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
            modal.controller = 'changePasswordModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private downloadAPK(): void {
            this.commonDataService.downloadClientAPK();
        }

        private openVideo(): void {
            var url = this.$state.href('glctv');
            this.$window.open(this.$sce.trustAsUrl(url), "Video Container", "width=800,height=350,left=400,top=150");
        }

        private openRules(): void {
            this.commonDataService.openWebsiteRules();
        }

        private eventSelected(e: any): void {
            this.$scope.searchEvent = '';
            this.$scope.eventList.splice(0);
            if (e.eventType.id == this.settings.HorseRacingId || e.eventType.id == this.settings.HorseRacingId) {
                this.$rootScope.$emit("sporttree-br-changed", { eventTypeId: e.eventType.id });
                this.$state.go('base.home.sport.upcomingrace',
                    { nodetype: 1, id: e.eventType.id, eventTypeId: e.eventType.id, marketid: e.id });
            }
            else {
                this.$rootScope.$emit("sporttree-br-changed", { eventTypeId: e.eventType.id });
                this.$state.go('base.home.sport.fullmarket',
                    { nodetype: 2, id: e.event.competitionId, eventId: e.event.id, eventTypeId: e.eventType.id });
            }
        }

        private searchEvent(search: any): void {
            if (search && search.length >= 3) {
                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }
                this.$scope.promiseItem = this.marketService.searchMarketByEventName(search);
                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        this.$scope.eventList = response.data;
                    });
                }

            } else {
                if (this.$scope.eventList) this.$scope.eventList.splice(0);
            }
        }

        private openTermsForClient(): void {
            this.commonDataService.showLotusFooterMsg(this.$scope, 7).then(() => {
                this.commonDataService.showLotusFooterMsg(this.$scope, 5).then(() => {
                    this.commonDataService.showLotusFooterMsg(this.$scope, 6).then(() => {
                        this.userService.firstLoginDone();
                    });
                });
            });
        }

        private getOffers() {
            this.offerService.getOfferList()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.$scope.offerList = response.data; }
                });
        }

        private openOfferModal() {
            var modal = new common.helpers.CreateModal();
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

        private playAudio(): void {
            var audio = new Audio('audio/dw-client.mp3');
            audio.play();
        }

        // bbb special
        private checkUserMenuClick(): void {
            var self = this;
            window.onclick = function (event) {
                if (!jQuery(event.target).closest('.drop_down')[0]) {
                    self.$scope.openMenu = false;
                }
            }
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

        // --- Sidebar & Header Methods ---
        public sidebarOpen: boolean = false;
        public searchOpen: boolean = false;
        public userMenuOpen: boolean = false;
        public activeSubmenu: string = null;

        public toggleSidebar(): void {
            this.sidebarOpen = !this.sidebarOpen;
            if (!this.sidebarOpen) {
                this.activeSubmenu = null;
            }
        }

        public closeSidebar(): void {
            this.sidebarOpen = false;
            this.activeSubmenu = null;
        }

        public toggleSearch(): void {
            this.searchOpen = !this.searchOpen;
        }

        public toggleUserMenu(): void {
            this.userMenuOpen = !this.userMenuOpen;
        }

        public closeUserMenu(): void {
            this.userMenuOpen = false;
        }

        public toggleSubmenu(menu: string): void {
            this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
        }

        public openSupportPanel(): void {
            this.sidebarOpen = true;
            this.activeSubmenu = 'support';
        }

        public supportFlyoutOpen: boolean = false;
        public sportsFlyoutOpen: boolean = false;

        public toggleSupportFlyout($event?: any): void {
            if ($event && typeof $event.stopPropagation === 'function') {
                $event.stopPropagation();
            }
            this.sportsFlyoutOpen = false;
            this.supportFlyoutOpen = !this.supportFlyoutOpen;
        }

        public toggleSportsFlyout($event?: any): void {
            if ($event && typeof $event.stopPropagation === 'function') {
                $event.stopPropagation();
            }
            this.supportFlyoutOpen = false;
            this.sportsFlyoutOpen = !this.sportsFlyoutOpen;
        }

        public closeSupportFlyout(): void {
            this.supportFlyoutOpen = false;
        }

        public closeSportsFlyout(): void {
            this.sportsFlyoutOpen = false;
        }

        public closeIconFlyouts(): void {
            this.supportFlyoutOpen = false;
            this.sportsFlyoutOpen = false;
        }

        public openLoginModal(): void {
            this.$rootScope.$broadcast('open-login-modal');
        }

        public openSignupModal(): void {
            this.$rootScope.$broadcast('open-register-modal');
        }

        public openCasinoGame(game: string): void {
            this.$rootScope.$broadcast('open-casino-game', { game: game });
        }

        public openCasinoProvider(key: string): void {
            var slotProviders: string[] = ['qtech', 'aviator', 'mines'];
            var isSlot = slotProviders.indexOf(key) >= 0;
            var state = isSlot ? 'base.slotcasino' : 'base.casino';
            this.$state.go(state, { provider: key });
            this.closeSidebar();
        }

        public openSportTab(tab: string): void {
            // Use the logged-in inplay state — navigating to promo.inplay from base
            // would trigger CommonProcessService's logged-in → /promo redirect and
            // bounce the user back to the promo home page.
            this.$state.go('base.home.inplay', { tab: tab });
            this.closeSidebar();
            this.closeIconFlyouts();
        }

        public openPromotions(): void {
            this.$state.go('base.account.bonusstatement');
            this.closeSidebar();
        }

        public openBonus(): void {
            this.$state.go('base.account.bonusstatement');
            this.closeSidebar();
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

        public scrollToTop(): void {
            var scrollEl = document.querySelector('.middle-block') || document.querySelector('.main-content-block');
            if (scrollEl) {
                (scrollEl as HTMLElement).scrollTop = 0;
            }
        }

        public searchEvents(search: string): void {
            this.searchEvent(search);
        }

        public goToEvent(event: any): void {
            this.searchOpen = false;
            this.$scope.searchEvent = '';
            if (event && event.id) {
                this.$state.go('base.home.event', { id: event.id });
            }
        }




    }
    angular.module('intranet.home').controller('baseCtrl', BaseCtrl);
}