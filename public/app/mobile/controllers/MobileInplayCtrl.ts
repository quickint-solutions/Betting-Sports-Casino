module intranet.mobile {

    export interface IMobileInplayScope extends intranet.common.IScopeBase {
        pinnedMarkets: any[];
        currentTab: any;
        eventTypes: any[];
    }

    export class MobileInplayCtrl extends intranet.common.ControllerBase<IMobileInplayScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileInplayScope,
            private marketOddsService: services.MarketOddsService,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.eventTypes = [];
            this.$scope.pinnedMarkets = [];
            this.$scope.currentTab = 2;
        }

        public loadInitialData() {
            this.loadPinnedMarkets();
            this.loadInPlayMarkets();
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
            if (index != 2) { this.loadMarketsByDays(); }
            else { this.loadInPlayMarkets(); }
        }

        private loadInPlayMarkets(): void {
            this.marketOddsService.getInPlayMarkets()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventTypes = response.data;
                    }
                });
        }

        private loadMarketsByDays(): void {
            var model = { day: this.$scope.currentTab, eventTypeIds: [] };
            this.marketOddsService.getMarketsByDayMobile(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.$scope.eventTypes = response.data; }
                });
        }

    }

    angular.module('intranet.mobile').controller('mobileInplayCtrl', MobileInplayCtrl);
}