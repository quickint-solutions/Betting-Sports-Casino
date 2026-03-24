var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class MarketHighlightCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, $state, marketOddsService, $timeout, $rootScope, isMobile, $compile, WSSocketService, placeBetDataService, localStorageHelper, toasterService, commonDataService, settings, betService, modalService, $q) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.$rootScope = $rootScope;
                this.isMobile = isMobile;
                this.$compile = $compile;
                this.WSSocketService = WSSocketService;
                this.placeBetDataService = placeBetDataService;
                this.localStorageHelper = localStorageHelper;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.betService = betService;
                this.modalService = modalService;
                this.$q = $q;
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
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
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListnerScore();
                    wsListnerMarketOdds();
                });
                super.init(this);
            }
            betProcessStarted(marketid) {
                this.$scope.highlights.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = true;
                    }
                });
            }
            betProcessComplete(marketid) {
                this.$scope.highlights.forEach((m) => {
                    if (m.id == marketid) {
                        m.betInProcess = false;
                    }
                });
            }
            initScopeValues() {
                this.$scope.renderingFor = 1;
                this.$scope.hasAnyDrawMarket = false;
                if (this.$stateParams.nodetype) {
                    this.$scope.renderingFor = 2;
                }
                this.$scope.eventTypes = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.isRacing = false;
                this.$scope.liveGamesMarkets = [];
                this.$scope.highlights = [];
                this.$scope.imagePath = this.settings.ImagePath;
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.setBannerPath();
                switch (this.$scope.renderingFor) {
                    case 1:
                        this.loadEventTypes();
                        if (this.settings.ThemeName != 'lotus' && this.settings.ThemeName != 'sports') {
                            this.upcomingHorseRaces();
                            this.loadLiveGamesMarkets();
                        }
                        if (this.settings.ThemeName == 'sports') {
                            this.setSwiperForSports();
                        }
                        if (this.settings.ThemeName == 'dimd2') {
                            waitForElement('highlight_carousel', function () {
                                jQuery('#highlight_carousel').carousel({ ride: 'carousel' });
                            });
                        }
                        break;
                    case 2:
                        this.$scope.isRequestProcessing = true;
                        if (this.settings.ThemeName == 'sports') {
                            this.$scope.eventTypes.splice(0);
                            var eventtypes = this.commonDataService.getEventTypes();
                            eventtypes.then((value) => {
                                if (value && value.length > 0) {
                                    value = value.filter((a) => { return a.displayOrder >= 0; });
                                }
                                this.$scope.eventTypes = value;
                                this.$scope.eventTypeName = this.commonDataService.getEventTypeName(this.$stateParams.eventTypeId);
                                this.setSwiperForSports();
                            });
                        }
                        this.loadHighlightsBasedOnURL();
                        break;
                }
                if (this.$stateParams.eventTypeId) {
                    this.$scope.selectedEventType = this.$stateParams.eventTypeId;
                    if (this.settings.ThemeName != 'sports') {
                        this.commonDataService.getEventTypes().then(() => {
                            var eventTypeSourceId = this.commonDataService.getEventTypeSourceId(this.$stateParams.eventTypeId);
                            this.$scope.eventTypeName = this.commonDataService.getEventTypeName(this.$stateParams.eventTypeId);
                            this.$scope.eventTypes.push({ id: this.$stateParams.eventTypeId, name: this.$scope.eventTypeName, sourceId: eventTypeSourceId });
                        });
                    }
                }
            }
            setSwiperForSports() {
                let hasCasino = false;
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        hasCasino = data.hasCasino;
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
                            var mySwiper3 = new Swiper('#swiper5', {
                                slidesPerView: hasCasino ? 5 : 2,
                                spaceBetween: 5, freeMode: true,
                            });
                            var mySwiper4 = new Swiper('#swiper8', {
                                slidesPerView: (this.isMobile.any ? 4 : 8),
                                spaceBetween: 5, freeMode: true,
                            });
                        }, 100);
                    }
                });
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
                            this.$scope.allUpcomingHorseRace = response.data;
                            this.$scope.upcomingHorseRaces = response.data;
                            this.$scope.nextHorseRace = response.data[0];
                            this.$scope.upcomingHorseRaces.splice(0, 1);
                        }
                    }
                });
            }
            loadEventTypes() {
                this.$scope.isRequestProcessing = true;
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    if (value && value.length > 0) {
                        value = value.filter((a) => { return a.displayOrder >= 0; });
                    }
                    this.$scope.eventTypes = value;
                    if (this.$scope.eventTypes.length > 0) {
                        if (this.settings.ThemeName == 'betfair') {
                            this.loadInplayMarkets();
                        }
                        else if (this.settings.ThemeName == 'sports') {
                            this.loadInplayMarkets();
                        }
                        else {
                            this.$scope.selectedEventType = this.$scope.eventTypes[0].id;
                            this.tabClicked();
                        }
                    }
                });
            }
            loadInplayMarkets() {
                this.marketOddsService.getInPlayMarkets()
                    .success((response) => {
                    if (response.success) {
                        angular.forEach(response.data, (e) => {
                            angular.forEach(e.markets, (m) => { this.$scope.highlights.push(m); });
                        });
                    }
                }).finally(() => { this.loadPopularMarkets(); });
            }
            loadPopularMarkets() {
                var ids = this.$scope.eventTypes.map((x) => { return x.id; });
                this.marketOddsService.getPopularSports(30, ids)
                    .success((response) => {
                    if (response.success) {
                        angular.forEach(response.data, (m) => { this.$scope.highlights.push(m); });
                    }
                }).finally(() => {
                    this.$scope.highlights.forEach((m) => {
                        if (this.commonDataService.BetInProcess(m.id)) {
                            m.betInProcess = true;
                        }
                        if (m.marketRunner.length > 2) {
                            this.$scope.hasAnyDrawMarket = true;
                            m.hasAnyDrawMarket = true;
                        }
                        m.eventTypeId = (m.event.eventType) ? m.event.eventType.id : m.eventType.id;
                        m.hasVideo = m.event.videoId ? true : false;
                        m.hasFancy = m.event.hasFancy ? true : false;
                    });
                    if (this.settings.ThemeName == 'sports') {
                        this.countEvents();
                    }
                    this.subscribeOdds();
                    this.$scope.isRequestProcessing = false;
                });
            }
            countEvents() {
                angular.forEach(this.$scope.eventTypes, (s) => {
                    angular.forEach(this.$scope.highlights, (p) => {
                        if ((p.event.eventType && s.id == p.event.eventType.id) || (p.eventType && p.eventType.id == s.id)) {
                            var event = { id: p.eventId, name: p.event.name };
                            if (!p.event.competitionId) {
                                p.event.competitionId = -9999;
                                p.event.competitionName = 'Other Popular';
                            }
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
            countCompetition() {
                this.$scope.competitions = [];
                angular.forEach(this.$scope.highlights, (p) => {
                    if (!p.event.competitionId) {
                        p.event.competitionId = -9999;
                        p.event.competitionName = 'Other Popular';
                    }
                    var cIndex = intranet.common.helpers.Utility.IndexOfObject(this.$scope.competitions, 'id', p.event.competitionId);
                    if (cIndex <= -1) {
                        this.$scope.competitions.push({ name: p.event.competitionName, id: p.event.competitionId });
                    }
                });
            }
            loadHighlightsBySportNodeType(model) {
                var defer = this.$q.defer();
                if (model.nodeType == 1) {
                    this.marketOddsService.getHighlightbyEventTypeId(model.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.highlights = response.data;
                        }
                    }).finally(() => { defer.resolve(); });
                }
                else if (model.nodeType == 2) {
                    this.marketOddsService.getHighlightbyCompetitionId(this.$stateParams.eventTypeId, model.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.highlights = response.data;
                        }
                    }).finally(() => { defer.resolve(); });
                }
                else if (model.nodeType == 4) {
                    this.marketOddsService.getHighlightbyEventId(model.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.highlights = response.data;
                        }
                    }).finally(() => { defer.resolve(); });
                }
                defer.promise.finally(() => {
                    this.$scope.highlights.forEach((m) => {
                        if (this.commonDataService.BetInProcess(m.id)) {
                            m.betInProcess = true;
                        }
                        if (m.marketRunner.length > 2) {
                            this.$scope.hasAnyDrawMarket = true;
                            m.hasAnyDrawMarket = true;
                        }
                        m.eventTypeId = m.eventType.id;
                        m.hasVideo = m.event.videoId ? true : false;
                        m.hasFancy = m.event.hasFancy ? true : false;
                    });
                    if (this.settings.ThemeName == 'sports') {
                        this.countCompetition();
                    }
                    this.subscribeOdds();
                    this.$scope.isRequestProcessing = false;
                });
            }
            subscribeOdds() {
                var mids = [];
                var eventids = [];
                if (this.$scope.highlights.length > 0) {
                    this.$scope.highlights.forEach((m) => {
                        if (m.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                            mids.push(m.id);
                        }
                        if (m.marketStatus != intranet.common.enums.MarketStatus.CLOSED
                            && m.event.sourceId) {
                            eventids.push(m.event.sourceId);
                        }
                    });
                }
                this.WSSocketService.sendMessage({
                    Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
                this.WSSocketService.sendMessage({
                    Scid: eventids, MessageType: intranet.common.enums.WSMessageType.Score
                });
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
            loadHighlightsBasedOnURL() {
                var model = { nodeType: null, id: null };
                if (this.$stateParams.nodetype && this.$stateParams.id) {
                    model.nodeType = this.$stateParams.nodetype;
                    model.id = this.$stateParams.id;
                }
                this.loadHighlightsBySportNodeType(model);
            }
            loadHorseRacingHighlights(eventTypeId) {
                this.marketOddsService.getHorseHighlightbyEventTypeId(eventTypeId, 0)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.highlights = response.data;
                        this.$scope.highlights.forEach((m) => {
                            m.eventTypeId = eventTypeId;
                            m.eventTypeName = this.$scope.eventTypeName;
                            m.countryCode = m.event.countryCode;
                        });
                    }
                }).finally(() => { this.$scope.isRequestProcessing = false; });
            }
            tabClicked(eventTypeId = null) {
                this.$scope.isRequestProcessing = true;
                this.$scope.highlights.splice(0);
                this.$scope.eventTypeName = this.commonDataService.getEventTypeName(eventTypeId);
                if (eventTypeId) {
                    this.$scope.selectedEventType = eventTypeId;
                }
                if (eventTypeId == this.settings.HorseRacingId || eventTypeId == this.settings.GreyhoundId) {
                    this.$scope.isRacing = true;
                    this.loadHorseRacingHighlights(eventTypeId);
                }
                else {
                    this.$scope.isRacing = false;
                    var model = {
                        nodeType: 1,
                        id: this.$scope.selectedEventType
                    };
                    this.$scope.hasAnyDrawMarket = false;
                    this.loadHighlightsBySportNodeType(model);
                }
            }
            placeBet(h, side, runnerId, price, runnerName, percentage = 100) {
                var model = new intranet.common.helpers.BetModal(h, side, runnerId, price, runnerName, false, '', percentage);
                this.$scope.stopPPL = true;
                this.$scope.inlineOnMarketOnly = true;
                super.executeBet(model.model, false, this.settings.ThemeName == 'dimd2' ? true : false);
            }
            setBannerPath() {
                var setDefault = (() => {
                    if (this.settings.WebApp == 'electionexch') {
                        this.$scope.bannerPath = this.settings.ImagePath + 'images/cover-image/plitics.jpg';
                    }
                    else {
                        this.$scope.bannerPath = this.settings.ImagePath + 'images/highlight.jpg';
                    }
                });
                var breadcumb = this.localStorageHelper.get(this.settings.SportTreeHeader);
                if (this.$stateParams.nodetype && breadcumb && breadcumb.length > 0) {
                    this.commonDataService.getEventTypes().then((value) => {
                        if (value) {
                            var eventtype = value.filter((a) => { return a.id == breadcumb[0].id; });
                            if (eventtype.length > 0) {
                                if (eventtype[0].coverImg) {
                                    this.$scope.bannerPath = this.settings.ImagePath + eventtype[0].coverImg;
                                }
                                else {
                                    setDefault();
                                }
                            }
                            else {
                                setDefault();
                            }
                        }
                        else {
                            setDefault();
                        }
                    });
                }
                else {
                    setDefault();
                }
            }
            loadLiveGamesMarkets() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        if (data.hasCasino) {
                            this.$scope.liveGamesMarkets = intranet.common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
                        }
                    }
                });
            }
            openFDGame(lg) {
                this.commonDataService.setGameId(lg.tableId);
                if (this.isMobile.any) {
                    this.$state.go('mobile.base.fdlivegames');
                }
                else {
                    if (this.settings.ThemeName == 'dimd2') {
                        this.$state.go('base.home.livegames');
                    }
                    else {
                        this.$state.go('base.livegames');
                    }
                }
            }
            getScore(dataarray) {
                angular.forEach(dataarray, (data) => {
                    angular.forEach(this.$scope.highlights, (m) => {
                        if (data.eventId == m.event.sourceId) {
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
                    });
                });
            }
            openCasino(gameId) {
                this.commonDataService.setGameId(gameId);
                if (this.isMobile.any) {
                    this.$state.go('mobile.base.fdlivegames');
                }
                else {
                    this.$state.go('base.livegames');
                }
            }
        }
        home.MarketHighlightCtrl = MarketHighlightCtrl;
        angular.module('intranet.home').controller('marketHighlightCtrl', MarketHighlightCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MarketHighlightCtrl.js.map