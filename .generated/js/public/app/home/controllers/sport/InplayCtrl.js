var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class InplayCtrl extends intranet.common.BetControllerBase {
            constructor($scope, marketOddsService, $timeout, $rootScope, isMobile, $compile, WSSocketService, placeBetDataService, localStorageHelper, toasterService, commonDataService, settings, betService) {
                super($scope);
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
                this.$scope.eventTypes.forEach((e) => {
                    e.markets.forEach((m) => {
                        if (m.id != marketid) {
                            m.betInProcess = true;
                        }
                    });
                });
            }
            betProcessComplete(marketid) {
                this.$scope.eventTypes.forEach((e) => {
                    e.markets.forEach((m) => {
                        if (m.id != marketid) {
                            m.betInProcess = false;
                        }
                    });
                });
            }
            initScopeValues() {
                this.$scope.hasAnyDrawMarket = true;
                this.$scope.eventTypes = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.currentTab = 2;
                this.$scope.selectAll = true;
                this.$scope.marketDetails = [];
            }
            loadInitialData() {
                this.$scope.isRequestProcessing = true;
                this.loadPinnedMarkets();
                this.loadInPlayMarkets();
                this.loadEventTypes();
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
            loadMarkets(index) {
                this.$scope.currentTab = index;
                if (index == 2) {
                    this.subscribeOdds();
                }
                else {
                    this.loadMarketsByDays();
                    this.unsubscribeOdds();
                }
            }
            loadInPlayMarkets() {
                this.marketOddsService.getInPlayMarkets()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypes = response.data;
                        this.$scope.eventTypes.forEach((e) => {
                            e.markets.forEach((m) => {
                                if (this.commonDataService.BetInProcess(m.id)) {
                                    m.betInProcess = true;
                                }
                                if (m.marketRunner.length > 2) {
                                    m.hasAnyDrawMarket = true;
                                }
                                m.eventTypeId = m.eventType.id;
                                m.hasVideo = m.event.videoId ? true : false;
                                m.hasFancy = m.event.hasFancy ? true : false;
                            });
                        });
                        if (this.settings.ThemeName == 'sports') {
                            this.countCompetition();
                        }
                        this.subscribeOdds();
                    }
                }).finally(() => { this.$scope.isRequestProcessing = false; });
            }
            subscribeOdds() {
                var mids = [];
                var eventids = [];
                if (this.$scope.eventTypes.length > 0) {
                    this.$scope.eventTypes.forEach((e) => {
                        e.markets.forEach((m) => {
                            if (m.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                                mids.push(m.id);
                            }
                            if (m.marketStatus != intranet.common.enums.MarketStatus.CLOSED
                                && m.event.sourceId) {
                                eventids.push(m.event.sourceId);
                            }
                        });
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
                    if (this.$scope.eventTypes.length > 0) {
                        this.$scope.eventTypes.forEach((e) => {
                            e.markets.forEach((m) => {
                                if (m.id == data.id) {
                                    this.setOddsInMarket(m, data);
                                }
                            });
                        });
                    }
                });
            }
            loadEventTypes() {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    this.$scope.filters = value;
                    if (this.$scope.filters.length > 0) {
                        this.$scope.filters = this.$scope.filters.filter((a) => { return a.displayOrder > 0 && a.id != this.settings.HorseRacingId && a.id != this.settings.GreyhoundId; });
                        this.$scope.filters.forEach((a) => { a.checked = true; });
                        this.$scope.selectedEventType = this.$scope.filters[0].id;
                        if (this.settings.ThemeName == 'sports') {
                            this.setSwiperForSports();
                        }
                    }
                });
            }
            eventTypeChanged(all = false) {
                if (all) {
                    this.$scope.filters.forEach((a) => { a.checked = this.$scope.selectAll; });
                }
                else {
                    var result = this.$scope.filters.every((a) => { return a.checked == true; });
                    this.$scope.selectAll = result;
                }
            }
            loadMarketsByDays() {
                var model = { day: this.$scope.currentTab, eventTypeIds: [] };
                if (!this.$scope.selectAll) {
                    this.$scope.filters.forEach((a) => { if (a.checked) {
                        model.eventTypeIds.push(a.id);
                    } });
                }
                this.marketOddsService.getMarketsByDays(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.marketDetails = response.data;
                    }
                });
            }
            placeBet(h, side, runnerId, price, runnerName) {
                var model = new intranet.common.helpers.BetModal(h, side, runnerId, price, runnerName);
                this.$scope.stopPPL = true;
                this.$scope.inlineOnMarketOnly = true;
                super.executeBet(model.model);
            }
            getScore(dataarray) {
                angular.forEach(dataarray, (data) => {
                    this.$scope.eventTypes.forEach((e) => {
                        angular.forEach(e.markets, (m) => {
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
            setSwiperForSports() {
                this.$timeout(() => {
                    var mySwiper4 = new Swiper('#swiper8', {
                        slidesPerView: (this.isMobile.any ? 4 : 8),
                        spaceBetween: 5, freeMode: true,
                    });
                }, 100);
            }
            countCompetition() {
                this.$scope.competitions = [];
                angular.forEach(this.$scope.eventTypes, (e) => {
                    angular.forEach(e.markets, (p) => {
                        if (!p.event.competitionId) {
                            p.event.competitionId = -9999;
                            p.event.competitionName = 'Other Popular';
                        }
                        var cIndex = intranet.common.helpers.Utility.IndexOfObject(this.$scope.competitions, 'id', p.event.competitionId);
                        if (cIndex <= -1) {
                            this.$scope.competitions.push({ name: p.event.competitionName, id: p.event.competitionId, eventTypeId: p.eventType.id });
                        }
                    });
                });
            }
        }
        home.InplayCtrl = InplayCtrl;
        angular.module('intranet.home').controller('inplayCtrl', InplayCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=InplayCtrl.js.map