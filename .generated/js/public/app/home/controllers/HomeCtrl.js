var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class HomeCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, localStorageHelper, userService, settings, marketOddsService, eventService, $timeout, $rootScope, $window, $state, commonDataService, $sce, videoService) {
                super($scope);
                this.toasterService = toasterService;
                this.localStorageHelper = localStorageHelper;
                this.userService = userService;
                this.settings = settings;
                this.marketOddsService = marketOddsService;
                this.eventService = eventService;
                this.$timeout = $timeout;
                this.$rootScope = $rootScope;
                this.$window = $window;
                this.$state = $state;
                this.commonDataService = commonDataService;
                this.$sce = $sce;
                this.videoService = videoService;
                var listenEvent = this.$scope.$on('event-changed', (event, data) => {
                    this.loadVideo(data);
                });
                var stateWatcher = this.$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
                    this.checkState(toState.name);
                    if (fromState.name == 'base.home.sport.fullmarket') {
                        this.setSwiperForSports();
                    }
                });
                this.$scope.$on('$destroy', () => {
                    stateWatcher();
                    listenEvent();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.lastSelectedIndex = -1;
                this.$scope.selectedBetTab = 0;
                this.$scope.isVideoActive = false;
                this.$scope.videoExpanded = false;
                this.$scope.needsToHideRightSide = false;
                this.$scope.popularMarkets = [];
                this.$scope.dimdViewType = 1;
                this.checkState(this.$state.current.name);
            }
            loadInitialData() {
                this.loadStakeConfig();
                this.checkOneClickWarning();
                if (this.settings.ThemeName == 'sports') {
                    this.setSwiperForSports();
                    this.loadEventTypes();
                }
                if (this.settings.ThemeName == 'dimd2') {
                    this.loadEventTypes();
                    this.playSliders();
                }
            }
            playSliders() {
                waitForElement('.upcoming-fixure .carousel-inner', function () {
                    jQuery('.upcoming-fixure .carousel-inner').not('.slick-initialized').slick({
                        vertical: true,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 2000,
                        infinite: true,
                        easing: 'linear',
                    });
                }, true);
                waitForElement('.home-casiono-icons .hooper-track', function () {
                    jQuery('.home-casiono-icons .hooper-track').not('.slick-initialized').slick({
                        vertical: true,
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 3000,
                        infinite: true,
                        easing: 'linear',
                        verticalSwiping: true,
                        arrows: false,
                    });
                }, true);
            }
            checkState(name) {
                if (this.settings.ThemeName == 'dimd2') {
                    var homeList = ['base.home', 'base.home.sport', 'base.home.sport.upcomingrace', 'base.home.sport.market'];
                    if (homeList.indexOf(name) >= 0) {
                        this.$scope.dimdViewType = 1;
                        this.playSliders();
                    }
                    var marketList = ['base.home.sport.upcomingrace', 'base.home.sport.fullmarket'];
                    if (marketList.indexOf(name) >= 0) {
                        this.$scope.dimdViewType = 2;
                    }
                    if (name.indexOf('base.home.account') >= 0 || name.indexOf('base.home.casino') >= 0
                        || name.indexOf('base.home.livegames') >= 0 || name.indexOf('base.home.slotcasino') >= 0) {
                        this.$scope.dimdViewType = 3;
                    }
                }
                else {
                    if (name == 'base.home' || name == 'base.home.sport.market' || name.indexOf('base.home.account') > -1) {
                        this.$scope.needsToHideRightSide = true;
                    }
                    else {
                        this.$scope.needsToHideRightSide = false;
                    }
                    if (name == 'base.home.sport.fullmarket') {
                        this.$scope.needsToHideCasino = true;
                    }
                    else {
                        this.$scope.needsToHideCasino = false;
                    }
                }
            }
            checkOneClickWarning() {
                var warningShown = this.localStorageHelper.get(this.settings.ShownOneClickWarning);
                if (warningShown) {
                    this.$scope.shown_OneClickWarning = true;
                }
                else {
                    this.$scope.shown_OneClickWarning = false;
                }
            }
            hideOneClickWarning() {
                this.$scope.shown_OneClickWarning = true;
                this.localStorageHelper.set(this.settings.ShownOneClickWarning, 'true');
            }
            loadStakeConfig() {
                var result = this.localStorageHelper.get(this.settings.StakeConfig);
                if (result) {
                    this.$scope.stakeConfig = result;
                }
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
            storeOneClickValueInStorage() {
                var selected = this.$scope.stakeConfig.oneClickStake.filter((e) => { return e.isActive == true; });
                this.localStorageHelper.set(this.settings.OneClickConfig, selected[0].stake);
            }
            openVideo() {
                var url = this.$state.href('glctv');
                this.$window.open(this.$sce.trustAsUrl(url), "Video Container", "width=800,height=350,left=400,top=150");
            }
            loadVideo(currentEventData) {
                this.$scope.bf_video = undefined;
                this.$scope.isVideoActive = false;
                this.$scope.wcs_video = '';
                if (currentEventData && currentEventData.eventId) {
                    this.videoService.getVideoByEvent(currentEventData.eventId)
                        .success((response) => {
                        if (response.success) {
                            if (response.data && response.data.streamName) {
                                this.$scope.bf_video = undefined;
                                this.$scope.isVideoActive = true;
                                this.$scope.videoExpanded = true;
                                response.data.bfEventId = currentEventData.bfEventId;
                                this.setStream(response.data);
                            }
                        }
                    });
                }
            }
            setStream(source) {
                this.$scope.wcs_video = source;
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
                    var url = 'base.home.sport.market';
                    var model = { nodetype: item.sportNodeType, id: item.id, eventTypeId: eventTypeId };
                    if (item.isRace) {
                        url = 'base.home.sport.upcomingrace';
                        if (!item.sportNodeType) {
                            model.marketid = item.id;
                            model.nodetype = 1;
                            model.id = eventTypeId;
                        }
                    }
                    else if (item.sportNodeType == 4) {
                        url = 'base.home.sport.fullmarket';
                        model.eventId = item.id;
                    }
                    if (this.settings.ThemeName == 'dimd2' && item.isRace) { }
                    else {
                        this.$state.go(url, model);
                    }
                }
            }
            loadEventTypes() {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    var filters = value;
                    if (filters.length > 0) {
                        filters = filters.filter((a) => { return a.id != this.settings.HorseRacingId && a.id != this.settings.GreyhoundId; });
                        filters.forEach((a) => { a.checked = true; });
                        this.loadPopularMarkets(10, filters);
                    }
                });
            }
            loadPopularMarkets(marketCount, filters) {
                var model = { top: marketCount, eventTypeIds: [] };
                filters.forEach((a) => { if (a.checked) {
                    model.eventTypeIds.push(a.id);
                } });
                this.marketOddsService.getPopularMarkets(model)
                    .success((response) => {
                    if (response.success) {
                        if (response.data && response.data.length > 0) {
                            response.data.forEach((mr) => {
                                mr.eventTypeName = this.commonDataService.getEventTypeName(mr.event.eventType.id);
                                mr.eventTypeSourceId = this.commonDataService.getEventTypeSourceId(mr.event.eventType.id);
                                mr.hasVideo = mr.event.videoId ? true : false;
                                mr.hasFancy = mr.event.hasFancy ? true : false;
                            });
                            this.$scope.popularMarkets = response.data;
                        }
                    }
                });
            }
            setSwiperForSports() {
                this.$timeout(() => {
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
                    var homeBigWinsSwiper = new Swiper('#homeBigWinsSwiper', {
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
        }
        home.HomeCtrl = HomeCtrl;
        angular.module('intranet.home').controller('homeCtrl', HomeCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=HomeCtrl.js.map