module intranet.mobile {
    export interface IMobileBaseScope extends intranet.common.IScopeBase {
        stakeConfig: any;
        lastSelectedIndex: number;
        oneClickEnable: boolean;
        supportDetail: any;

        isVideoOn: boolean;
        channelUrl: string;

        timezone: any;
        eventTypes: any[];
        eventTypesConfig: any[]
        isBetInProcess: boolean;
        betDelay: any;

        languageList: any[];
        selectedLanguage: any;
        balanceInfo: any;
        user: any;

        announcement: string;
        generalLoader: any;
        loadderTemplate: any;

        bf_video: any;
        displayName: any;

        // has andriod APK
        hasAPK: boolean;
        wcs_video: any;
        hasCasino: boolean;
        hasBottomTeenpatti: boolean;

        iframeHeight: any;
        currentEventData: any;

        promiseItem: any;
        searchEvent: any;
        searchEventList: any;

        isB2C: any;
        hasReferral: any;
        isEnabledCrypto: any;
        isLightTheme: boolean;
        isChatEnabled: boolean;
        webImagePath: any;
        imagePath: any;
        currentWebApp: any;
    }

    export class MobileBaseCtrl extends intranet.common.ControllerBase<IMobileBaseScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileBaseScope,
            private toasterService: intranet.common.services.ToasterService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings,
            private eventTypeService: services.EventTypeService,
            private commonDataService: common.services.CommonDataService,
            private userService: services.UserService,
            private languageService: services.LanguageService,
            private translationService: services.TranslationService,
            private accountService: services.AccountService,
            private modalService: common.services.ModalService,
            private $sce: any,
            private isMobile: any,
            private $state: any,
            private websiteService: services.WebsiteService,
            private marketOddsService: services.MarketOddsService,
            private eventService: services.EventService,
            protected $rootScope: any,
            private settingService: services.SettingService,
            private $timeout: ng.ITimeoutService,
            private videoService: services.VideoService,
            private marketService: services.MarketService,
            private exposureService: services.ExposureService,
            private $filter: any,
            private cryptoService: services.CryptoService,
            private $location: any) {
            super($scope);

            if (this.settings.ThemeName == "dimd") {
                document.body.style.width = "100%";
                document.body.style.height = "100%";
                document.body.style["position"] = "absolute";
            }
            if (this.isMobile.any) { jQuery('body').addClass('mobile-bg'); }

            var refreshBalance = this.$rootScope.$on("balance-changed", () => {
                this.getBalance();
            });
            var wsListnerBalance = this.$rootScope.$on("ws-balance-changed", (event, response) => {
                if (response.success) {
                    this.getBalance();
                }
            });

            var listenEvent = this.$scope.$on('event-changed', (event, data) => {
                this.$scope.currentEventData = data;
                this.loadVideo(data);
            });

            var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => {
                this.betProcessStarted(data);
            });
            var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => {
                this.betProcessComplete(data.marketId);
            });

            var wsListnerAnnouncement = this.$rootScope.$on("ws-announcement-changed", (event, response) => {
                if (response.success) {
                    //this.$scope.announcement = response.data;
                    this.getAnnouncement();
                }
            });

            var stateWatcher = $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
                if (toState.name == 'mobile.base.home' && fromState.name != toState.name) {
                    if (this.settings.ThemeName == 'sports') {
                        this.playLottieForAnnoucement(1000);
                    }
                }
            });

            this.$scope.$on('$destroy', () => {
                listenEvent();
                refreshBalance();
                place_bet_started();
                place_bet_ended();
                wsListnerAnnouncement();
                wsListnerBalance();
                stateWatcher();
            });

            super.init(this);
        }

        private calculateIframeHeight(): void {
            var body = document.getElementsByTagName('body')[0];
            this.$scope.iframeHeight = (body.clientWidth / 1.77);
        }

        private betProcessStarted(data: any): void {
            this.$scope.betDelay = -1;
            var delays = this.$scope.eventTypesConfig.filter((e: any) => { return e.eventTypeId == data.eventTypeId; });
            var winning_delay = 0;
            if (delays.length > 0 && (data.bettingType == common.enums.BettingType.ODDS || data.bettingType == common.enums.BettingType.BM)) {
                winning_delay = delays[0].betDelay;
            }

            if (data.betDelay > 0 && data.betDelay > winning_delay) {
                winning_delay = data.betDelay;
            }

            if (winning_delay > 0) {
                this.$scope.betDelay = winning_delay;
                var timer_betdelay;
                var stopdelay = (() => {
                    if (timer_betdelay) {
                        this.$timeout.cancel(timer_betdelay);
                    }
                });
                var startdelay = (() => {
                    if (this.$scope.betDelay > 0) {
                        this.$scope.betDelay = this.$scope.betDelay - 1;
                        timer_betdelay = this.$timeout(() => {
                            startdelay()
                        }, 1200);
                    } else {
                        stopdelay();
                    }
                });
                this.$timeout(() => { startdelay() }, 1000);
            }

            this.$scope.isBetInProcess = true;
            this.commonDataService.BetProcessStarted(data.marketId);
        }

        private betProcessComplete(marketId: any): void {
            this.commonDataService.BetProcessComplete(marketId);
            this.$scope.isBetInProcess = false;
            this.getBalance();
        }

        public initScopeValues() {
            this.$scope.timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
            this.$scope.lastSelectedIndex = -1;
            this.$scope.oneClickEnable = false;
            var oneclick = this.localStorageHelper.get(this.settings.OneClickConfig);
            if (oneclick && math.number(oneclick) > 0) { this.$scope.oneClickEnable = true; }
            this.$rootScope.highlightOnOddsChange = true;
            this.$rootScope.displayOneClick = false;
            this.$scope.isVideoOn = false;
            this.$scope.hasAPK = this.settings.HasAPK;
            this.$scope.hasBottomTeenpatti = this.settings.WebApp == 'dreambook24';
            this.$scope.displayName = this.settings.Title;

            this.$scope.loadderTemplate = this.commonDataService.mobile_market_loader_template;
            this.$scope.generalLoader = this.commonDataService.mobilePromisetracker;

            this.$scope.searchEventList = [];

            this.$scope.isChatEnabled = this.commonDataService.isChatActive();

            // Light theme toggle
            var savedTheme = this.localStorageHelper.get('mobile_theme_mode');
            this.$scope.isLightTheme = savedTheme === 'light';
            if (this.$scope.isLightTheme) {
                jQuery('body').addClass('light-theme');
            }

            this.$scope.imagePath = this.settings.ImagePath
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            this.$scope.currentWebApp = this.settings.WebApp;
        }

        public loadInitialData() {
            if (this.settings.ThemeName == 'sports') { this.getPGDetail(); }

            if (this.settings.IsLMTAvailable) {
                this.commonDataService.setLMTScript();
            }

            // if (this.settings.IsFirstLogin == true) { this.openTermsForClient(); }
            this.loadWebsiteDetail();
            this.loadStakeConfig();
            this.loadEventTypes();
            this.getBetConfig();
            this.getLanguages();
            this.getBalance();
            this.getUserData();
            this.getAnnouncement();
            this.getExposure();

            this.commonDataService.initFreshchat();
        }

        private getPGDetail() {
            this.websiteService.getPGInfo()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.isEnabledCrypto = response.data.isEnabledCrypto;
                    }
                });
        }

        private openChat() { this.commonDataService.openChatWindow(); }

        private openTermsForClient(): void {
            this.commonDataService.showLotusFooterMsg(this.$scope, 7).then(() => {
                this.commonDataService.showLotusFooterMsg(this.$scope, 5).then(() => {
                    this.commonDataService.showLotusFooterMsg(this.$scope, 6).then(() => {
                        this.userService.firstLoginDone();
                    });
                });
            });
        }

        private loadWebsiteDetail(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        this.$scope.hasCasino = data.hasCasino;
                        this.$scope.isB2C = data.isB2C;
                        this.$scope.hasReferral = data.hasReferral;
                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                        }
                    }
                });
            if (this.commonDataService.isOBD()) {
                var newScript = document.createElement("script");
                newScript.src = "https://unpkg.com/tesseract.js@v2.0.0-beta.1/dist/tesseract.min.js";
                document.head.appendChild(newScript);
            }
        }

        private getExposure(): void {
            this.exposureService.getExposure()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
        }

        private isActive(path: string): string {
            return (this.$location.$$url == path) ? 'active' : '';
        }

        private isContain(path: string): string {
            return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
        }

        private isActiveState(st): any {
            return this.$state.current.name == st;
        }

        private loadStakeConfig(): void {
            var luser = this.commonDataService.getLoggedInUserData();
            if (luser.stakeConfigs) {
                var result = this.localStorageHelper.get(this.settings.StakeConfig);
                if (result) { this.$scope.stakeConfig = result }
                else { this.$scope.stakeConfig = luser.stakeConfigs; }
                this.$scope.stakeConfig.inlineBet = true;
                this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
                this.$timeout(() => { this.$rootScope.$broadcast(this.settings.StakeConfig); }, 500);
            }
        }

        private getBetConfig(): void {
            var luser = this.commonDataService.getLoggedInUserData();
            if (luser && luser.betConfigs) {
                this.$scope.eventTypesConfig = luser.betConfigs;
                this.commonDataService.setUserBetConfig(luser.betConfigs);
            }
        }

        private saveStakeConfig(): void {
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

        private oneClickToggle(click: any): void {
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

        private logout(): void {
            this.commonDataService.logout();
        }

        private toggleTheme(): void {
            this.$scope.isLightTheme = !this.$scope.isLightTheme;
            if (this.$scope.isLightTheme) {
                jQuery('body').addClass('light-theme');
                this.localStorageHelper.set('mobile_theme_mode', 'light');
            } else {
                jQuery('body').removeClass('light-theme');
                this.localStorageHelper.set('mobile_theme_mode', 'dark');
            }
        }

        // load event types for tab control
        private loadEventTypes(): void {
            this.eventTypeService.getEventTypes()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.commonDataService.setEventTypes(response.data);
                            this.commonDataService.getEventTypes()
                                .then((value: any) => {
                                    if (value && value.length > 0) { value = value.filter((a: any) => { return a.displayOrder >= 0; }); }
                                    this.$scope.eventTypes = value;
                                });
                        }
                    }
                });
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
                    }
                });
        }

        private selectOneClickStake(index: any, model: any): void {
            if (!model.isActive) {
                var selected: any[] = this.$scope.stakeConfig.oneClickStake.filter((e: any) => { return e.isActive == true; });
                if (selected.length > 0) {
                    if (this.$scope.lastSelectedIndex > -1) {
                        this.$scope.stakeConfig.oneClickStake[this.$scope.lastSelectedIndex].isActive = false;
                    }
                    else {
                        selected[0].isActive = false;
                    }
                }
                model.isActive = true;
                this.$scope.lastSelectedIndex = index;
                this.saveOneClickStakeConfig();
            }
        }

        private saveOneClickStakeConfig(): void {
            this.userService.updateStakeConfig(this.$scope.stakeConfig)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
                        this.storeOneClickValueInStorage();
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
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

        private getAnnouncement(): void {
            this.settingService.getNotifications()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.$scope.announcement = response.data.join(' | ');
                        }
                    }
                }).finally(() => { this.playLottieForAnnoucement(); });

        }

        private downloadAPK(): void {
            this.commonDataService.downloadClientAPK();
        }

        // [0] eventid, [1] bf eventid, [2] eventtype
        private loadVideo(currentEventData: any): void {
            this.calculateIframeHeight();
            if (currentEventData && currentEventData.eventId) {
                this.videoService.getVideoByEvent(currentEventData.eventId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            if (response.data && response.data.streamName) {
                                this.$scope.bf_video = undefined;
                                response.data.bfEventId = currentEventData.bfEventId;
                                this.$scope.wcs_video = response.data;
                            }
                        }
                    });
            }
        }

        private getVideoOptions(): any {
            this.calculateIframeHeight();
            this.$scope.bf_video = undefined;
            this.$scope.wcs_video = undefined;

            if (this.$scope.currentEventData && this.$scope.currentEventData.eventId) {
                this.videoService.getVideoByEvent(this.$scope.currentEventData.eventId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            if (response.data && response.data.streamName) {
                                response.data.bfEventId = this.$scope.currentEventData.bfEventId;
                                this.$scope.wcs_video = response.data;
                            }
                        }
                    });
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
                        this.$scope.searchEventList = response.data;
                    });
                }

            } else {
                if (this.$scope.searchEventList) this.$scope.searchEventList.splice(0);
            }
        }

        private eventSelected(e: any, justClear: boolean = false): void {
            this.$scope.searchEvent = '';
            if (this.$scope.searchEventList) this.$scope.searchEventList.splice(0);
            if (!justClear) {
                if (e.eventType.id == this.settings.HorseRacingId || e.eventType.id == this.settings.HorseRacingId) {
                    this.$state.go('mobile.base.horsemarket',
                        { eventtype: e.eventType.id, marketid: e.id });
                }
                else {
                    this.$state.go('mobile.base.market', { marketid: e.id });
                }
            }
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

        private openStakeConfigModal(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'Chips Setting';
            modal.data = this.$scope.stakeConfig;
            modal.size = 'md';
            modal.bodyUrl = this.settings.ThemeName + '/home/account/stake-config-modal.html';
            modal.controller = 'stakeConfigModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private aiprediction() {
            this.toasterService.showToast(common.helpers.ToastType.Error, "Exciting news! Our Betting AI Prediction feature is almost ready, providing accurate real-time insights to optimize your betting strategies. Stay tuned for its release!", 5000);
        }

        // dimd2 special
        private openChild(item: any, parentId: any = null, eventTypeId: any = null): void {
            item.isOpen = !item.isOpen;
            if (item.isOpen) {
                if (item.sportNodeType == common.enums.SportNodeType.EventType) {
                    if (item.isRace) {
                        this.marketOddsService.getRaceMarketList(item.id)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    item.child = response.data;
                                }
                            });
                    }
                    else {
                        this.eventService.searchCometition(item.id)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    item.child = response.data;
                                }
                            });
                    }
                }
                else if (item.sportNodeType == common.enums.SportNodeType.Competition) {
                    this.eventService.searchEventByCompetition(eventTypeId, item.id)
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                item.child = response.data;
                            }
                        });
                }

                //var url = 'mobile.base.market';

                //var model: any = { nodetype: item.sportNodeType, id: item.id, eventTypeId: eventTypeId };
                //if (item.isRace) {
                //    url = 'base.home.sport.upcomingrace';
                //    if (!item.sportNodeType) {
                //        model.marketid = item.id;
                //        model.nodetype = 1;
                //        model.id = eventTypeId;
                //    }
                //}
                
                //else if (item.sportNodeType == common.enums.SportNodeType.Event) {
                //    url = 'mobile.base.market';
                //    model.eventId = item.id;
                //}

                //this.$state.go(url, model);
            }

        }

        private openBetsModal() {
            var modal = new common.helpers.CreateModal();
            modal.header = 'Open Bets';
            modal.bodyUrl = this.settings.ThemeName + '/mobile/open-bets-modal.html';
            modal.controller = 'openBetsModalCtrl';
            modal.options.actionButton = '';
            modal.options.closeButton = '';
            modal.options.showFooter = false;
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

    }
    angular.module('intranet.mobile').controller('mobileBaseCtrl', MobileBaseCtrl);
}