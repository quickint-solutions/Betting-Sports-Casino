var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class UpcomingRaceCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, marketOddsService, $timeout, toasterService, $rootScope, $state, $compile, $filter, $q, WSSocketService, marketService, placeBetDataService, localStorageHelper, commonDataService, localCacheHelper, settings, betService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.toasterService = toasterService;
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$compile = $compile;
                this.$filter = $filter;
                this.$q = $q;
                this.WSSocketService = WSSocketService;
                this.marketService = marketService;
                this.placeBetDataService = placeBetDataService;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.localCacheHelper = localCacheHelper;
                this.settings = settings;
                this.betService = betService;
                var listenPPL = this.$rootScope.$on("catch-for-ppl", () => {
                    this.calculatePPL();
                    this.calculatePPL(false);
                });
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_market_status);
                    this.$timeout.cancel(this.$scope.timer_date_diff);
                    listenPPL();
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListnerMarketOdds();
                });
                super.init(this);
            }
            betProcessStarted(marketid) {
                if (this.$scope.fullMarket.id == marketid) {
                    this.$scope.fullMarket.betInProcess = true;
                }
                else {
                    this.$scope.otherMarkets.forEach((m) => {
                        if (m.id == marketid) {
                            m.betInProcess = true;
                        }
                    });
                }
            }
            betProcessComplete(marketid) {
                if (this.$scope.fullMarket.id == marketid) {
                    this.$scope.fullMarket.betInProcess = false;
                }
                else {
                    this.$scope.otherMarkets.forEach((m) => {
                        if (m.id == marketid) {
                            m.betInProcess = false;
                        }
                    });
                }
            }
            calculatePPL(singlemarket = true) {
                this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
                if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                    if (singlemarket && this.$scope.fullMarket) {
                        var bets = this.$scope.placeBetData.bets.filter((b) => { return b.marketId == this.$scope.fullMarket.id; });
                        intranet.common.helpers.PotentialPLCalc.calcPL(this.$scope.fullMarket, bets);
                    }
                    else {
                        if (this.$scope.otherMarkets) {
                            this.$scope.otherMarkets.forEach((m) => {
                                var bets = this.$scope.placeBetData.bets.filter((b) => { return b.marketId == m.id; });
                                intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                            });
                        }
                    }
                }
                else {
                    if (this.$scope.fullMarket) {
                        this.$scope.fullMarket.marketRunner.forEach((mr) => { mr.pPL = 0; });
                    }
                    if (this.$scope.otherMarkets) {
                        this.$scope.otherMarkets.forEach((m) => {
                            m.marketRunner.forEach((mr) => { mr.pPL = 0; });
                        });
                    }
                }
            }
            initScopeValues() {
                this.$scope.isRequestProcessing = true;
                this.$scope.otherMarkets = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.anyMarketSelected = this.$stateParams.marketid ? true : false;
                this.commonDataService.getEventTypes().then(() => {
                    this.$scope.raceType = this.commonDataService.getEventTypeName(this.$stateParams.id);
                });
            }
            loadInitialData() {
                this.getTopHorseMarkets();
                this.loadPinnedMarkets();
            }
            countDateDiff() {
                this.$scope.fullMarket.datediff = this.$filter('dateDiffTime2')(this.$scope.fullMarket.startTime);
                this.$scope.timer_date_diff = this.$timeout(() => { this.countDateDiff(); }, 1000);
            }
            changeHorseMarket(marketid) {
                this.$state.go("base.home.sport.upcomingrace", { nodetype: this.$stateParams.nodetype, id: this.$stateParams.id, marketid: marketid });
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
            getTopHorseMarkets() {
                this.marketOddsService.getTopRace(this.$stateParams.id)
                    .success((response) => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            var index = intranet.common.helpers.Utility.IndexOfObject(response.data, 'id', this.$stateParams.marketid);
                            index = index < 0 ? 0 : index;
                            this.setFullmarket(response.data[index]);
                            response.data.splice(index, 1);
                            if (response.data.length > 0) {
                                this.setOtherMarkets(response.data);
                            }
                        }
                    }
                }).finally(() => {
                    this.subscribeOdds();
                    this.calculatePPL();
                    this.countStartTime();
                    this.$scope.isRequestProcessing = false;
                    if (this.settings.ThemeName == 'sports') {
                        this.countDateDiff();
                    }
                });
            }
            setFullmarket(data) {
                if (this.$stateParams.marketid && this.$stateParams.marketid != data.id) {
                    this.marketOddsService.getFullMarketById(this.$stateParams.marketid)
                        .success((response) => {
                        this.$scope.fullMarket = response.data;
                        if (this.$scope.fullMarket.event) {
                            this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                            this.$scope.fullMarket.pin = this.isMarketPinned(this.$scope.fullMarket.id);
                            this.commonDataService.setHorseMetadata(this.$scope.fullMarket);
                        }
                    }).finally(() => { this.subscribeOdds(); this.calculatePPL(); });
                }
                else {
                    this.$scope.fullMarket = data;
                    if (this.$scope.fullMarket.event) {
                        this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                        this.$scope.fullMarket.pin = this.isMarketPinned(this.$scope.fullMarket.id);
                        this.commonDataService.setHorseMetadata(this.$scope.fullMarket);
                        this.subscribeOdds();
                        this.calculatePPL();
                    }
                }
            }
            countStartTime() {
                if (this.$scope.fullMarket) {
                    this.$scope.fullMarket.hh = moment().diff(this.$scope.fullMarket.startTime, 'hours') * -1;
                    this.$scope.fullMarket.mm = math.round(moment().diff(this.$scope.fullMarket.startTime, 'minutes') * -1 / 60, 0);
                    this.$filter('dateDiff')(this.$scope.fullMarket.startTime);
                }
            }
            getTabName(group) {
                var name = intranet.common.enums.MarketGroup[group];
                return name.replaceAll('_', ' ');
            }
            setOtherMarkets(data) {
                this.$scope.otherMarkets = this.$filter('orderBy')(data, 'startTime');
                if (this.$scope.otherMarkets.length > 0) {
                    this.$scope.otherMarkets.forEach((m) => {
                        if (this.commonDataService.BetInProcess(m.id)) {
                            m.betInProcess = true;
                        }
                        this.commonDataService.setHorseMetadata(m);
                    });
                }
            }
            selectedTabChanged(index) {
                if ((this.settings.ThemeName == 'sports' || this.settings.ThemeName == 'lotus' || this.settings.ThemeName == 'dimd') && this.$scope.selectedTab == index) {
                    this.$scope.selectedTab = -1;
                }
                else {
                    this.$scope.selectedTab = index;
                }
                this.subscribeOdds();
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.fullMarket && this.$scope.fullMarket.id) {
                    mids.push(this.$scope.fullMarket.id);
                }
                if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                    if (this.$scope.otherMarkets[this.$scope.selectedTab].marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                        mids.push(this.$scope.otherMarkets[this.$scope.selectedTab].id);
                    }
                }
                this.WSSocketService.sendMessage({
                    Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            setMarketOdds(responseData) {
                responseData.forEach((data) => {
                    if (this.$scope.fullMarket && this.$scope.fullMarket.id == data.id) {
                        this.setOddsInMarket(this.$scope.fullMarket, data);
                    }
                    if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                        if (this.$scope.otherMarkets[this.$scope.selectedTab].id == data.id) {
                            this.setOddsInMarket(this.$scope.otherMarkets[this.$scope.selectedTab], data);
                        }
                    }
                });
            }
            placeBet(m, side, runnerId, price, runnerName, eventName) {
                var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName, true, eventName);
                super.executeBet(model.model);
            }
            openBook(marketId, showMe = true) {
                this.commonDataService.openScorePosition(marketId, showMe);
            }
            checkAllMarketStatus() {
                if (this.$scope.timer_market_status) {
                    this.$timeout.cancel(this.$scope.timer_market_status);
                }
                if (this.$scope.fullMarket) {
                    if (this.$scope.otherMarkets.length > 0) {
                        if (this.$scope.fullMarket.marketStatus == intranet.common.enums.MarketStatus.CLOSED) {
                            this.changeHorseMarket(this.$scope.otherMarkets[0].id);
                        }
                    }
                    else {
                        this.isSingleMarketClosed(this.$scope.fullMarket, this.$state);
                    }
                }
                if (this.$scope.otherMarkets.length > 0) {
                    this.isMultiMarketClosed(this.$scope.otherMarkets);
                }
                if (!this.$scope.$$destroyed) {
                    this.$scope.timer_market_status = this.$timeout(() => {
                        this.checkAllMarketStatus();
                    }, 5000);
                }
            }
        }
        home.UpcomingRaceCtrl = UpcomingRaceCtrl;
        angular.module('intranet.home').controller('upcomingRaceCtrl', UpcomingRaceCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UpcomingRaceCtrl.js.map