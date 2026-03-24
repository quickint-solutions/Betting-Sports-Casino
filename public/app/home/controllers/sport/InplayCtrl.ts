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
    }

    export class InplayCtrl extends intranet.common.BetControllerBase<IInplayScope>
        implements intranet.common.init.IInit {
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
            public betService: services.BetService) {
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
            this.marketOddsService.getInPlayMarkets()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventTypes = response.data;
                        this.$scope.eventTypes.forEach((e: any) => {
                            e.markets.forEach((m: any) => {
                                if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                                if (m.marketRunner.length > 2) {
                                    m.hasAnyDrawMarket = true;
                                }
                                m.eventTypeId = m.eventType.id;
                                m.hasVideo = m.event.videoId ? true : false;
                                m.hasFancy = m.event.hasFancy ? true : false;
                            });
                        }); if (this.settings.ThemeName == 'sports') { this.countCompetition(); }
                        this.subscribeOdds();
                    }
                }).finally(() => { this.$scope.isRequestProcessing = false; });
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
                    this.$scope.selectedEventType = this.$scope.filters[0].id;
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
                        this.$scope.competitions.push({ name: p.event.competitionName, id: p.event.competitionId, eventTypeId: p.eventType.id });
                    }
                });
            });
        }
    }


    angular.module('intranet.home').controller('inplayCtrl', InplayCtrl);
}