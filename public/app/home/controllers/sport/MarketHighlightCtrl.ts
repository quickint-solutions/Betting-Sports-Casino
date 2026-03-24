
module intranet.home {
    export interface IMarketHighlightScope extends intranet.common.IBetScopeBase {
        highlights: any[];
        nextHorseRace: any;
        upcomingHorseRaces: any[];
        hasAnyDrawMarket: boolean;

        eventTypes: any[];
        selectedEventType: any;
        isRacing: boolean;

        renderingFor: number; // 1=home,2=market-list
        pinnedMarkets: any[];
        currentInlineBet: any;
        bannerPath: string;

        liveGamesMarkets: any[];
        eventTypeName: any;

        imagePath: any;
        allUpcomingHorseRace: any[];

        competitions: any[];
        webImagePath: any;

        isRequestProcessing: boolean;
    }

    export class MarketHighlightCtrl extends intranet.common.BetControllerBase<IMarketHighlightScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMarketHighlightScope,
            private $stateParams: any,
            private $state: any,
            private marketOddsService: services.MarketOddsService,
            public $timeout: ng.ITimeoutService,
            public $rootScope: any,
            private isMobile: any,
            public $compile: any,
            public WSSocketService: any,
            public placeBetDataService: common.services.PlaceBetDataService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public toasterService: intranet.common.services.ToasterService,
            public commonDataService: common.services.CommonDataService,
            public settings: common.IBaseSettings,
            public betService: services.BetService,
            public modalService: common.services.ModalService,
            private $q: ng.IQService) {
            super($scope);

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
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
                wsListnerScore();
                wsListnerMarketOdds();
            });

            super.init(this);
        }

        // bet process related
        private betProcessStarted(marketid: any): void {
            this.$scope.highlights.forEach((m: any) => {
                if (m.id == marketid) { m.betInProcess = true; }
            });
        }

        private betProcessComplete(marketid: any): void {
            this.$scope.highlights.forEach((m: any) => {
                if (m.id == marketid) { m.betInProcess = false; }
            });
        }

        public initScopeValues() {
            this.$scope.renderingFor = 1;
            this.$scope.hasAnyDrawMarket = false;
            if (this.$stateParams.nodetype) { this.$scope.renderingFor = 2; }
            this.$scope.eventTypes = [];
            this.$scope.pinnedMarkets = [];
            this.$scope.isRacing = false;
            this.$scope.liveGamesMarkets = [];
            this.$scope.highlights = [];
            this.$scope.imagePath = this.settings.ImagePath;
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
        }

        public loadInitialData() {
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
                        eventtypes.then((value: any) => {
                            if (value && value.length > 0) { value = value.filter((a: any) => { return a.displayOrder >= 0; }); }
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

        private setSwiperForSports(): void {
            let hasCasino = false;
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        hasCasino = data.hasCasino;

                        this.$timeout(() => {
                            var mySwiper = new Swiper('#banners', {
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
                            });
                            var mySwiper3 = new Swiper('#swiper5', {
                                // Optional parameters
                                slidesPerView: hasCasino ? 5 : 2,
                                spaceBetween: 5, freeMode: true,
                            });
                            var mySwiper4 = new Swiper('#swiper8', {
                                // Optional parameters
                                slidesPerView: (this.isMobile.any ? 4 : 8),
                                spaceBetween: 5, freeMode: true,
                            });
                        }, 100);
                    }
                });
        }

        // load already pinned market from storage
        private loadPinnedMarkets(): void {
            var pinned = this.localStorageHelper.get(this.settings.MultiMarketPin);
            if (pinned) {
                this.$scope.pinnedMarkets = pinned;
            }
        }

        // check if current market is pinned
        private isMarketPinned(marketid: any): any {
            return this.$scope.pinnedMarkets.some((m: any) => { return m == marketid; });
        }

        // pin/unpin market
        private pinMe(market: any): void {
            market.pin = !market.pin;
            if (market.pin) {
                this.localStorageHelper.setInArray(this.settings.MultiMarketPin, market.id);
                this.$scope.pinnedMarkets.push(market.id);
            }
            else {
                this.localStorageHelper.removeFromArray(this.settings.MultiMarketPin, market.id);
                var index = this.$scope.pinnedMarkets.indexOf(market.id);
                if (index > -1) { this.$scope.pinnedMarkets.splice(index, 1); }
            }
        }

        private upcomingHorseRaces(): void {
            this.marketOddsService.getUpcomingHorserace()
                .success((response: common.messaging.IResponse<any>) => {
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

        // load event types for tab control
        private loadEventTypes(): void {
            this.$scope.isRequestProcessing = true;
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                if (value && value.length > 0) { value = value.filter((a: any) => { return a.displayOrder >= 0; }); }
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

        private loadInplayMarkets() {
            this.marketOddsService.getInPlayMarkets()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        angular.forEach(response.data, (e: any) => {
                            angular.forEach(e.markets, (m: any) => { this.$scope.highlights.push(m); });
                        });
                    }
                }).finally(() => { this.loadPopularMarkets(); });
        }

        private loadPopularMarkets() {
            var ids = this.$scope.eventTypes.map((x: any) => { return x.id; });
            this.marketOddsService.getPopularSports(30, ids)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        angular.forEach(response.data, (m: any) => { this.$scope.highlights.push(m); });
                    }
                }).finally(() => {
                    this.$scope.highlights.forEach((m: any) => {
                        if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                        if (m.marketRunner.length > 2) {
                            this.$scope.hasAnyDrawMarket = true;
                            m.hasAnyDrawMarket = true;
                        }
                        m.eventTypeId = (m.event.eventType) ? m.event.eventType.id : m.eventType.id;
                        m.hasVideo = m.event.videoId ? true : false;
                        m.hasFancy = m.event.hasFancy ? true : false;
                    });
                    if (this.settings.ThemeName == 'sports') { this.countEvents() }
                    this.subscribeOdds();
                    this.$scope.isRequestProcessing = false;
                });
        }

        private countEvents() {
            angular.forEach(this.$scope.eventTypes, (s: any) => {
                angular.forEach(this.$scope.highlights, (p: any) => {

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
                            var cIndex = common.helpers.Utility.IndexOfObject(s.competitions, 'id', p.event.competitionId);
                            if (cIndex > -1) {
                                s.competitions[cIndex].events.push(event);
                            } else {
                                s.competitions.push({ name: p.event.competitionName, id: p.event.competitionId, events: [event] });
                            }
                        }
                    }
                });
            });
        }

        private countCompetition() {
            this.$scope.competitions = [];
            angular.forEach(this.$scope.highlights, (p: any) => {
                if (!p.event.competitionId) {
                    p.event.competitionId = -9999;
                    p.event.competitionName = 'Other Popular';
                }
                var cIndex = common.helpers.Utility.IndexOfObject(this.$scope.competitions, 'id', p.event.competitionId);
                if (cIndex <= -1) {
                    this.$scope.competitions.push({ name: p.event.competitionName, id: p.event.competitionId });
                }
            });
        }

        // load market list based on sport node type and user clicked event type
        private loadHighlightsBySportNodeType(model: any): void {
            var defer = this.$q.defer();
            if (model.nodeType == common.enums.SportNodeType.EventType) {
                this.marketOddsService.getHighlightbyEventTypeId(model.id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) { this.$scope.highlights = response.data; }
                    }).finally(() => { defer.resolve(); });
            }
            else if (model.nodeType == common.enums.SportNodeType.Competition) {
                this.marketOddsService.getHighlightbyCompetitionId(this.$stateParams.eventTypeId, model.id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) { this.$scope.highlights = response.data; }
                    }).finally(() => { defer.resolve(); });
            }
            else if (model.nodeType == common.enums.SportNodeType.Event) {
                this.marketOddsService.getHighlightbyEventId(model.id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) { this.$scope.highlights = response.data; }
                    }).finally(() => { defer.resolve(); });
            }

            defer.promise.finally(() => {
                this.$scope.highlights.forEach((m: any) => {
                    if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                    if (m.marketRunner.length > 2) {
                        this.$scope.hasAnyDrawMarket = true;
                        m.hasAnyDrawMarket = true;
                    }
                    m.eventTypeId = m.eventType.id;
                    m.hasVideo = m.event.videoId ? true : false;
                    m.hasFancy = m.event.hasFancy ? true : false;
                });
                if (this.settings.ThemeName == 'sports') { this.countCompetition(); }
                this.subscribeOdds();
                this.$scope.isRequestProcessing = false;
            });
        }

        public subscribeOdds(): void {
            var mids: any[] = [];
            var eventids: any[] = [];

            if (this.$scope.highlights.length > 0) {
                this.$scope.highlights.forEach((m: any) => {
                    if (m.marketStatus != common.enums.MarketStatus.CLOSED) {
                        mids.push(m.id);
                    }
                    if (m.marketStatus != common.enums.MarketStatus.CLOSED
                        && m.event.sourceId) {
                        eventids.push(m.event.sourceId);
                    }
                });
            }

            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });

            this.WSSocketService.sendMessage({
                Scid: eventids, MessageType: common.enums.WSMessageType.Score
            });
        }

        private setMarketOdds(responseData: any[]): void {
            responseData.forEach((data: any) => {
                if (this.$scope.highlights && this.$scope.highlights.length > 0) {
                    this.$scope.highlights.forEach((f: any) => {
                        if (f.id == data.id) {
                            this.setOddsInMarket(f, data);
                        }
                    });
                }
            });
        }


        // decide node type from state param and load market list
        private loadHighlightsBasedOnURL(): void {
            var model = { nodeType: null, id: null };
            if (this.$stateParams.nodetype && this.$stateParams.id) {
                model.nodeType = this.$stateParams.nodetype;
                model.id = this.$stateParams.id;
            }
            this.loadHighlightsBySportNodeType(model);
        }

        private loadHorseRacingHighlights(eventTypeId: any): void {
            this.marketOddsService.getHorseHighlightbyEventTypeId(eventTypeId, 0)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.highlights = response.data;
                        this.$scope.highlights.forEach((m: any) => {
                            m.eventTypeId = eventTypeId;
                            m.eventTypeName = this.$scope.eventTypeName;
                            m.countryCode = m.event.countryCode;
                        });
                    }
                }).finally(() => { this.$scope.isRequestProcessing = false; });
        }

        // load markets list based on selected event type
        private tabClicked(eventTypeId: any = null): void {
            this.$scope.isRequestProcessing = true;
            this.$scope.highlights.splice(0);
            this.$scope.eventTypeName = this.commonDataService.getEventTypeName(eventTypeId);

            if (eventTypeId) { this.$scope.selectedEventType = eventTypeId; }
            if (eventTypeId == this.settings.HorseRacingId || eventTypeId == this.settings.GreyhoundId) {
                this.$scope.isRacing = true;
                this.loadHorseRacingHighlights(eventTypeId);
            }
            else {
                this.$scope.isRacing = false;
                var model = {
                    nodeType: common.enums.SportNodeType.EventType,
                    id: this.$scope.selectedEventType
                };
                this.$scope.hasAnyDrawMarket = false;
                this.loadHighlightsBySportNodeType(model);
            }
        }

        // place bet
        private placeBet(h: any, side: any, runnerId: any, price: any, runnerName: string, percentage: any = 100): void {
            var model = new common.helpers.BetModal(h, side, runnerId, price, runnerName, false, '', percentage);
            this.$scope.stopPPL = true;
            this.$scope.inlineOnMarketOnly = true;
            super.executeBet(model.model, false, this.settings.ThemeName == 'dimd2' ? true : false);
        }

        private setBannerPath(): void {

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
                this.commonDataService.getEventTypes().then((value: any) => {
                    if (value) {
                        var eventtype = value.filter((a: any) => { return a.id == breadcumb[0].id; });
                        if (eventtype.length > 0) {
                            if (eventtype[0].coverImg) {
                                this.$scope.bannerPath = this.settings.ImagePath + eventtype[0].coverImg;
                            } else { setDefault(); }
                        } else { setDefault(); }
                    } else { setDefault(); }
                });
            } else {
                setDefault();
            }
        }

        private loadLiveGamesMarkets(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        if (data.hasCasino) {
                            this.$scope.liveGamesMarkets = common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
                        }
                    }
                });
        }

        private openFDGame(lg) {
            this.commonDataService.setGameId(lg.tableId);
            if (this.isMobile.any) {
                this.$state.go('mobile.base.fdlivegames');
            } else {
                if (this.settings.ThemeName == 'dimd2') {
                    this.$state.go('base.home.livegames');
                } else {
                    this.$state.go('base.livegames');
                }
            }
        }

        private getScore(dataarray: any): void {
            angular.forEach(dataarray, (data: any) => {
                angular.forEach(this.$scope.highlights, (m: any) => {
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

        private openCasino(gameId) {
            this.commonDataService.setGameId(gameId);
            if (this.isMobile.any) {
                this.$state.go('mobile.base.fdlivegames');
            } else {
                this.$state.go('base.livegames');
            }
        }


    }

    angular.module('intranet.home').controller('marketHighlightCtrl', MarketHighlightCtrl);
}