module intranet.home {

    export interface IInplayScope extends intranet.common.IBetScopeBase {
        eventTypes: any[];
        hasAnyDrawMarket: boolean;
        pinnedMarkets: any[];
        currentInlineBet: any;
        currentTab: any;

        filters: any[];
        selectAll: any;
        marketDetails: any[];

        selectedEventType: any;
        competitions: any[];

        isRequestProcessing: boolean;

        // 'all' = every game (in-play + upcoming), 'live' = in-play only.
        gameFilter: string;
        // Angular list-filter predicate honoring gameFilter (used in the template).
        liveFilter: (m: any) => boolean;
        // Count of markets visible for a sport under the current filter (for empty states).
        visibleCount: (eventTypeId: any) => number;
    }

    export class InplayCtrl extends intranet.common.BetControllerBase<IInplayScope>
        implements intranet.common.init.IInit {

        // URL ?tab=<name> → filter name, e.g. 'cricket' → 'Cricket'.
        private static SPORT_TAB_MAP: { [key: string]: string } = {
            cricket: 'Cricket',
            soccer: 'Football',
            football: 'Football',
            tennis: 'Tennis',
            horse: 'Horse Racing',
            greyhound: 'Greyhound Racing'
        };

        constructor($scope: IInplayScope,
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
            private $stateParams: any) {
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
            this.$scope.eventTypes.forEach((e: any) => {
                e.markets.forEach((m: any) => {
                    if (m.id != marketid) {
                        m.betInProcess = true;
                    }
                });
            });
        }

        private betProcessComplete(marketid: any): void {
            this.$scope.eventTypes.forEach((e: any) => {
                e.markets.forEach((m: any) => {
                    if (m.id != marketid) {
                        m.betInProcess = false;
                    }
                });
            });
        }

        public initScopeValues() {
            this.$scope.hasAnyDrawMarket = true;
            this.$scope.eventTypes = [];
            this.$scope.pinnedMarkets = [];
            this.$scope.currentTab = 2;
            this.$scope.selectAll = true;
            this.$scope.marketDetails = [];
            this.$scope.competitions = [];
            // Default to showing all games; the toggle narrows to live-only.
            this.$scope.gameFilter = 'all';
            this.$scope.liveFilter = (m: any) => this.$scope.gameFilter === 'all' || !!m.inPlay;
            this.$scope.visibleCount = (eventTypeId: any) => {
                var et = (this.$scope.eventTypes || []).filter((e: any) => e.id == eventTypeId)[0];
                if (!et || !et.markets) { return 0; }
                return et.markets.filter((m: any) => this.$scope.gameFilter === 'all' || !!m.inPlay).length;
            };
        }

        public loadInitialData() {
            this.$scope.isRequestProcessing = true;
            this.loadPinnedMarkets();
            this.loadInPlayMarkets();
            this.loadEventTypes();
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

        private loadMarkets(index: any): void {
            this.$scope.currentTab = index;
            if (index == 2) { this.subscribeOdds(); }
            else { this.loadMarketsByDays(); this.unsubscribeOdds(); }
        }

        private loadInPlayMarkets(): void {
            console.log('[inplay-debug] loadInPlayMarkets() called → GET marketodds/getinplay');
            this.marketOddsService.getInPlayMarkets()
                .success((response: common.messaging.IResponse<any>) => {
                    var ipGroups = (response && response.data) || [];
                    var ipAll: any[] = [];
                    ipGroups.forEach((e: any) => (e.markets || []).forEach((m: any) => ipAll.push(m)));
                    console.log('[inplay-debug] getinplay response:', {
                        success: response && response.success,
                        eventTypeGroups: ipGroups.length,
                        totalMarkets: ipAll.length,
                        liveCount: ipAll.filter((m: any) => !!m.inPlay).length,
                        inPlayValuesSeen: ipAll.map((m: any) => m.inPlay).filter((v: any, i: any, a: any) => a.indexOf(v) === i),
                        raw: response && response.data
                    });
                    if (response.success) {
                        this.$scope.eventTypes = response.data || [];
                        this.$scope.eventTypes.forEach((e: any) => {
                            e.markets.forEach((m: any) => { this.decorateMarket(m); });
                        });
                    }
                })
                .error((err: any, status: any) => {
                    console.error('[inplay-debug] getinplay FAILED status=' + status, err);
                })
                .finally(() => {
                    // Render in-play right away and clear the loader so the page/tabs stay
                    // interactive immediately (same timing as before). Popular/upcoming
                    // markets are then merged in the background so the page shows ALL games.
                    this.refreshGrouping();
                    this.$scope.isRequestProcessing = false;
                    this.loadAllMarkets();
                });
        }

        // Pull popular markets for every (non-racing) sport and merge them into the
        // in-play eventTypes grouping, so one list holds live + upcoming games. Runs in
        // the background — it must never gate the loader (see loadInPlayMarkets).
        private loadAllMarkets(): void {
            // Reuse the event-type ids already loaded for the tab strip; fall back to the
            // ids present on the in-play data. We deliberately avoid calling
            // commonDataService.getEventTypes() again here — a second concurrent call can
            // leave its shared deferred pending and stall this chain.
            var ids = (this.$scope.filters || [])
                .filter((a: any) => a.id != this.settings.HorseRacingId && a.id != this.settings.GreyhoundId)
                .map((a: any) => a.id);
            if (!ids.length) {
                ids = (this.$scope.eventTypes || []).map((e: any) => e.id).filter((id: any) => !!id);
            }
            console.log('[inplay-debug] loadAllMarkets() eventTypeIds for getpopularsports:', ids);
            if (!ids.length) { console.warn('[inplay-debug] no eventTypeIds — skipping popular load'); return; }
            this.marketOddsService.getPopularSports(30, ids)
                .success((response: common.messaging.IResponse<any>) => {
                    var popular = (response && response.data) || [];
                    console.log('[inplay-debug] getpopularsports response:', {
                        success: response && response.success,
                        markets: popular.length,
                        liveCount: popular.filter((m: any) => !!m.inPlay).length,
                        inPlaySample: popular.filter((m: any) => !!m.inPlay).map((m: any) => ({ name: m.event && m.event.name, inPlay: m.inPlay, eventTypeId: m.eventTypeId })).slice(0, 10),
                        inPlayValuesSeen: popular.map((m: any) => m.inPlay).filter((v: any, i: any, a: any) => a.indexOf(v) === i)
                    });
                    if (response.success) {
                        this.mergePopularMarkets(response.data || []);
                        this.refreshGrouping();
                    }
                })
                .error((err: any, status: any) => {
                    console.error('[inplay-debug] getpopularsports FAILED status=' + status, err);
                });
        }

        private mergePopularMarkets(markets: any[]): void {
            markets.forEach((m: any) => {
                this.decorateMarket(m);
                var etId = m.eventTypeId;
                if (!etId) { return; }
                var et = this.$scope.eventTypes.filter((e: any) => e.id == etId)[0];
                if (!et) {
                    // Popular-feed markets carry no eventType object, so resolve the sport
                    // name from the tab filters (by id) for the per-game icon/label.
                    var f = (this.$scope.filters || []).filter((x: any) => x.id == etId)[0];
                    var name = (f && f.name)
                        || (m.event && m.event.eventType && m.event.eventType.name)
                        || (m.eventType && m.eventType.name) || '';
                    et = { id: etId, name: name, markets: [] };
                    this.$scope.eventTypes.push(et);
                }
                // Dedup: an in-play market can also appear in the popular feed.
                if (!et.markets.some((x: any) => x.id == m.id)) { et.markets.push(m); }
            });
        }

        // Normalize a market record from either the in-play or popular feed so the
        // template bindings (eventTypeId, hasVideo, hasFancy, draw) work for both.
        private decorateMarket(m: any): void {
            if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
            if (m.marketRunner && m.marketRunner.length > 2) { m.hasAnyDrawMarket = true; }
            m.eventTypeId = (m.event && m.event.eventType) ? m.event.eventType.id
                : (m.eventType ? m.eventType.id : m.eventTypeId);
            m.hasVideo = (m.event && m.event.videoId) ? true : false;
            m.hasFancy = (m.event && m.event.hasFancy) ? true : false;
        }

        // Rebuild competition grouping + re-subscribe odds after the market set changes.
        // Does NOT touch isRequestProcessing — the loader is cleared as soon as in-play
        // loads so background popular-market merges can never block the UI/tabs.
        private refreshGrouping(): void {
            if (this.settings.ThemeName == 'sports') { this.countCompetition(); }
            this.subscribeOdds();
            console.log('[inplay-debug] refreshGrouping summary:', {
                theme: this.settings.ThemeName,
                gameFilter: this.$scope.gameFilter,
                selectedEventType: this.$scope.selectedEventType,
                filtersCount: (this.$scope.filters || []).length,
                eventTypeGroups: (this.$scope.eventTypes || []).length,
                competitions: (this.$scope.competitions || []).length,
                totalMarkets: (this.$scope.eventTypes || []).reduce((n: number, e: any) => n + ((e.markets || []).length), 0),
                visibleForSelected: (typeof this.$scope.visibleCount === 'function') ? this.$scope.visibleCount(this.$scope.selectedEventType) : 'n/a',
                eventTypeIdsWithCounts: (this.$scope.eventTypes || []).map((e: any) => ({ id: e.id, name: e.name, markets: (e.markets || []).length, live: (e.markets || []).filter((m: any) => !!m.inPlay).length })),
                liveMarketsTotal: (this.$scope.eventTypes || []).reduce((n: number, e: any) => n + (e.markets || []).filter((m: any) => !!m.inPlay).length, 0),
                liveMarketsSample: (this.$scope.eventTypes || []).reduce((arr: any[], e: any) => arr.concat((e.markets || []).filter((m: any) => !!m.inPlay).map((m: any) => ({ sport: e.name, name: m.event && m.event.name, inPlay: m.inPlay }))), []).slice(0, 10)
            });
        }

        public subscribeOdds(): void {
            var mids: any[] = [];
            var eventids: any[] = [];

            if (this.$scope.eventTypes.length > 0) {
                this.$scope.eventTypes.forEach((e: any) => {
                    e.markets.forEach((m: any) => {
                        if (m.marketStatus != common.enums.MarketStatus.CLOSED) {
                            mids.push(m.id);
                        }
                        if (m.marketStatus != common.enums.MarketStatus.CLOSED
                            && m.event.sourceId) {
                            eventids.push(m.event.sourceId);
                        }
                    });
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
                if (this.$scope.eventTypes.length > 0) {
                    this.$scope.eventTypes.forEach((e: any) => {
                        e.markets.forEach((m: any) => {
                            if (m.id == data.id) {
                                this.setOddsInMarket(m, data);
                            }
                        });
                    });
                }

            });
        }

        // Today/Tomorrow markets
        private loadEventTypes(): void {
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                this.$scope.filters = value;
                if (this.$scope.filters.length > 0) {
                    this.$scope.filters = this.$scope.filters.filter((a: any) => { return a.displayOrder > 0 && a.id != this.settings.HorseRacingId && a.id != this.settings.GreyhoundId; });
                    this.$scope.filters.forEach((a: any) => { a.checked = true; });
                    // Honor ?tab=<sport> — pick the matching filter if present, else default to the first one.
                    var tabParam = this.$stateParams && this.$stateParams.tab ? String(this.$stateParams.tab).toLowerCase() : '';
                    var targetName = InplayCtrl.SPORT_TAB_MAP[tabParam];
                    var match = targetName ? this.$scope.filters.filter((a: any) => a.name === targetName)[0] : null;
                    this.$scope.selectedEventType = match ? match.id : this.$scope.filters[0].id;
                    if (this.settings.ThemeName == 'sports') { this.setSwiperForSports(); }
                }

            });
        }

        private eventTypeChanged(all: boolean = false): void {
            if (all) {
                this.$scope.filters.forEach((a: any) => { a.checked = this.$scope.selectAll; });
            }
            else {
                var result = this.$scope.filters.every((a: any) => { return a.checked == true; });
                this.$scope.selectAll = result;
            }
        }

        private loadMarketsByDays(): void {
            var model = { day: this.$scope.currentTab, eventTypeIds: [] };
            if (!this.$scope.selectAll) {
                this.$scope.filters.forEach((a: any) => { if (a.checked) { model.eventTypeIds.push(a.id); } });
            }
            this.marketOddsService.getMarketsByDays(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.$scope.marketDetails = response.data; }
                });
        }

        // place bet
        private placeBet(h: any, side: any, runnerId: any, price: any, runnerName: string): void {
            var model = new common.helpers.BetModal(h, side, runnerId, price, runnerName);
            this.$scope.stopPPL = true;
            this.$scope.inlineOnMarketOnly = true;
            super.executeBet(model.model);
        }

        private getScore(dataarray: any): void {
            angular.forEach(dataarray, (data: any) => {
                this.$scope.eventTypes.forEach((e: any) => {
                    angular.forEach(e.markets, (m: any) => {
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
            });

        }


        private setSwiperForSports(): void {
            this.$timeout(() => {
                var mySwiper4 = new Swiper('#swiper8', {
                    // Optional parameters
                    slidesPerView: (this.isMobile.any ? 4 : 8),
                    spaceBetween: 5, freeMode: true,
                });
            }, 100);
        }

        private countCompetition() {
            this.$scope.competitions = [];
            angular.forEach(this.$scope.eventTypes, (e: any) => {
                angular.forEach(e.markets, (p: any) => {
                    if (!p.event.competitionId) {
                        p.event.competitionId = -9999;
                        p.event.competitionName = 'Other Popular';
                    }
                    var cIndex = common.helpers.Utility.IndexOfObject(this.$scope.competitions, 'id', p.event.competitionId);
                    if (cIndex <= -1) {
                        // Use the parent group's id (always present) rather than p.eventType.id —
                        // popular-feed markets have only eventTypeId (string), no eventType object,
                        // so p.eventType.id would throw and abort grouping → blank page.
                        var etId = e.id || p.eventTypeId || (p.eventType && p.eventType.id);
                        this.$scope.competitions.push({ name: p.event.competitionName, id: p.event.competitionId, eventTypeId: etId });
                    }
                });
            });
        }
    }


    angular.module('intranet.home').controller('inplayCtrl', InplayCtrl);
}