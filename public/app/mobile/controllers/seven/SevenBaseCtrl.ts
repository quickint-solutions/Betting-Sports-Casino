module intranet.mobile {
    export interface ISevenBaseScope extends intranet.common.IScopeBase {
        stakeConfig: any;
        lastSelectedIndex: number;
        oneClickEnable: boolean;
        activeOneClickStake: any;
        currentWebApp: string;

        isVideoOn: boolean;
        channelUrl: string;
        webImagePath: any;
        imagePath: any;

        timezone: any;
        selectedTimezone: any;
        currentDate: any;

        eventTypes: any[];
        eventTypesConfig: any[]
        isBetInProcess: boolean;
        betDelay: any;
        offerList: any[];

        languageList: any[];
        selectedLanguage: any;
        balanceInfo: any;
        user: any;

        announcement: string;
        bf_video: any;
        currentEventData: any;

        hasAPK: boolean;
        wcs_video: any;
        liveGamesId: any;
        hasCasino: boolean;
        hasFairTrade: boolean;
        iframeHeight: any;

        supportDetail: any;
        generalLoader: any;
        loadderTemplate: any;
        footerTemplate: any;

        leftMenuOpen: boolean;
        rightMenuOpen: boolean;
        anyMenuOpen: boolean;

        promiseItem: any;
        searchEvent: any;
        searchEventList: any;
        isPromoSite: any;

        isB2C: any;
        hasReferral: any;
        isChatEnabled: boolean;
    }

    export class SevenBaseCtrl extends intranet.common.ControllerBase<ISevenBaseScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISevenBaseScope,
            private offerService: services.OfferService,
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
            private settingService: services.SettingService,
            private videoService: services.VideoService,
            private marketService: services.MarketService,
            private marketOddsService: services.MarketOddsService,
            private eventService: services.EventService,
            private $sce: any,
            private $window: any,
            private $state: any,
            private $interval: any,
            protected $rootScope: any,
            private $timeout: ng.ITimeoutService,
            private websiteService: services.WebsiteService,
            private exposureService: services.ExposureService,
            private $location: any) {
            super($scope);

            this.$scope.liveGamesId = this.settings.LiveGamesId;

            this.commonDataService.setBackground();

            jQuery('body').addClass('cbg');
            jQuery('body').addClass('mobilebody');
            document.getElementById("main-wrapper").setAttribute("class", "mobile-top");
            document.body.style.position = "fixed";


            if (this.settings.ThemeName == 'bking') {
                document.body.style.width = "100%";
                document.body.style.height = "100%";
            }

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
            });

            var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => {
                this.betProcessStarted(data);
            });
            var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => {
                this.betProcessComplete(data.marketId);
            });

            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    this.getBalance();
                    this.getExposure();
                }
            });

            var wsListnerAnnouncement = this.$rootScope.$on("ws-announcement-changed", (event, response) => {
                if (response.success) {
                    this.getAnnouncement();
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

            var currenttime = null;
            if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                currenttime = this.$interval(() => {
                    this.$scope.currentDate = new Date();
                }, 1000);
            }
            var scrollRegistry = this.$rootScope.$on('$stateChangeStart', () => {
                if (this.settings.ThemeName == 'bking') { this.registerBkingScroll(); }
            });

            this.$scope.$on('$destroy', () => {
                listenEvent();
                refreshBalance();
                place_bet_started();
                place_bet_ended();
                wsListner();
                wsListnerAnnouncement();
                wsListnerBalance();
                scrollRegistry();
                if (currenttime) { this.$interval.cancel(currenttime); } wsListnerDeposit();
                wsListnerWithdrawal();
            });

            super.init(this);
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

        private timezoneChanged(value: any): void {
            this.$scope.selectedTimezone = value;
            this.$rootScope.timezone = value.replace(':', '');
        }

        public initScopeValues() {
            this.$scope.timezone = common.helpers.CommonHelper.getTimeZone();
            this.$scope.selectedTimezone = this.$scope.timezone;
            this.$rootScope.timezone = common.helpers.CommonHelper.getTimeZone();
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            this.$scope.hasAPK = this.settings.HasAPK;
            this.$scope.currentWebApp = this.settings.WebApp;
            this.$scope.imagePath = this.settings.ImagePath;
            this.$scope.footerTemplate = this.settings.ThemeName + '/template/mobile-footer.html';

            this.$scope.lastSelectedIndex = -1;
            this.$scope.oneClickEnable = false;
            var oneclick = this.localStorageHelper.get(this.settings.OneClickConfig);
            if (oneclick && math.number(oneclick) > 0) { this.$scope.oneClickEnable = true; this.$scope.activeOneClickStake = oneclick; }
            this.$rootScope.highlightOnOddsChange = true;
            this.$rootScope.displayOneClick = false;
            this.$scope.isVideoOn = false;
            this.$scope.eventTypesConfig = [];
            this.$scope.isBetInProcess = false;
            this.$scope.loadderTemplate = this.commonDataService.mobile_market_loader_template;
            this.$scope.generalLoader = this.commonDataService.mobilePromisetracker;

            this.$scope.leftMenuOpen = false;
            this.$scope.rightMenuOpen = false;
            this.$scope.anyMenuOpen = false;
            this.$scope.supportDetail = {};
            this.$scope.searchEventList = [];
            this.$scope.isPromoSite = common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp);

            this.$scope.isChatEnabled = this.commonDataService.isChatActive();
        }

        public loadInitialData() {
            // if (this.settings.IsFirstLogin == true) { this.openTermsForClient(); }
            if (this.settings.ThemeName == 'bking') {
                this.registerBkingScroll();
            }
            this.getOffers();
            this.loadWebsiteDetail();
            this.loadStakeConfig();
            this.loadEventTypes();
            this.getBetConfig();
            this.getLanguages();
            this.getBalance();
            this.getUserData();
            this.getAnnouncement();
            this.getExposure();

            if (this.settings.IsLMTAvailable) {
                this.commonDataService.setLMTScript();
            }

            this.commonDataService.initFreshchat();
        }

        private openChat() { this.commonDataService.openChatWindow(); }

        private registerBkingScroll(): void {
            this.$timeout(() => {
                var dd = jQuery('.center-mobile');
                if (dd) {
                    jQuery('.header').removeClass('scrolled');

                    //jQuery('.center-mobile').removeClass('scrolled'); 
                    dd.on('scroll', function (e: any) {
                        if (this.scrollTop > 70) {
                            jQuery('.header').addClass('scrolled');
                            //jQuery('.center-mobile').addClass('scrolled');
                        } else {
                            jQuery('.header').removeClass('scrolled');
                            //jQuery('.center-mobile').removeClass('scrolled'); 
                        }
                    });
                }
            }, 500);
        }

        private openMenu(e: any, isLeft: boolean): void {
            e.stopPropagation();
            if (this.$scope.anyMenuOpen) {
                this.centerClick(e);
            }
            else {
                if (isLeft) { this.$scope.leftMenuOpen = true; }
                else { this.$scope.rightMenuOpen = true; }
                this.$scope.anyMenuOpen = true;
            }
        }

        private centerClick(e: any): void {
            e.stopPropagation();
            if (this.$scope.leftMenuOpen || this.$scope.rightMenuOpen) {
                this.$scope.anyMenuOpen = false;
                this.$scope.leftMenuOpen = false;
                this.$scope.rightMenuOpen = false;
            }
        }

        private loadWebsiteDetail(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        this.$scope.hasCasino = data.hasCasino;
                        this.$scope.hasFairTrade = data.hasTradefair;
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

        private isActiveBool(path: string): boolean {
            return (this.$location.$$url == path) ? true : false;
        }

        private isContain(path: string): string {
            return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
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

        private oneClickToggle(): void {
            //this.$scope.oneClickEnable = !this.$scope.oneClickEnable;
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
                    this.$scope.activeOneClickStake = selected[0].stake;
                    this.localStorageHelper.set(this.settings.OneClickConfig, selected[0].stake);
                }
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


        private getAnnouncement(): void {
            this.settingService.getNotifications()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.$scope.announcement = response.data.join(' | ');
                        } else {
                            this.$scope.announcement = undefined;
                        }
                    }
                });
        }

        private downloadAPK(): void {
            this.commonDataService.downloadClientAPK();
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

        private calculateIframeHeight(): void {
            var body = document.getElementsByTagName('body')[0];
            this.$scope.iframeHeight = (body.clientWidth / 1.77);
        }

        private changePassword(): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'profile.password.change.modal.header';
            modal.data = {
                userId: this.$scope.user.id
            };

            modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
            modal.controller = 'changePasswordModalCtrl';
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }

        private openRules(): void {
            this.commonDataService.openWebsiteRules();
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

        private openTermsForClient(): void {
            this.commonDataService.showLotusFooterMsg(this.$scope, 7).then(() => {
                this.commonDataService.showLotusFooterMsg(this.$scope, 5).then(() => {
                    this.commonDataService.showLotusFooterMsg(this.$scope, 6).then(() => {
                        this.userService.firstLoginDone();
                    });
                });
            });
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
                    this.$state.go('mobile.seven.base.racemarket',
                        { eventtype: e.eventType.id, marketid: e.id });
                }
                else {
                    this.$state.go('mobile.seven.base.market', { eventId: e.event.id });
                }
            }
        }

        // BBB sport tree click
        private openChild(item: any, parentId: any = null, eventTypeId: any = null): void {
            item.isOpen = !item.isOpen;
            if (item.isOpen) {
                this.$scope.leftMenuOpen = false;
                if (item.sportNodeType == common.enums.SportNodeType.EventType) {
                    if (item.isRace) {
                        this.marketOddsService.getRaceMarketList(item.id)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    item.child = response.data;
                                }
                            });
                    }
                    else if (item.isLiveGame) {
                        this.eventService.searchGames(item.id)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    item.child = response.data;
                                }
                            });
                    } else {
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

                var url = 'mobile.seven.base.highlight';

                var model: any = { nodetype: item.sportNodeType, id: item.id, eventTypeId: eventTypeId };
                if (item.isRace) {
                    url = 'mobile.seven.base.racemarket';
                    model.eventtype = eventTypeId;
                    model.marketid = '';
                    if (!item.sportNodeType) {
                        model.marketid = item.id;
                    }
                }
                else if (item.isLiveGame) {
                    if (item.sportNodeType == common.enums.SportNodeType.EventType) {
                        url = 'mobile.seven.base.livegamehighlight';
                    }
                    if (item.sportNodeType == common.enums.SportNodeType.Event) {
                        url = 'mobile.seven.base.livegamesmarket';
                        model.id = eventTypeId;
                        model.eventid = item.id;
                    }
                }
                else if (item.sportNodeType == common.enums.SportNodeType.Event) {
                    url = 'mobile.seven.base.market';
                    model.eventId = item.id;
                }

                this.$state.go(url, model);
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

        private playAudio(): void {
            var audio = new Audio('audio/dw-client.mp3');
            audio.play();
        }

        private openDeposit() { this.$state.go('mobile.seven.base.transferonline', { tab: 5 }); }
    }
    angular.module('intranet.mobile').controller('sevenBaseCtrl', SevenBaseCtrl);
}