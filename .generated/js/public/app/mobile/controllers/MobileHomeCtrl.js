var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class MobileHomeCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, marketOddsService, offerService, $timeout, $rootScope, localStorageHelper, commonDataService, settings, eventService, betService, $state, modalService, placeBetDataService, toasterService, WSSocketService, $q) {
                super($scope);
                this.$stateParams = $stateParams;
                this.marketOddsService = marketOddsService;
                this.offerService = offerService;
                this.$timeout = $timeout;
                this.$rootScope = $rootScope;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.eventService = eventService;
                this.betService = betService;
                this.$state = $state;
                this.modalService = modalService;
                this.placeBetDataService = placeBetDataService;
                this.toasterService = toasterService;
                this.WSSocketService = WSSocketService;
                this.$q = $q;
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                var wsListnerScore = this.$rootScope.$on("ws-score-changed", (event, response) => {
                    if (response.success) {
                        this.getScore(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    wsListnerMarketOdds();
                    wsListnerScore();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.eventTypes = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.highlights = [];
                this.$scope.liveGamesMarkets = [];
                this.$scope.horseRacing = false;
                this.$scope.liveGamesId = this.settings.LiveGamesId;
                this.$scope.showTopSkyMenu = true;
                this.$scope.isRequestProcessing = true;
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
                this.$scope.onlyInplay = this.settings.ThemeName == 'sky' || this.settings.ThemeName == 'dimd2' ? false : true;
                this.$scope.inPlayMarkets = [];
                this.$scope.imagePath = this.settings.ImagePath;
                this.$scope.currentWebApp = this.settings.WebApp;
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.loadEventTypes();
                this.loadLiveGamesMarkets();
                if (this.settings.ThemeName == 'sky') {
                    this.loadInPlayMarkets();
                    this.getOffers();
                }
                if (this.settings.ThemeName == 'dimd2') {
                    this.loadDimd2Sliders();
                    this.loadPopularMarkets();
                }
            }
            loadPinnedMarkets() {
                var pinned = this.localStorageHelper.get(this.settings.MultiMarketPin);
                if (pinned) {
                    this.$scope.pinnedMarkets = pinned;
                }
            }
            isMarketPinned(marketid) {
                return this.$scope.pinnedMarkets.some((m) => { return m == marketid; });
            }
            pinMe(market) {
                market.pin = !market.pin;
                if (market.pin) {
                    this.localStorageHelper.setInArray(this.settings.MultiMarketPin, market.id);
                    this.$scope.pinnedMarkets.push(market.id);
                }
                else {
                    this.localStorageHelper.removeFromArray(this.settings.MultiMarketPin, market.id);
                    var index = this.$scope.pinnedMarkets.indexOf(market.id);
                    if (index > -1) {
                        this.$scope.pinnedMarkets.splice(index, 1);
                    }
                }
            }
            upcomingHorseRaces() {
                this.marketOddsService.getUpcomingHorserace()
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            this.$scope.upcomingHorseRaces = response.data;
                            this.$scope.nextHorseRace = response.data[0];
                            this.$scope.upcomingHorseRaces.splice(0, 1);
                        }
                    }
                });
            }
            loadEventTypes() {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    this.$scope.eventTypes = value.filter((e) => { return e.displayOrder > 0; });
                    if (this.$scope.eventTypes.length > 0) {
                        if (this.$scope.showTopSkyMenu) {
                            if (this.$stateParams.selectedEventType) {
                                this.$scope.selectedEventType = this.$stateParams.selectedEventType;
                            }
                            else {
                                if (this.settings.ThemeName == 'sky') {
                                    this.$scope.selectedEventType = '-1';
                                }
                                else {
                                    this.$scope.selectedEventType = this.$scope.eventTypes[0].id;
                                }
                            }
                        }
                        if (this.$scope.selectedEventType != '-1')
                            this.tabClicked();
                    }
                });
            }
            loadHighlightsByEventType(eventtypeid) {
                var defer = this.$q.defer();
                if (eventtypeid == this.settings.LiveGamesId) {
                    var promise = this.eventService.searchGames(eventtypeid);
                    this.commonDataService.addMobilePromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.highlights = response.data;
                            if (this.$scope.highlights.length > 0) {
                                this.$scope.highlights.forEach((g) => {
                                    g.imagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/' + g.name.replaceAll(' ', '-').replace('(', '').replace(')', '') + '.jpg';
                                });
                            }
                        }
                    }).finally(() => { defer.resolve(); });
                }
                else if (eventtypeid == this.settings.BinaryId) {
                    var promise = this.eventService.searchEvent(eventtypeid);
                    this.commonDataService.addMobilePromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            if (response.data && response.data.length > 0) {
                                this.$scope.highlights = response.data.filter((a) => {
                                    return (a.inPlay == this.$scope.onlyInplay || this.$scope.onlyInplay == false);
                                });
                            }
                        }
                    }).finally(() => { defer.resolve(); });
                }
                else {
                    var promise = this.marketOddsService.getHighlightbyEventTypeId(eventtypeid);
                    this.commonDataService.addMobilePromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            if (response.data && response.data.length > 0) {
                                this.$scope.highlights = response.data.filter((a) => {
                                    return (a.inPlay == this.$scope.onlyInplay || this.$scope.onlyInplay == false);
                                });
                            }
                        }
                    }).finally(() => { defer.resolve(); });
                }
                defer.promise.finally(() => {
                    this.animateTab();
                    this.$scope.isRequestProcessing = false;
                    this.subscribeOdds();
                    this.$scope.highlights.forEach((m) => {
                        if (this.commonDataService.BetInProcess(m.id)) {
                            m.betInProcess = true;
                        }
                        m.eventTypeId = m.eventType.id;
                        m.hasVideo = m.event.videoId ? true : false;
                        m.hasFancy = m.event.hasFancy ? true : false;
                    });
                });
            }
            loadHorseRacingHighlights(eventTypeId) {
                var promise = this.marketOddsService.getHorseHighlightbyEventTypeId(eventTypeId, 0);
                this.commonDataService.addMobilePromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.$scope.highlights = response.data;
                    }
                }).finally(() => { this.animateTab(); this.$scope.isRequestProcessing = false; });
            }
            tabClicked(eventTypeId = null) {
                this.$scope.isRequestProcessing = true;
                this.$scope.highlights.splice(0);
                this.animateTab(true);
                if (eventTypeId != '-1') {
                    if (eventTypeId) {
                        this.$scope.selectedEventType = eventTypeId;
                    }
                    if (eventTypeId == this.settings.HorseRacingId || eventTypeId == this.settings.GreyhoundId) {
                        this.$scope.horseRacing = true;
                        this.loadHorseRacingHighlights(this.$scope.selectedEventType);
                    }
                    else {
                        this.$scope.horseRacing = false;
                        this.loadHighlightsByEventType(this.$scope.selectedEventType);
                    }
                }
                else {
                    this.$scope.isRequestProcessing = false;
                }
                if (eventTypeId) {
                    this.$scope.selectedEventType = eventTypeId;
                }
            }
            animateTab(closeAll = false) {
                if (!this.$scope.showTopSkyMenu) {
                    var acc = document.getElementsByClassName("panel");
                    var i;
                    if (closeAll) {
                        for (i = 0; i < acc.length; i++) {
                            acc[i].style.height = "0px";
                        }
                    }
                    else {
                        this.$timeout(() => {
                            for (i = 0; i < acc.length; i++) {
                                acc[i].style.height = acc[i].classList.contains('active') ? acc[i].scrollHeight + "px" : "0px";
                            }
                        }, 100);
                    }
                }
            }
            loadLiveGamesMarkets() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        if (data.supportDetails && data.supportDetails.length > 3) {
                            this.$scope.supportDetail = JSON.parse(data.supportDetails);
                        }
                        if (data.hasCasino) {
                            this.$scope.liveGamesMarkets = intranet.common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
                        }
                    }
                });
            }
            openFDGame(lg) {
                if (lg)
                    this.commonDataService.setGameId(lg.tableId);
                this.$state.go('mobile.base.fdlivegames');
            }
            openCasino(gameId) {
                this.commonDataService.setGameId(gameId);
                this.$state.go('mobile.base.fdlivegames');
            }
            subscribeOdds() {
                if (this.settings.ThemeName == 'dimd' || this.settings.ThemeName == 'dimd2') {
                    var mids = [];
                    if (this.$scope.highlights.length > 0) {
                        this.$scope.highlights.forEach((m) => {
                            if (m.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                                mids.push(m.id);
                            }
                        });
                    }
                    this.WSSocketService.sendMessage({
                        Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                    });
                }
                else {
                    var eventids = [];
                    this.$scope.highlights.forEach((m) => {
                        if (m.marketStatus != intranet.common.enums.MarketStatus.CLOSED
                            && m.event.sourceId) {
                            eventids.push(m.event.sourceId);
                        }
                    });
                    this.$scope.inPlayMarkets.forEach((m) => {
                        if (m.marketStatus != intranet.common.enums.MarketStatus.CLOSED
                            && m.event.sourceId) {
                            eventids.push(m.event.sourceId);
                        }
                    });
                    this.WSSocketService.sendMessage({
                        Scid: eventids, MessageType: intranet.common.enums.WSMessageType.Score
                    });
                }
            }
            setMarketOdds(responseData) {
                responseData.forEach((data) => {
                    if (this.$scope.highlights && this.$scope.highlights.length > 0) {
                        this.$scope.highlights.forEach((f) => {
                            if (f.id == data.id) {
                                this.setOddsInMarket(f, data);
                            }
                        });
                    }
                });
            }
            loadInPlayMarkets() {
                this.$scope.isRequestProcessing = true;
                var promise = this.marketOddsService.getInPlayMarkets();
                this.commonDataService.addMobilePromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        var eventTypes = response.data;
                        eventTypes.forEach((e, index) => {
                            e.markets.forEach((m, mindex) => {
                                if (this.commonDataService.BetInProcess(m.id)) {
                                    m.betInProcess = true;
                                }
                                m.eventTypeSourceId = e.sourceId;
                                this.$scope.inPlayMarkets.push(m);
                                m.eventTypeName = e.name;
                                m.hasVideo = m.event.videoId ? true : false;
                                m.hasFancy = m.event.hasFancy ? true : false;
                            });
                        });
                    }
                }).finally(() => {
                    this.$scope.isRequestProcessing = false;
                    this.loadPopularMarkets();
                });
                ;
            }
            loadPopularMarkets() {
                this.commonDataService.getEventTypes().then((eventTypes) => {
                    var model = { top: 10, eventTypeIds: [] };
                    eventTypes.forEach((e) => {
                        if (e.sourceId == this.settings.CricketBfId || e.sourceId == this.settings.SoccerBfId || e.sourceId == this.settings.TennisBfId) {
                            model.eventTypeIds.push(e.id);
                        }
                    });
                    var promise = this.marketOddsService.getPopularMarkets(model);
                    this.commonDataService.addMobilePromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            if (response.data && response.data.length > 0) {
                                response.data.forEach((mr) => {
                                    mr.eventTypeName = this.commonDataService.getEventTypeName(mr.event.eventType.id);
                                    mr.eventTypeSourceId = this.commonDataService.getEventTypeSourceId(mr.event.eventType.id);
                                    mr.hasVideo = mr.event.videoId ? true : false;
                                    mr.hasFancy = mr.event.hasFancy ? true : false;
                                    this.$scope.inPlayMarkets.push(mr);
                                });
                            }
                        }
                    });
                });
            }
            openFullmarket(h) {
                this.$state.go('mobile.base.market', { marketid: h.id });
            }
            FilterChanged(isInplay) {
                this.$scope.onlyInplay = isInplay;
                this.tabClicked(this.$scope.selectedEventType);
            }
            getScore(dataarray) {
                angular.forEach(dataarray, (data) => {
                    angular.forEach(this.$scope.highlights, (m) => {
                        if (data.eventId == m.event.sourceId) {
                            this.setScore(data, m);
                        }
                    });
                    angular.forEach(this.$scope.inPlayMarkets, (m) => {
                        if (data.eventId == m.event.sourceId) {
                            this.setScore(data, m);
                        }
                    });
                });
            }
            setScore(data, m) {
                if (data.eventTypeId == this.settings.SoccerBfId) {
                    m.score = data;
                    m.isSoccer = true;
                }
                else if (data.eventTypeId == this.settings.TennisBfId) {
                    m.score = data;
                    m.isTennis = true;
                }
                else if (data.eventTypeId == this.settings.CricketBfId) {
                    m.isCricket = true;
                    m.score = {};
                    var score = data;
                    if (score && score.score) {
                        if (score.score.home.highlight) {
                            m.score.inplayIndex = 0;
                            if (score.score.home.inning1) {
                                m.score.runs = score.score.home.inning1.runs + '/' + score.score.home.inning1.wickets;
                                m.score.overs = score.score.home.inning1.overs;
                            }
                            if (score.score.home.inning2) {
                                m.score.runs = score.score.home.inning2.runs + '/' + score.score.home.inning2.wickets;
                                m.score.overs = score.score.home.inning2.overs;
                            }
                        }
                        else if (score.score.away.highlight) {
                            m.score.inplayIndex = 1;
                            if (score.score.away.inning1) {
                                m.score.runs = score.score.away.inning1.runs + '/' + score.score.away.inning1.wickets;
                                m.score.overs = score.score.away.inning1.overs;
                            }
                            if (score.score.away.inning2) {
                                m.score.runs = score.score.away.inning2.runs + '/' + score.score.away.inning2.wickets;
                                m.score.overs = score.score.away.inning2.overs;
                            }
                        }
                        if (score.matchType != 'TEST') {
                            if (!score.score.away.highlight) {
                                if (score.score.away.inning1 && score.score.away.inning1.runs.length > 0) {
                                    m.score.taget = (score.score.away.inning1.runs * 1) + 1;
                                }
                                if (score.score.away.inning2 && score.score.away.inning2.runs.length > 0) {
                                    m.score.taget = (score.score.away.inning2.runs * 1) + 1;
                                }
                            }
                            else if (!score.score.home.highlight) {
                                if (score.score.home.inning1 && score.score.home.inning1.runs.length > 0) {
                                    m.score.taget = (score.score.home.inning1.runs * 1) + 1;
                                }
                                if (score.score.home.inning2 && score.score.home.inning2.runs.length > 0) {
                                    m.score.taget = (score.score.home.inning2.runs * 1) + 1;
                                }
                            }
                        }
                    }
                }
            }
            getOffers() {
                this.offerService.getOfferList()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.offerList = response.data;
                    }
                }).finally(() => {
                    if (this.settings.ThemeName == 'sky' && this.$scope.offerList.length > 0) {
                        this.$timeout(() => {
                            jQuery('.slider').slick({
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                autoplay: true,
                                speed: 2000,
                                autoplaySpeed: 7000,
                                lazyLoad: 'progressive',
                                arrows: false,
                            }).slickAnimation();
                        }, 500);
                    }
                });
            }
            sendToDepositPage() {
                this.$state.go('mobile.base.transferonline');
            }
            loadDimd2Sliders() {
                waitForElement('home-banner', function () {
                    jQuery('#home-banner').carousel({ ride: 'carousel' });
                });
                waitForElement('.home-casiono-icons .hooper-track', function () {
                    jQuery('.home-casiono-icons .hooper-track').slick({
                        vertical: false,
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        autoplay: true,
                        autoplaySpeed: 3000,
                        infinite: true,
                        easing: 'linear',
                        verticalSwiping: true,
                        arrows: false,
                    });
                }, true);
            }
            placeBet(h, side, runnerId, price, runnerName, percentage = 100) {
                var model = new intranet.common.helpers.BetModal(h, side, runnerId, price, runnerName, false, '', percentage);
                this.$scope.stopPPL = true;
                this.$scope.inlineOnMarketOnly = true;
                super.executeBet(model.model, false, this.settings.ThemeName == 'dimd2' ? true : false);
            }
        }
        mobile.MobileHomeCtrl = MobileHomeCtrl;
        angular.module('intranet.mobile').controller('mobileHomeCtrl', MobileHomeCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileHomeCtrl.js.map