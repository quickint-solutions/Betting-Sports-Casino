module intranet.home {
    export interface IHomeScope extends intranet.common.IScopeBase {
        stakeConfig: any;
        lastSelectedIndex: number;
        selectedBetTab: number;
        shown_OneClickWarning: boolean;

        isVideoActive: boolean;
        videoExpanded: boolean;

        bf_video: any;
        wcs_video: any;

        needsToHideRightSide: boolean;
        needsToHideCasino: boolean;

        popularMarkets: any[];

        dimdViewType: any;

        homeOriginalGamesSwiper: any;
        homeAuraGamesSwiper: any;
        homeVimplayGamesSwiper: any;
    }

    export class HomeCtrl extends intranet.common.ControllerBase<IHomeScope>
        implements intranet.common.init.IInit {
        constructor($scope: IHomeScope,
            private toasterService: intranet.common.services.ToasterService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private userService: services.UserService,
            private settings: common.IBaseSettings,
            private marketOddsService: services.MarketOddsService,
            private eventService: services.EventService,
            private $timeout: any,
            protected $rootScope: any,
            private $window: any,
            private $state: ng.ui.IStateService,
            public commonDataService: common.services.CommonDataService,
            private $sce: any,
            private videoService: services.VideoService) {
            super($scope);

            var listenEvent = this.$scope.$on('event-changed', (event, data) => {
                this.loadVideo(data);
            });
            var stateWatcher = this.$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
                this.checkState(toState.name);
                if (fromState.name == 'base.home.sport.fullmarket') { this.setSwiperForSports(); }
            });
            this.$scope.$on('$destroy', () => {
                stateWatcher();
                listenEvent();
            });

            super.init(this);
        }

        public initScopeValues() {
            this.$scope.lastSelectedIndex = -1;
            this.$scope.selectedBetTab = 0;
            this.$scope.isVideoActive = false;
            this.$scope.videoExpanded = false;
            this.$scope.needsToHideRightSide = false;
            this.$scope.popularMarkets = [];

            this.$scope.dimdViewType = 1;// 1=home,2=fullmarket,3=account

            this.checkState(this.$state.current.name);
        }

        public loadInitialData() {
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

        private playSliders() {
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

        private checkState(name: string): void {
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
                } else { this.$scope.needsToHideRightSide = false; }
                if (name == 'base.home.sport.fullmarket') { this.$scope.needsToHideCasino = true; }
                else { this.$scope.needsToHideCasino = false; }
            }
        }

        private checkOneClickWarning(): void {
            var warningShown = this.localStorageHelper.get(this.settings.ShownOneClickWarning);
            if (warningShown) {
                this.$scope.shown_OneClickWarning = true;
            }
            else { this.$scope.shown_OneClickWarning = false; }
        }

        private hideOneClickWarning(): void {
            this.$scope.shown_OneClickWarning = true;
            this.localStorageHelper.set(this.settings.ShownOneClickWarning, 'true');
        }

        private loadStakeConfig(): void {
            var result = this.localStorageHelper.get(this.settings.StakeConfig);
            if (result) { this.$scope.stakeConfig = result; }
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

        private storeOneClickValueInStorage(): void {
            var selected: any[] = this.$scope.stakeConfig.oneClickStake.filter((e: any) => { return e.isActive == true; });
            this.localStorageHelper.set(this.settings.OneClickConfig, selected[0].stake);
        }

        private openVideo(): void {
            var url = this.$state.href('glctv');
            this.$window.open(this.$sce.trustAsUrl(url), "Video Container", "width=800,height=350,left=400,top=150");
        }


        // [0] eventid, [1] bf eventid, [2] eventtype
        private loadVideo(currentEventData: any): void {
            this.$scope.bf_video = undefined;
            this.$scope.isVideoActive = false;
            this.$scope.wcs_video = '';

            if (currentEventData && currentEventData.eventId) {
                this.videoService.getVideoByEvent(currentEventData.eventId)
                    .success((response: common.messaging.IResponse<any>) => {
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

        private setStream(source: any): void {
            this.$scope.wcs_video = source;
        }


        // BBB sport tree click
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

                var url = 'base.home.sport.market';

                var model: any = { nodetype: item.sportNodeType, id: item.id, eventTypeId: eventTypeId };

                if (item.isRace) {
                    url = 'base.home.sport.upcomingrace';
                    if (!item.sportNodeType) {
                        model.marketid = item.id;
                        model.nodetype = 1;
                        model.id = eventTypeId;
                    }
                }

                else if (item.sportNodeType == common.enums.SportNodeType.Event) {
                    url = 'base.home.sport.fullmarket';
                    model.eventId = item.id;
                }

                if (this.settings.ThemeName == 'dimd2' && item.isRace) { } else {
                    this.$state.go(url, model);
                }
            }

        }

        // sportsexch
        private loadEventTypes(): void {
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                var filters = value;
                if (filters.length > 0) {
                    filters = filters.filter((a: any) => { return a.id != this.settings.HorseRacingId && a.id != this.settings.GreyhoundId; });
                    filters.forEach((a: any) => { a.checked = true; });
                    this.loadPopularMarkets(10, filters);
                }
            });
        }

        private loadPopularMarkets(marketCount: any, filters: any[]): void {
            var model = { top: marketCount, eventTypeIds: [] };
            filters.forEach((a: any) => { if (a.checked) { model.eventTypeIds.push(a.id); } });
            this.marketOddsService.getPopularMarkets(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data && response.data.length > 0) {
                            response.data.forEach((mr: any) => {
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

        private setSwiperForSports(): void {
            this.$timeout(() => {
                var bannersSwiper = new Swiper('#banners', {
                    loop: true,
                    speed: 1200,
                    autoplay: { delay: 4000, disableOnInteraction: false },
                    autoHeight: true,
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
                    // If we need pagination
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    // Navigation arrows
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                })
                var homeBigWinsSwiper = new Swiper('#homeBigWinsSwiper', {
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
                var originalGamesConfig = {
                    slidesPerView: 'auto',
                    spaceBetween: 10,
                    freeMode: true,
                    grabCursor: true,
                    loop: false,
                };
                var homeOrigSwiper = new Swiper('#homeOriginalGamesSwiper', originalGamesConfig);
                var homeAuraSwiper = new Swiper('#homeAuraGamesSwiper', originalGamesConfig);
                var homeVimplaySwiper = new Swiper('#homeVimplayGamesSwiper', originalGamesConfig);
                this.$scope.homeOriginalGamesSwiper = homeOrigSwiper;
                this.$scope.homeAuraGamesSwiper = homeAuraSwiper;
                this.$scope.homeVimplayGamesSwiper = homeVimplaySwiper;

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
                    if (btns.length === 0 && section === 'original-games-section') {
                        btns = document.querySelectorAll('.original-games-section:not(.aura-games-section):not(.vimplay-games-section) .ogs-nav-btn');
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
                bindNav(homeOrigSwiper, 'original-games-section');
                bindNav(homeAuraSwiper, 'aura-games-section');
                bindNav(homeVimplaySwiper, 'vimplay-games-section');
            }, 100);
        }

    }

    angular.module('intranet.home').controller('homeCtrl', HomeCtrl);
}