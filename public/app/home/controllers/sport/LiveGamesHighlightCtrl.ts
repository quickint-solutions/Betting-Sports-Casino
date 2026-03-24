module intranet.home {
    export interface ILiveGamesHighlightScope extends intranet.common.IBetScopeBase {
        highlights: any[];
        hasAnyDrawMarket: boolean;
        currentEventName: any;

        timer_nextmarket: any;
        pinnedMarkets: any[];
        currentInlineBet: any;
    }

    export class LiveGamesHighlightCtrl extends intranet.common.BetControllerBase<ILiveGamesHighlightScope>
        implements intranet.common.init.IInit {
        constructor($scope: ILiveGamesHighlightScope,
            private $stateParams: any,
            private marketOddsService: services.MarketOddsService,
            public $timeout: ng.ITimeoutService,
            public $rootScope: any,
            public $compile: any,
            public WSSocketService: any,
            public placeBetDataService: common.services.PlaceBetDataService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public toasterService: intranet.common.services.ToasterService,
            public commonDataService: common.services.CommonDataService,
            public settings: common.IBaseSettings,
            public betService: services.BetService,
            private eventService: services.EventService) {
            super($scope);

            var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
            var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });

            var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                if (response.success) {
                    this.setMarketOdds(response.data);
                }
            });


            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timer_nextmarket);
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
                wsListnerMarketOdds();
            });

            super.init(this);
        }

        // bet process related
        private betProcessStarted(marketid: any): void {
            this.$scope.highlights.forEach((m: any) => {
                if (m.market.id == marketid) { m.market.betInProcess = true; }
            });
        }

        private betProcessComplete(marketid: any): void {
            this.$scope.highlights.forEach((m: any) => {
                if (m.market.id == marketid) { m.market.betInProcess = false; }
            });
        }

        public initScopeValues() {
            this.$scope.hasAnyDrawMarket = false;
            this.$scope.pinnedMarkets = [];
            this.$scope.highlights = [];
        }

        public loadInitialData() {
            this.loadPinnedMarkets();
            this.loadLiveGamesMarkets();
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

        private loadLiveGamesMarkets(): void {
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                if (value.length > 0) {
                    angular.forEach(value, (v: any) => {
                        if (v.id == this.$stateParams.eventTypeId) {
                            this.$scope.currentEventName = v.name;
                            this.marketOddsService.getGameHighlightByEventTypeId(this.$stateParams.eventTypeId)
                                .success((response: common.messaging.IResponse<any>) => {
                                    if (response.success) {
                                        angular.forEach(response.data, (data: any) => {
                                            var event: any = { id: data.id, name: data.name };
                                            if (data.markets.length > 0) {
                                                var fullMarket = data.markets[0];
                                                if (this.commonDataService.BetInProcess(fullMarket.id)) {
                                                    fullMarket.betInProcess = true;
                                                }
                                                if (fullMarket.marketRunner.length > 2) { this.$scope.hasAnyDrawMarket = true; }

                                                event.market = this.setFixOddRunner(fullMarket);
                                            }
                                            this.$scope.highlights.push(event);
                                        });
                                    }
                                }).finally(() => { this.subscribeOdds(); });
                        }
                    });
                }
            });
        }

        public subscribeOdds(): void {
            var mids: any[] = [];

            if (this.$scope.highlights.length > 0) {
                this.$scope.highlights.forEach((m: any) => {
                    if (m.market.marketStatus != common.enums.MarketStatus.CLOSED) {
                        mids.push(m.market.id);
                    }
                });
            }

            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });
        }

        private setMarketOdds(responseData: any[]): void {
            responseData.forEach((data: any) => {
                if (this.$scope.highlights && this.$scope.highlights.length > 0) {
                    this.$scope.highlights.forEach((f: any) => {
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
                else if (fullMarket.gameType == common.enums.GameType.DragonTiger ||
                    fullMarket.gameType == common.enums.GameType.Up7Down ||
                    fullMarket.gameType == common.enums.GameType.ClashOfKings) {
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
            this.marketOddsService.getGameByEventId(eventId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data && response.data.id) {
                        if (response.data.id != lastMarketId) {
                            market = this.setFixOddRunner(response.data);
                            angular.forEach(this.$scope.highlights, (h: any) => {
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

        // place bet
        public placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string, percentage: any = 100, sectionId: any, tdId: number = 0, islast: boolean = false): void {
            if (m.marketStatus == common.enums.MarketStatus.OPEN) {
                var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage);

                if (m.marketRunner.length == tdId && tdId > 0) {
                    this.$scope.inlineElementId = math.multiply(tdId, -1);
                } else {
                    this.$scope.inlineElementId = tdId;
                }
                model.model.sectionId = sectionId;
                if (m.gameType == common.enums.GameType.AndarBahar
                    || m.gameType == common.enums.GameType.Up7Down
                    || m.gameType == common.enums.GameType.DragonTiger) {
                    this.$scope.inlineOnMarketOnly = true;
                    if (islast) { this.$scope.inlineElementId = math.multiply(tdId, -1); }
                }
                super.executeBet(model.model);
            }
        }

    }

    angular.module('intranet.home').controller('liveGamesHighlightCtrl', LiveGamesHighlightCtrl);
}