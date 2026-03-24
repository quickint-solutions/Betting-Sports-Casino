var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class SevenBaseCtrl extends intranet.common.ControllerBase {
            constructor($scope, offerService, toasterService, localStorageHelper, settings, eventTypeService, commonDataService, userService, languageService, translationService, accountService, modalService, settingService, videoService, marketService, marketOddsService, eventService, $sce, $window, $state, $interval, $rootScope, $timeout, websiteService, exposureService, $location) {
                super($scope);
                this.offerService = offerService;
                this.toasterService = toasterService;
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                this.eventTypeService = eventTypeService;
                this.commonDataService = commonDataService;
                this.userService = userService;
                this.languageService = languageService;
                this.translationService = translationService;
                this.accountService = accountService;
                this.modalService = modalService;
                this.settingService = settingService;
                this.videoService = videoService;
                this.marketService = marketService;
                this.marketOddsService = marketOddsService;
                this.eventService = eventService;
                this.$sce = $sce;
                this.$window = $window;
                this.$state = $state;
                this.$interval = $interval;
                this.$rootScope = $rootScope;
                this.$timeout = $timeout;
                this.websiteService = websiteService;
                this.exposureService = exposureService;
                this.$location = $location;
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
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Info, response.data, 10000);
                    this.playAudio();
                });
                var wsListnerWithdrawal = this.$rootScope.$on("ws-withdrawal-request-confirm", (event, response) => {
                    this.toasterService.showToast(intranet.common.helpers.ToastType.Warning, response.data, 10000);
                    this.playAudio();
                });
                var currenttime = null;
                if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                    currenttime = this.$interval(() => {
                        this.$scope.currentDate = new Date();
                    }, 1000);
                }
                var scrollRegistry = this.$rootScope.$on('$stateChangeStart', () => {
                    if (this.settings.ThemeName == 'bking') {
                        this.registerBkingScroll();
                    }
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
                    if (currenttime) {
                        this.$interval.cancel(currenttime);
                    }
                    wsListnerDeposit();
                    wsListnerWithdrawal();
                });
                super.init(this);
            }
            betProcessStarted(data) {
                this.$scope.betDelay = -1;
                var delays = this.$scope.eventTypesConfig.filter((e) => { return e.eventTypeId == data.eventTypeId; });
                var winning_delay = 0;
                if (delays.length > 0 && (data.bettingType == intranet.common.enums.BettingType.ODDS || data.bettingType == intranet.common.enums.BettingType.BM)) {
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
                                startdelay();
                            }, 1200);
                        }
                        else {
                            stopdelay();
                        }
                    });
                    this.$timeout(() => { startdelay(); }, 1000);
                }
                this.$scope.isBetInProcess = true;
                this.commonDataService.BetProcessStarted(data.marketId);
            }
            betProcessComplete(marketId) {
                this.commonDataService.BetProcessComplete(marketId);
                this.$scope.isBetInProcess = false;
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
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
                this.$scope.hasAPK = this.settings.HasAPK;
                this.$scope.currentWebApp = this.settings.WebApp;
                this.$scope.imagePath = this.settings.ImagePath;
                this.$scope.footerTemplate = this.settings.ThemeName + '/template/mobile-footer.html';
                this.$scope.lastSelectedIndex = -1;
                this.$scope.oneClickEnable = false;
                var oneclick = this.localStorageHelper.get(this.settings.OneClickConfig);
                if (oneclick && math.number(oneclick) > 0) {
                    this.$scope.oneClickEnable = true;
                    this.$scope.activeOneClickStake = oneclick;
                }
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
                this.$scope.isPromoSite = intranet.common.helpers.CommonHelper.isPromoWebsite(this.settings.WebApp);
                this.$scope.isChatEnabled = this.commonDataService.isChatActive();
            }
            loadInitialData() {
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
            openChat() { this.commonDataService.openChatWindow(); }
            registerBkingScroll() {
                this.$timeout(() => {
                    var dd = jQuery('.center-mobile');
                    if (dd) {
                        jQuery('.header').removeClass('scrolled');
                        dd.on('scroll', function (e) {
                            if (this.scrollTop > 70) {
                                jQuery('.header').addClass('scrolled');
                            }
                            else {
                                jQuery('.header').removeClass('scrolled');
                            }
                        });
                    }
                }, 500);
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
                    else {
                        this.$scope.rightMenuOpen = true;
                    }
                    this.$scope.anyMenuOpen = true;
                }
            }
            centerClick(e) {
                e.stopPropagation();
                if (this.$scope.leftMenuOpen || this.$scope.rightMenuOpen) {
                    this.$scope.anyMenuOpen = false;
                    this.$scope.leftMenuOpen = false;
                    this.$scope.rightMenuOpen = false;
                }
            }
            loadWebsiteDetail() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
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
            getExposure() {
                this.exposureService.getExposure()
                    .success((response) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
            }
            isActive(path) {
                return (this.$location.$$url == path) ? 'active' : '';
            }
            isActiveBool(path) {
                return (this.$location.$$url == path) ? true : false;
            }
            isContain(path) {
                return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
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
                    this.$scope.stakeConfig.inlineBet = true;
                    this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
                    this.$timeout(() => { this.$rootScope.$broadcast(this.settings.StakeConfig); }, 500);
                }
            }
            getBetConfig() {
                var luser = this.commonDataService.getLoggedInUserData();
                if (luser && luser.betConfigs) {
                    this.$scope.eventTypesConfig = luser.betConfigs;
                    this.commonDataService.setUserBetConfig(luser.betConfigs);
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
            oneClickToggle() {
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
                        this.$scope.activeOneClickStake = selected[0].stake;
                        this.localStorageHelper.set(this.settings.OneClickConfig, selected[0].stake);
                    }
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
                                .then((value) => {
                                if (value && value.length > 0) {
                                    value = value.filter((a) => { return a.displayOrder >= 0; });
                                }
                                this.$scope.eventTypes = value;
                            });
                        }
                    }
                });
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
                    }
                });
            }
            selectOneClickStake(index, model) {
                if (!model.isActive) {
                    var selected = this.$scope.stakeConfig.oneClickStake.filter((e) => { return e.isActive == true; });
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
            saveOneClickStakeConfig() {
                this.userService.updateStakeConfig(this.$scope.stakeConfig)
                    .success((response) => {
                    if (response.success) {
                        this.localStorageHelper.set(this.settings.StakeConfig, this.$scope.stakeConfig);
                        this.storeOneClickValueInStorage();
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
            }
            getAnnouncement() {
                this.settingService.getNotifications()
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.$scope.announcement = response.data.join(' | ');
                        }
                        else {
                            this.$scope.announcement = undefined;
                        }
                    }
                });
            }
            downloadAPK() {
                this.commonDataService.downloadClientAPK();
            }
            getVideoOptions() {
                this.calculateIframeHeight();
                this.$scope.bf_video = undefined;
                this.$scope.wcs_video = undefined;
                if (this.$scope.currentEventData && this.$scope.currentEventData.eventId) {
                    this.videoService.getVideoByEvent(this.$scope.currentEventData.eventId)
                        .success((response) => {
                        if (response.success) {
                            if (response.data && response.data.streamName) {
                                response.data.bfEventId = this.$scope.currentEventData.bfEventId;
                                this.$scope.wcs_video = response.data;
                            }
                        }
                    });
                }
            }
            calculateIframeHeight() {
                var body = document.getElementsByTagName('body')[0];
                this.$scope.iframeHeight = (body.clientWidth / 1.77);
            }
            changePassword() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'profile.password.change.modal.header';
                modal.data = {
                    userId: this.$scope.user.id
                };
                modal.bodyUrl = this.settings.ThemeName + '/home/account/change-password-modal.html';
                modal.controller = 'changePasswordModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            openRules() {
                this.commonDataService.openWebsiteRules();
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
            openTermsForClient() {
                this.commonDataService.showLotusFooterMsg(this.$scope, 7).then(() => {
                    this.commonDataService.showLotusFooterMsg(this.$scope, 5).then(() => {
                        this.commonDataService.showLotusFooterMsg(this.$scope, 6).then(() => {
                            this.userService.firstLoginDone();
                        });
                    });
                });
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
                            this.$scope.searchEventList = response.data;
                        });
                    }
                }
                else {
                    if (this.$scope.searchEventList)
                        this.$scope.searchEventList.splice(0);
                }
            }
            eventSelected(e, justClear = false) {
                this.$scope.searchEvent = '';
                if (this.$scope.searchEventList)
                    this.$scope.searchEventList.splice(0);
                if (!justClear) {
                    if (e.eventType.id == this.settings.HorseRacingId || e.eventType.id == this.settings.HorseRacingId) {
                        this.$state.go('mobile.seven.base.racemarket', { eventtype: e.eventType.id, marketid: e.id });
                    }
                    else {
                        this.$state.go('mobile.seven.base.market', { eventId: e.event.id });
                    }
                }
            }
            openChild(item, parentId = null, eventTypeId = null) {
                item.isOpen = !item.isOpen;
                if (item.isOpen) {
                    this.$scope.leftMenuOpen = false;
                    if (item.sportNodeType == 1) {
                        if (item.isRace) {
                            this.marketOddsService.getRaceMarketList(item.id)
                                .success((response) => {
                                if (response.success) {
                                    item.child = response.data;
                                }
                            });
                        }
                        else if (item.isLiveGame) {
                            this.eventService.searchGames(item.id)
                                .success((response) => {
                                if (response.success) {
                                    item.child = response.data;
                                }
                            });
                        }
                        else {
                            this.eventService.searchCometition(item.id)
                                .success((response) => {
                                if (response.success) {
                                    item.child = response.data;
                                }
                            });
                        }
                    }
                    else if (item.sportNodeType == 2) {
                        this.eventService.searchEventByCompetition(eventTypeId, item.id)
                            .success((response) => {
                            if (response.success) {
                                item.child = response.data;
                            }
                        });
                    }
                    var url = 'mobile.seven.base.highlight';
                    var model = { nodetype: item.sportNodeType, id: item.id, eventTypeId: eventTypeId };
                    if (item.isRace) {
                        url = 'mobile.seven.base.racemarket';
                        model.eventtype = eventTypeId;
                        model.marketid = '';
                        if (!item.sportNodeType) {
                            model.marketid = item.id;
                        }
                    }
                    else if (item.isLiveGame) {
                        if (item.sportNodeType == 1) {
                            url = 'mobile.seven.base.livegamehighlight';
                        }
                        if (item.sportNodeType == 4) {
                            url = 'mobile.seven.base.livegamesmarket';
                            model.id = eventTypeId;
                            model.eventid = item.id;
                        }
                    }
                    else if (item.sportNodeType == 4) {
                        url = 'mobile.seven.base.market';
                        model.eventId = item.id;
                    }
                    this.$state.go(url, model);
                }
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
            playAudio() {
                var audio = new Audio('audio/dw-client.mp3');
                audio.play();
            }
            openDeposit() { this.$state.go('mobile.seven.base.transferonline', { tab: 5 }); }
        }
        mobile.SevenBaseCtrl = SevenBaseCtrl;
        angular.module('intranet.mobile').controller('sevenBaseCtrl', SevenBaseCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SevenBaseCtrl.js.map