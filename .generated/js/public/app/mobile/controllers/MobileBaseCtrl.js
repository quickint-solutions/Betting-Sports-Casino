var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class MobileBaseCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, localStorageHelper, settings, eventTypeService, commonDataService, userService, languageService, translationService, accountService, modalService, $sce, isMobile, $state, websiteService, marketOddsService, eventService, $rootScope, settingService, $timeout, videoService, marketService, exposureService, $filter, cryptoService, $location) {
                super($scope);
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
                this.$sce = $sce;
                this.isMobile = isMobile;
                this.$state = $state;
                this.websiteService = websiteService;
                this.marketOddsService = marketOddsService;
                this.eventService = eventService;
                this.$rootScope = $rootScope;
                this.settingService = settingService;
                this.$timeout = $timeout;
                this.videoService = videoService;
                this.marketService = marketService;
                this.exposureService = exposureService;
                this.$filter = $filter;
                this.cryptoService = cryptoService;
                this.$location = $location;
                if (this.settings.ThemeName == "dimd") {
                    document.body.style.width = "100%";
                    document.body.style.height = "100%";
                    document.body.style["position"] = "absolute";
                }
                if (this.isMobile.any) {
                    jQuery('body').addClass('mobile-bg');
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
            calculateIframeHeight() {
                var body = document.getElementsByTagName('body')[0];
                this.$scope.iframeHeight = (body.clientWidth / 1.77);
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
            initScopeValues() {
                this.$scope.timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
                this.$scope.lastSelectedIndex = -1;
                this.$scope.oneClickEnable = false;
                var oneclick = this.localStorageHelper.get(this.settings.OneClickConfig);
                if (oneclick && math.number(oneclick) > 0) {
                    this.$scope.oneClickEnable = true;
                }
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
                this.$scope.imagePath = this.settings.ImagePath;
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
                this.$scope.currentWebApp = this.settings.WebApp;
            }
            loadInitialData() {
                if (this.settings.ThemeName == 'sports') {
                    this.getPGDetail();
                }
                if (this.settings.IsLMTAvailable) {
                    this.commonDataService.setLMTScript();
                }
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
            getPGDetail() {
                this.websiteService.getPGInfo()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.isEnabledCrypto = response.data.isEnabledCrypto;
                    }
                });
            }
            openChat() { this.commonDataService.openChatWindow(); }
            openTermsForClient() {
                this.commonDataService.showLotusFooterMsg(this.$scope, 7).then(() => {
                    this.commonDataService.showLotusFooterMsg(this.$scope, 5).then(() => {
                        this.commonDataService.showLotusFooterMsg(this.$scope, 6).then(() => {
                            this.userService.firstLoginDone();
                        });
                    });
                });
            }
            loadWebsiteDetail() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
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
            isContain(path) {
                return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
            }
            isActiveState(st) {
                return this.$state.current.name == st;
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
            oneClickToggle(click) {
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
            getAnnouncement() {
                this.settingService.getNotifications()
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.$scope.announcement = response.data.join(' | ');
                        }
                    }
                }).finally(() => { this.playLottieForAnnoucement(); });
            }
            downloadAPK() {
                this.commonDataService.downloadClientAPK();
            }
            loadVideo(currentEventData) {
                this.calculateIframeHeight();
                if (currentEventData && currentEventData.eventId) {
                    this.videoService.getVideoByEvent(currentEventData.eventId)
                        .success((response) => {
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
                        this.$state.go('mobile.base.horsemarket', { eventtype: e.eventType.id, marketid: e.id });
                    }
                    else {
                        this.$state.go('mobile.base.market', { marketid: e.id });
                    }
                }
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
            openStakeConfigModal() {
                var modal = new intranet.common.helpers.CreateModal();
                modal.header = 'Chips Setting';
                modal.data = this.$scope.stakeConfig;
                modal.size = 'md';
                modal.bodyUrl = this.settings.ThemeName + '/home/account/stake-config-modal.html';
                modal.controller = 'stakeConfigModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults);
            }
            aiprediction() {
                this.toasterService.showToast(intranet.common.helpers.ToastType.Error, "Exciting news! Our Betting AI Prediction feature is almost ready, providing accurate real-time insights to optimize your betting strategies. Stay tuned for its release!", 5000);
            }
            openChild(item, parentId = null, eventTypeId = null) {
                item.isOpen = !item.isOpen;
                if (item.isOpen) {
                    if (item.sportNodeType == 1) {
                        if (item.isRace) {
                            this.marketOddsService.getRaceMarketList(item.id)
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
                }
            }
            openBetsModal() {
                var modal = new intranet.common.helpers.CreateModal();
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
        mobile.MobileBaseCtrl = MobileBaseCtrl;
        angular.module('intranet.mobile').controller('mobileBaseCtrl', MobileBaseCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileBaseCtrl.js.map