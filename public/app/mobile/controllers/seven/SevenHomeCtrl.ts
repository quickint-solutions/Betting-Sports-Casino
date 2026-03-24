module intranet.mobile {

    export interface ISevenHomeScope extends intranet.common.IBetScopeBase {
        currentInlineBet: any;
        filters: any[];
        pinnedMarkets: any[];
        currentWebApp: any;

        inPlayMarkets: any[];
        popularMarkets: any[];
        liveGamesHighlight: any[];
        liveGamesMarkets: any[];
        liveGameEventName: any;

        loadderTemplate: string;
        isRequestProcessing: boolean;

        openBets: any[];
        totalBets: any;
        totalInplayBets: any;
        totalPopularBets: any;

        cricketId: any;
        soccerId: any;
        tennisId: any;
        horseId: any;
        greyhoundId: any;
        timer_nextmarket: any;
        imagePath: any;

        generalLoader: any;

        selectedEventTypeName: any;
    }

    export class SevenHomeCtrl extends intranet.common.BetControllerBase<ISevenHomeScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISevenHomeScope,
            private marketOddsService: services.MarketOddsService,
            public $timeout: ng.ITimeoutService,
            private $state: any,
            public $rootScope: any,
            public $compile: any,
            private $q: ng.IQService,
            private commentaryService: services.CommentaryService,
            private $filter: any,
            public WSSocketService: any,
            private videoService: services.VideoService,
            private eventService: services.EventService,
            public placeBetDataService: common.services.PlaceBetDataService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public toasterService: intranet.common.services.ToasterService,
            public commonDataService: common.services.CommonDataService,
            public settings: common.IBaseSettings,
            public betService: services.BetService) {
            super($scope);

            var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
            var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });

            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    this.getOpenBets();
                }
            });

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
                wsListner();
                wsListnerMarketOdds();
                this.$timeout.cancel(this.$scope.timer_nextmarket);
            });
            super.init(this);
        }

        // bet process related
        private betProcessStarted(marketid: any): void {
            this.$scope.inPlayMarkets.forEach((m: any) => {
                if (m.id == marketid) {
                    m.betInProcess = true;
                }
            });
            this.$scope.popularMarkets.forEach((m: any) => {
                if (m.id == marketid) {
                    m.betInProcess = true;
                }
            });
        }

        private betProcessComplete(marketid: any): void {
            this.$scope.inPlayMarkets.forEach((m: any) => {
                if (m.id == marketid) {
                    m.betInProcess = false;
                }
            });
            this.$scope.popularMarkets.forEach((m: any) => {
                if (m.id == marketid) {
                    m.betInProcess = false;
                }
            });
        }

        private registerScrollEvent(): void {
            //jQuery(document).ready(() => {
            jQuery('.markets-odd').each(function (i: any, d: any) {
                jQuery(d).on('mousedown', function (event: any) {
                    jQuery('.markets-odd').each(function (index: any, el: any) {
                        jQuery(el).attr('user', 1)
                    });
                });
            });
            jQuery('.markets-odd').each(function (i: any, d: any) {
                jQuery(d).on('touchstart', function (event: any) {
                    jQuery('.markets-odd').each(function (index: any, el: any) {
                        jQuery(el).attr('user', 1)
                    });
                });
            });

            jQuery('.markets-odd').attr('sleft', 1);
            jQuery('.markets-odd').on('scroll', function (e: any) {
                scrollSame(this.scrollLeft);
                setTimeout(function () { scrollAll(); }, 500);
            });
            var scrollSame = ((svalue: any) => {
                jQuery('.markets-odd').each(function (index: any, div: any) {
                    jQuery(div).scrollLeft(svalue);
                });
            });
            var scrollAll = (() => {
                jQuery('.markets-odd').each(function (index: any, div: any) {
                    var oldcount: any = jQuery(div).attr('sleft');
                    var isuser: any = jQuery(div).attr('user');
                    if (isuser == 1) {
                        if (oldcount % 2 == 0) {
                            jQuery(div).animate({ scrollLeft: '-=500' }, 1000, 'swing');
                            jQuery(div).attr('sleft', 1);
                            jQuery(div).attr('user', 0);
                        } else {
                            jQuery(div).animate({ scrollLeft: '+=500' }, 1000, 'swing');
                            jQuery(div).attr('sleft', 2);
                            jQuery(div).attr('user', 0);
                        }
                    }
                });
            });
            // });
        }

        public initScopeValues() {
            this.$scope.inPlayMarkets = [];
            this.$scope.popularMarkets = [];
            this.$scope.liveGamesHighlight = [];
            this.$scope.liveGamesMarkets = [];
            this.$scope.filters = [];
            this.$scope.isRequestProcessing = false;
            this.$scope.loadderTemplate = this.commonDataService.mobile_highlight_loader_template;
            this.$scope.totalBets = 0;
            this.$scope.currentWebApp = this.settings.WebApp;

            this.$scope.cricketId = this.settings.CricketId;
            this.$scope.soccerId = this.settings.SoccerId;
            this.$scope.tennisId = this.settings.TennisId;
            this.$scope.horseId = this.settings.HorseRacingId;
            this.$scope.greyhoundId = this.settings.GreyhoundId;

            this.$scope.openBets = [];
            this.$scope.imagePath = this.settings.ImagePath + 'images/cover-image/';
            this.$scope.pinnedMarkets = [];
            this.$scope.generalLoader = this.commonDataService.mobilePromisetracker;

            this.$scope.selectedEventTypeName = '!alleventypes';
        }

        public loadInitialData() {
            if (this.settings.ThemeName == 'bking') { this.startBkingSlick(); }
            else {
                this.$timeout(() => {
                    jQuery('.top-banner').slick({
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 2000,
                        //centerMode: true,
                        arrows: false,
                        infinite: true,
                        variableWidth: true,
                        swipeToSlide: true
                    });
                    jQuery('.exchangeGames-content').slick({
                        slidesToShow: 1,
                        slidesToScroll: 3,
                        autoplay: false,
                        autoplaySpeed: 2000,
                        //centerMode: true,
                        arrows: false,
                        infinite: true,
                        variableWidth: true,
                        swipeToSlide: true
                    });
                    jQuery('.popularGames-content').slick({
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: false,
                        autoplaySpeed: 2000,
                        arrows: false,
                        infinite: true,
                        variableWidth: true,
                        swipeToSlide: true
                    });
                }, 1000);
            }
            this.loadPinnedMarkets();
            this.loadInPlayMarkets();
            this.loadEventTypes();
            this.loadLiveGamesMarkets();
            //this.loadLiveGameHighlights();
            this.getOpenBets();
        }

        private startBkingSlick() {
            this.$timeout(() => {
                jQuery('.my-slick-wrapper').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 2000,
                    //centerMode: true,
                    arrows: false,
                    infinite: true,
                    variableWidth: false
                });
            }, 1000);
        }

        private openCasino(gameId) {
            this.commonDataService.setGameId(gameId);
            if (this.settings.ThemeName == 'bking') {
                this.$state.go('mobile.base.fdlivegames');
            } else {
                this.$state.go('mobile.seven.base.fdlivegames');
            }
        }

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

        private loadInPlayMarkets(): void {
            this.$scope.isRequestProcessing = true;
            var promise = this.marketOddsService.getInPlayMarkets();
            this.commonDataService.addMobilePromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    var eventTypes = response.data;
                    eventTypes.forEach((e: any, index: any) => {
                        e.markets.forEach((m: any, mindex: any) => {
                            if (this.commonDataService.BetInProcess(m.id)) {
                                m.betInProcess = true;
                            }
                            m.eventTypeSourceId = e.sourceId;
                            m.open = false;
                            //if (index == 0 && mindex == 0 && this.settings.WebApp != 'lvexch') { m.open = true; }
                            this.$scope.inPlayMarkets.push(m);
                            m.eventTypeName = e.name;
                            m.hasVideo = m.event.videoId ? true : false;
                            m.hasFancy = m.event.hasFancy ? true : false;
                        });
                    });

                }
            }).finally(() => {
                this.$scope.isRequestProcessing = false;
                this.subscribeOdds();

                if (this.settings.ThemeName == 'lotus') {
                    if (this.$scope.inPlayMarkets.length > 0) {

                        //subscribe score
                        var eventids = this.$scope.inPlayMarkets.filter((m: any) => {
                            return m.marketStatus != common.enums.MarketStatus.CLOSED
                                && m.event.sourceId
                        }).map((m: any) => { return m.event.sourceId });

                        this.WSSocketService.sendMessage({
                            Scid: eventids, MessageType: common.enums.WSMessageType.Score
                        });
                    }
                    this.countBets();
                }
            });;
        }

        private getScore(dataarray: any): void {
            angular.forEach(dataarray, (data: any) => {
                angular.forEach(this.$scope.inPlayMarkets, (m: any) => {
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

        public subscribeOdds(): void {
            var mids: any[] = [];

            if (this.$scope.inPlayMarkets.length > 0) {
                this.$scope.inPlayMarkets.forEach((f: any) => {
                    if (f.marketStatus != common.enums.MarketStatus.CLOSED) {
                        mids.push(f.id);
                    }
                });
            }
            if (this.$scope.popularMarkets.length > 0) {
                this.$scope.popularMarkets.forEach((f: any) => {
                    if (f.marketStatus != common.enums.MarketStatus.CLOSED) {
                        mids.push(f.id);
                    }
                });
            }
            if (this.$scope.liveGamesHighlight.length > 0) {
                this.$scope.liveGamesHighlight.forEach((f: any) => {
                    if (f.market.marketStatus != common.enums.MarketStatus.CLOSED) {
                        mids.push(f.market.id);
                    }
                });
            }
            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });
        }

        private setMarketOdds(responseData: any[]): void {
            responseData.forEach((data: any) => {
                if (this.$scope.inPlayMarkets.length > 0) {
                    this.$scope.inPlayMarkets.forEach((f: any) => {
                        if (f.id == data.id) {
                            this.setOddsInMarket(f, data);
                        }
                    });
                }
                if (this.$scope.popularMarkets.length > 0) {
                    this.$scope.popularMarkets.forEach((f: any) => {
                        if (f.id == data.id) {
                            this.setOddsInMarket(f, data);
                        }
                    });
                }
                if (this.$scope.liveGamesHighlight.length > 0) {
                    this.$scope.liveGamesHighlight.forEach((f: any) => {
                        if (f.market.id == data.id) {
                            if (f.market.marketStatus != common.enums.MarketStatus.CLOSED) {
                                this.setOddsInMarket(f.market, data);
                                if (f.market.marketStatus == common.enums.MarketStatus.CLOSED) {
                                    this.$timeout(() => { this.getNextMarket(f.market, f.id); }, 3000);
                                }
                            }
                        }
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
                    this.$scope.filters = this.$scope.filters.filter((a: any) => { return a.id != this.settings.HorseRacingId && a.id != this.settings.GreyhoundId; });
                    this.$scope.filters.forEach((a: any) => { a.checked = true; });
                    this.loadPopularMarkets(10);
                }
            });
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
            this.$state.go('mobile.seven.base.fdlivegames');
        }


        private loadLiveGameHighlights(): void {
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                if (value.length > 0) {
                    angular.forEach(value, (v: any) => {
                        if (v.id == this.settings.LiveGamesId) {
                            this.$scope.liveGameEventName = v.name;
                            this.marketOddsService.getGameHighlightByEventTypeId(this.settings.LiveGamesId)
                                .success((response: common.messaging.IResponse<any>) => {
                                    if (response.success) {
                                        angular.forEach(response.data, (data: any) => {
                                            var event: any = { id: data.id, name: data.name, eventTypeName: this.commonDataService.getEventTypeName(this.settings.LiveGamesId) };
                                            if (data.markets.length > 0) {
                                                var fullMarket = data.markets[0];
                                                event.market = this.setFixOddRunner(fullMarket);
                                            }
                                            this.$scope.liveGamesHighlight.push(event);
                                        });
                                    }
                                }).finally(() => {
                                    this.subscribeOdds();
                                    this.$timeout(() => { this.registerScrollEvent(); this.countBets(); }, 500);
                                });
                        }
                    });
                }
            });
        }

        private setFixOddRunner(fullMarket: any): any {
            fullMarket.betInProcess = this.commonDataService.BetInProcess(fullMarket.id);
            if (fullMarket.bettingType == common.enums.BettingType.FIXED_ODDS) {
                if (fullMarket.gameType == common.enums.GameType.Patti2) {
                    var metadata = JSON.parse(fullMarket.marketRunner[0].runner.runnerMetadata);
                    fullMarket.pattiRunner = metadata.patti2;
                }
                if (fullMarket.gameType == common.enums.GameType.PokerT20) {
                    var metadata = JSON.parse(fullMarket.marketRunner[0].runner.runnerMetadata);
                    fullMarket.pattiRunner = metadata.pokert20;
                }
                else if (fullMarket.gameType == common.enums.GameType.Patti3) {
                    var metadata = JSON.parse(fullMarket.marketRunner[0].runner.runnerMetadata);
                    fullMarket.pattiRunner = metadata.patti3;
                }
                else if (fullMarket.gameType == common.enums.GameType.Up7Down) {
                    fullMarket.marketRunner.forEach((mr: any) => {
                        mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                        mr.runnerGroup = mr.metadata.runnerGroup;
                    });
                }
                else if (fullMarket.gameType == common.enums.GameType.DragonTiger) {
                    fullMarket.marketRunner.forEach((mr: any) => {
                        if (mr.runner.runnerMetadata) {
                            mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                            mr.runnerGroup = mr.metadata.runnerGroup;
                        }
                    });
                }
            }
            return fullMarket;
        }

        private getNextMarket(market: any, eventId: any): void {
            //this.$timeout.cancel(this.$scope.timer_nextmarket);
            var lastMarketId = market.id;
            console.log('current id ' + lastMarketId + ' ' + market.event.name);
            this.marketOddsService.getGameByEventId(eventId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data && response.data.id) {
                        if (response.data.id != lastMarketId) {
                            console.log('new id ' + response.data.id + ' ' + market.event.name);
                            market = this.setFixOddRunner(response.data);
                            angular.forEach(this.$scope.liveGamesHighlight, (h: any) => {
                                if (h.id == market.event.id) { h.market = market; }
                            });
                            this.subscribeOdds();
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed && lastMarketId == market.id) {
                        this.$scope.timer_nextmarket = this.$timeout(() => {
                            this.getNextMarket(market, eventId);
                        }, 3000);
                    }
                });

        }


        private loadPopularMarkets(marketCount: any): void {
            var model = { top: marketCount, eventTypeIds: [] };
            this.$scope.filters.forEach((a: any) => { if (a.checked) { model.eventTypeIds.push(a.id); } });
            var promise = this.marketOddsService.getPopularMarkets(model);
            this.commonDataService.addMobilePromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    if (response.data && response.data.length > 0) {
                        response.data.forEach((mr: any) => {
                            mr.eventTypeName = this.commonDataService.getEventTypeName(mr.event.eventType.id);
                            mr.hasVideo = mr.event.videoId ? true : false;
                            mr.hasFancy = mr.event.hasFancy ? true : false;
                        });
                        this.$scope.popularMarkets = response.data;
                    }
                }
            }).finally(() => { this.subscribeOdds(); this.$timeout(() => { this.registerScrollEvent(); this.countBets(); }, 500); });
        }

        // place bet
        private placeBet(h: any, side: any, runnerId: any, price: any, runnerName: string, sectionId: any): void {
            var model = new common.helpers.BetModal(h, side, runnerId, price, runnerName);
            model.model.sectionId = sectionId;
            model.model.isMobile = true;
            this.$scope.stopPPL = true;
            if (this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'bking') { this.$scope.inlineOnMarketOnly = true; }
            super.executeBet(model.model, true);
        }

        private getOpenBets(): void {
            var promise = this.betService.openBets();
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.$scope.totalBets = 0;
                    if (response.data && response.data.length > 0) {
                        this.$scope.openBets = response.data;
                        response.data.forEach((a: any) => {
                            this.$scope.totalBets = this.$scope.totalBets + a.bets.length;
                        });
                    }
                }
            }).finally(() => { this.countBets(); });
        }

        private countBets(): void {
            this.$scope.totalInplayBets = 0;
            this.$scope.totalPopularBets = 0;
            if (this.$scope.openBets.length > 0 && this.settings.ThemeName == 'lotus') {

                var inplayIds: any[] = [];
                if (this.$scope.inPlayMarkets.length > 0) { inplayIds = this.$scope.inPlayMarkets.map((p: any) => { return p.eventId; }) }
                if (this.$scope.liveGamesHighlight.length > 0) { this.$scope.liveGamesHighlight.forEach((p: any) => { inplayIds.push(p.id); }) }

                var popularIds: any[] = [];
                if (this.$scope.popularMarkets.length > 0) { popularIds = this.$scope.popularMarkets.map((p: any) => { return p.eventId; }) }

                angular.forEach(this.$scope.openBets, (op: any) => {
                    if (inplayIds.indexOf(op.eventId) > -1) { this.$scope.totalInplayBets += op.bets.length; }
                    else if (popularIds.indexOf(op.eventId) > -1) { this.$scope.totalPopularBets += op.bets.length; }
                });

            }
        }


        private openFullMarket(eventId: any): void {
            this.$state.go('mobile.seven.base.market', { eventId: eventId });
        }

        private openGameFullMarket(eventId: any): void {
            this.$state.go('mobile.seven.base.livegamesmarket', { eventid: eventId });
        }
    }

    angular.module('intranet.mobile').controller('sevenHomeCtrl', SevenHomeCtrl);
}