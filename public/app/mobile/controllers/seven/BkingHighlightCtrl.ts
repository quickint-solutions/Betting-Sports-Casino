module intranet.mobile {
    export interface IBkingHighlightScope extends intranet.common.IBetScopeBase {
        highlights: any[];

        hasAnyDrawMarket: boolean;

        eventTypes: any[];
        selectedEventType: any;

        pinnedMarkets: any[];
        currentInlineBet: any;

        eventTypeName: any;
    }

    export class BkingHighlightCtrl extends intranet.common.BetControllerBase<IBkingHighlightScope>
        implements intranet.common.init.IInit {
        constructor($scope: IBkingHighlightScope,
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
            private eventService: services.EventService,
            private $q: ng.IQService) {
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
            this.$scope.hasAnyDrawMarket = false;
            this.$scope.eventTypes = [];
            this.$scope.pinnedMarkets = [];
            this.$scope.highlights = [];
        }

        public loadInitialData() {
            this.loadPinnedMarkets();
            this.loadHighlightsBasedOnURL();

            if (this.$stateParams.eventTypeId) {
                this.commonDataService.getEventTypes().then(() => {
                    this.$scope.eventTypeName = this.commonDataService.getEventTypeName(this.$stateParams.eventTypeId);
                });
            }
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



        // load market list based on sport node type and user clicked event type
        private loadHighlightsBySportNodeType(model: any): void {
            var defer = this.$q.defer();
            var promise;
            if (model.nodeType == common.enums.SportNodeType.EventType) {
                promise = this.marketOddsService.getHighlightbyEventTypeId(model.id);
            }
            else if (model.nodeType == common.enums.SportNodeType.Competition) {
                promise = this.marketOddsService.getHighlightbyCompetitionId(this.$stateParams.eventTypeId, model.id);
            }
            else if (model.nodeType == common.enums.SportNodeType.Event) {
                promise = this.marketOddsService.getHighlightbyEventId(model.id);
            }
            this.commonDataService.addMobilePromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) { this.$scope.highlights = response.data; }
            }).finally(() => { defer.resolve(); });

            defer.promise.finally(() => {
                this.$scope.highlights.forEach((m: any) => {
                    if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                    if (m.marketRunner.length > 2) {
                        this.$scope.hasAnyDrawMarket = true;
                    }
                });
                this.subscribeOdds();
            });
        }

        public subscribeOdds(): void {
            var mids: any[] = [];

            if (this.$scope.highlights.length > 0) {
                this.$scope.highlights.forEach((m: any) => {
                    if (m.marketStatus != common.enums.MarketStatus.CLOSED) {
                        mids.push(m.id);
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



        // place bet
        private placeBet(h: any, side: any, runnerId: any, price: any, runnerName: string, sectionId: any=''): void {
            var model = new common.helpers.BetModal(h, side, runnerId, price, runnerName);
            model.model.sectionId = sectionId;
            model.model.isMobile = true;
            this.$scope.stopPPL = true;
            if (this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'bking') { this.$scope.inlineOnMarketOnly = true; }
            super.executeBet(model.model);
        }

    }

    angular.module('intranet.mobile').controller('bkingHighlightCtrl', BkingHighlightCtrl);
}