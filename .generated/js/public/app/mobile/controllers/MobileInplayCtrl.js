var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class MobileInplayCtrl extends intranet.common.ControllerBase {
            constructor($scope, marketOddsService, localStorageHelper, settings) {
                super($scope);
                this.marketOddsService = marketOddsService;
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.eventTypes = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.currentTab = 2;
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.loadInPlayMarkets();
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
                if (index != 2) {
                    this.loadMarketsByDays();
                }
                else {
                    this.loadInPlayMarkets();
                }
            }
            loadInPlayMarkets() {
                this.marketOddsService.getInPlayMarkets()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypes = response.data;
                    }
                });
            }
            loadMarketsByDays() {
                var model = { day: this.$scope.currentTab, eventTypeIds: [] };
                this.marketOddsService.getMarketsByDayMobile(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypes = response.data;
                    }
                });
            }
        }
        mobile.MobileInplayCtrl = MobileInplayCtrl;
        angular.module('intranet.mobile').controller('mobileInplayCtrl', MobileInplayCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileInplayCtrl.js.map