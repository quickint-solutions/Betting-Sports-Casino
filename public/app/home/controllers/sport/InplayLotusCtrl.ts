module intranet.home {

    export interface IInplayLotusScope extends intranet.common.IBetScopeBase {
        filters: any[];

        inPlayMarkets: any[];
        popularMarkets: any[];
        liveGamesHighlight: any[];
        liveGamesMarkets: any[];
        liveGameEventName: any;
        pinnedMarkets: any[];

        totalBets: any;
        totalInplayBets: any;
        totalPopularBets: any;
        allVideos: any[];

        timer_nextmarket: any;
        imagePath: any;
        hasCasino: any;

        isRequestProcessing: boolean;

        //bking
        selectedEventTypeName: any;

        cricketId: any;
        soccerId: any;
        tennisId: any;
        horseId: any;
        greyHoundId: any;
    }

    export class InplayLotusCtrl extends intranet.common.BetControllerBase<IInplayLotusScope>
        implements intranet.common.init.IInit {
        constructor($scope: IInplayLotusScope,
            private marketOddsService: services.MarketOddsService,
            public $timeout: ng.ITimeoutService,
            public $rootScope: any,
            private $q: ng.IQService,
            private $state: any,
            public $compile: any,
            public WSSocketService: any,
            public placeBetDataService: common.services.PlaceBetDataService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public toasterService: intranet.common.services.ToasterService,
            private commentaryService: services.CommentaryService,
            private videoService: services.VideoService,
            private eventService: services.EventService,
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

            this.$scope.$on('$destroy', () => {
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
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
            this.$scope.liveGamesHighlight.forEach((event: any) => {
                if (event.market.id == marketid) {
                    event.market.betInProcess = true;
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
            this.$scope.liveGamesHighlight.forEach((event: any) => {
                if (event.market.id == marketid) {
                    event.market.betInProcess = false;
                }
            });
        }

        public initScopeValues() {
            this.$scope.inPlayMarkets = [];
            this.$scope.popularMarkets = [];
            this.$scope.liveGamesHighlight = [];
            this.$scope.liveGamesMarkets = [];
            this.$scope.filters = [];
            this.$scope.totalBets = 0;
            this.$scope.allVideos = [];
            this.$scope.isRequestProcessing = false;
            this.$scope.pinnedMarkets = [];
            this.$scope.selectedEventTypeName = '!alleventypes';

            this.$scope.cricketId = this.settings.CricketId;
            this.$scope.soccerId = this.settings.SoccerId;
            this.$scope.tennisId = this.settings.TennisId;
            this.$scope.horseId = this.settings.HorseRacingId;
            this.$scope.greyHoundId = this.settings.GreyhoundId;
        }

        public loadInitialData() {
            this.loadPinnedMarkets();
            this.loadInPlayMarkets();
            this.loadEventTypes();
            //this.loadLiveGameHighlights();
            this.loadLiveGamesMarkets();
            if (this.settings.ThemeName == 'bking') { this.startBkingSlick(); }
            else {
                this.setSlick();
            }
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

        private setSlick() {
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


        private loadInPlayMarkets(): void {
            this.$scope.isRequestProcessing = true;
            this.marketOddsService.getInPlayMarkets()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        var eventTypes = response.data;
                        eventTypes.forEach((e: any, index: any) => {
                            e.markets.forEach((m: any, mindex: any) => {
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
                    this.subscribeOdds();
                });;
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

        private loadPopularMarkets(marketCount: any): void {
            var model = { top: marketCount, eventTypeIds: [] };
            this.$scope.filters.forEach((a: any) => { if (a.checked) { model.eventTypeIds.push(a.id); } });
            this.marketOddsService.getPopularMarkets(model)
                .success((response: common.messaging.IResponse<any>) => {
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
                }).finally(() => { this.subscribeOdds(); });
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
                                                if (this.commonDataService.BetInProcess(fullMarket.id)) {
                                                    fullMarket.betInProcess = true;
                                                }
                                                event.market = this.setFixOddRunner(fullMarket);
                                            }
                                            this.$scope.liveGamesHighlight.push(event);
                                        });
                                    }
                                }).finally(() => {
                                    this.subscribeOdds();
                                });
                        }
                    });
                }
            });
        }

        private loadLiveGamesMarkets(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        this.$scope.hasCasino = data.hasCasino;
                        if (data.hasCasino) {
                            this.$scope.liveGamesMarkets = common.helpers.CommonHelper.GetLiveGameIconList(this.settings.ThemeName);
                        }
                    }
                });
        }

        private openFDGame(lg) {
            this.commonDataService.setGameId(lg.tableId);
            this.$state.go('base.livegames');
        }

        private openCasino(gameId) {
            this.commonDataService.setGameId(gameId);
            this.$state.go('base.livegames');
        }

        private loadAllVideos(): ng.IPromise<any> {
            var defer = this.$q.defer();
            this.videoService.getAllVideosDetail()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        response.data.forEach((r: any) => { r.video.forEach((v: any) => { this.$scope.allVideos.push(v); }) });
                    }
                }).finally(() => { defer.resolve(); });
            return defer.promise;
        }


        // place bet
        private placeBet(h: any, side: any, runnerId: any, price: any, runnerName: string): void {
            var model = new common.helpers.BetModal(h, side, runnerId, price, runnerName);
            this.$scope.stopPPL = true;
            this.$scope.inlineOnMarketOnly = true;
            super.executeBet(model.model);
        }

        private treeClick1(nodetype: any, id: any, name: any) {
            this.$rootScope.$emit('on-sporttree-click-outside', { nodetype: nodetype, id: id, name: name });
        }
    }

    angular.module('intranet.home').controller('inplayLotusCtrl', InplayLotusCtrl);
}