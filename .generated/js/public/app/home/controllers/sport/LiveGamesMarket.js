var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class LiveGamesMarketCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, marketOddsService, $timeout, toasterService, $rootScope, videoService, $compile, $state, $filter, WSSocketService, marketService, placeBetDataService, localStorageHelper, commonDataService, localCacheHelper, settings, betService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.toasterService = toasterService;
                this.$rootScope = $rootScope;
                this.videoService = videoService;
                this.$compile = $compile;
                this.$state = $state;
                this.$filter = $filter;
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
                    this.$timeout.cancel(this.$scope.timer_nextmarket);
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
            }
            betProcessComplete(marketid) {
                if (this.$scope.fullMarket.id == marketid) {
                    this.$scope.fullMarket.betInProcess = false;
                }
            }
            calculatePPL(singlemarket = true) {
                this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
                if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                    if (singlemarket && this.$scope.fullMarket) {
                        var bets = this.$scope.placeBetData.bets.filter((b) => { return b.marketId == this.$scope.fullMarket.id; });
                        intranet.common.helpers.PotentialPLCalc.calcPL(this.$scope.fullMarket, bets);
                    }
                }
                else {
                    if (this.$scope.fullMarket) {
                        this.$scope.fullMarket.marketRunner.forEach((mr) => {
                            mr.pPL = 0;
                            mr.pstake = 0;
                            if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Up7Down) {
                                this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                    mr.metadata.up7down.forEach((d) => { d.pstake = 0; });
                                });
                            }
                            if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.DragonTiger) {
                                this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                    if (mr.metadata) {
                                        mr.metadata.dragonTiger.forEach((d) => { d.pstake = 0; });
                                    }
                                });
                            }
                            if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Card32) {
                                this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                    if (mr.metadata && mr.metadata.card32) {
                                        mr.metadata.card32.forEach((d) => { d.pstake = 0; });
                                    }
                                });
                            }
                            if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.ClashOfKings) {
                                this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                    if (mr.metadata && mr.metadata.clashOfKing) {
                                        mr.metadata.clashOfKing.forEach((d) => { d.pstake = 0; });
                                    }
                                });
                            }
                        });
                    }
                }
            }
            initScopeValues() {
                this.$scope.resultsList = [];
                this.$scope.cardImagePath = this.settings.ImagePath + 'images/scards/';
                this.$scope.themeImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            }
            loadInitialData() {
                this.handleEventChange();
                this.getFullmarket();
            }
            startVideo(eventId) {
                this.videoService.getVideoByEvent(eventId)
                    .success((response) => {
                    if (response.success) {
                        if (response.data && response.data.streamName) {
                            this.$scope.wcs_video = response.data;
                        }
                    }
                });
            }
            handleEventChange() {
                this.localCacheHelper.put('eventid', '');
                this.$scope.$emit('event-changed', '');
            }
            getFullmarket() {
                this.marketOddsService.getGameByEventId(this.$stateParams.eventid)
                    .success((response) => {
                    this.$scope.fullMarket = response.data;
                    if (this.$scope.fullMarket && this.$scope.fullMarket.event) {
                        this.startVideo(this.$scope.fullMarket.event.id);
                        this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                        if (this.$scope.fullMarket.bettingType == intranet.common.enums.BettingType.FIXED_ODDS) {
                            if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti2) {
                                var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                this.$scope.fullMarket.pattiRunner = metadata.patti2;
                            }
                            else if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.PokerT20) {
                                var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                this.$scope.fullMarket.pattiRunner = metadata.pokert20;
                            }
                            else if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti3) {
                                var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                this.$scope.fullMarket.pattiRunner = metadata.patti3;
                            }
                            else if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.DragonTiger ||
                                this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Up7Down ||
                                this.$scope.fullMarket.gameType == intranet.common.enums.GameType.ClashOfKings) {
                                this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                    if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                        mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                        mr.runnerGroup = mr.metadata.runnerGroup;
                                    }
                                });
                            }
                            else if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti10) {
                                this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                    mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                    mr.runnerGroup = mr.metadata.runnerGroup;
                                });
                            }
                        }
                        else {
                            if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Card32) {
                                this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                    if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                        mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                        mr.runnerGroup = mr.metadata.runnerGroup;
                                    }
                                });
                            }
                        }
                        if (response.data.gameString) {
                            this.setGameString(response.data.gameString);
                        }
                        this.getRecentResults();
                    }
                }).finally(() => { this.subscribeOdds(); this.calculatePPL(); });
            }
            getNextMarket(lastMarketId) {
                this.$timeout.cancel(this.$scope.timer_nextmarket);
                var currentMarketId = lastMarketId;
                this.marketOddsService.getGameByEventId(this.$stateParams.eventid)
                    .success((response) => {
                    if (response.success && response.data && response.data.id) {
                        if (response.data.id != currentMarketId) {
                            this.$scope.fullMarket = response.data;
                            this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                            if (this.$scope.fullMarket.bettingType == intranet.common.enums.BettingType.FIXED_ODDS) {
                                if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti2) {
                                    var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.fullMarket.pattiRunner = metadata.patti2;
                                }
                                else if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.PokerT20) {
                                    var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.fullMarket.pattiRunner = metadata.pokert20;
                                }
                                else if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti3) {
                                    var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.fullMarket.pattiRunner = metadata.patti3;
                                }
                                else if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.DragonTiger ||
                                    this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Up7Down ||
                                    this.$scope.fullMarket.gameType == intranet.common.enums.GameType.ClashOfKings) {
                                    this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                        if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                            mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                            mr.runnerGroup = mr.metadata.runnerGroup;
                                        }
                                    });
                                }
                                else if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti10) {
                                    this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                        mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                        mr.runnerGroup = mr.metadata.runnerGroup;
                                    });
                                }
                            }
                            else {
                                if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Card32) {
                                    this.$scope.fullMarket.marketRunner.forEach((mr) => {
                                        if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                            mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                            mr.runnerGroup = mr.metadata.runnerGroup;
                                        }
                                    });
                                }
                            }
                            this.getRecentResults();
                            this.subscribeOdds();
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed && this.$scope.fullMarket.id == lastMarketId) {
                        this.$scope.timer_nextmarket = this.$timeout(() => {
                            this.getNextMarket(lastMarketId);
                        }, 2000);
                    }
                });
            }
            getRecentResults() {
                var count = 20;
                if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.AndarBahar || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Up7Down || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.DragonTiger) {
                    count = 75;
                }
                this.marketService.getRecentCloseByEvent(this.$scope.fullMarket.event.id, count)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.resultsList = response.data;
                        if (this.$scope.resultsList.length > 0) {
                            this.$scope.resultsList.forEach((r) => {
                                if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti3 || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti2
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.PokerT20
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.ClashOfKings
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Poker || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Up7Down
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.DragonTiger) {
                                    r.winnerString = this.commonDataService.formatLiveGameResult(r.marketRunner, this.$scope.fullMarket.gameType);
                                }
                                else {
                                    if (r.marketRunner.length > 0) {
                                        r.splt = r.marketRunner[0].runner.name.split(' ');
                                    }
                                    else {
                                        r.splt = ['T', 'T'];
                                    }
                                }
                            });
                        }
                    }
                });
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.fullMarket.id) {
                    mids.push(this.$scope.fullMarket.id);
                }
                this.WSSocketService.sendMessage({
                    Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            setGameString(gs) {
                var gameString = JSON.parse(gs);
                if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.AndarBahar) {
                    if (JSON.stringify(this.$scope.fullMarket.gameString) != JSON.stringify(gameString)) {
                        this.$timeout(() => {
                            jQuery('.card-scroll').each((i, e) => {
                                jQuery(e).scrollLeft(1000);
                            });
                        }, this.$scope.fullMarket.gameString == undefined ? 2000 : 800);
                    }
                    if (gameString.length > 2) {
                        this.$scope.fullMarket.dealtCardCount = gameString[1].cards.length + gameString[2].cards.length;
                    }
                }
                else if (gameString && gameString.length > 0 && gameString[0].cards && gameString[0].cards.length > 0) {
                    if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Up7Down) {
                        this.$scope.fullMarket.winnerCardNumber = gameString[0].cards[0].match(/\d/g).join('');
                    }
                }
                this.$scope.fullMarket.gameString = gameString;
            }
            setMarketOdds(responseData) {
                if (responseData.length > 0) {
                    responseData.forEach((data) => {
                        if (this.$scope.fullMarket && this.$scope.fullMarket.id == data.id && this.$scope.fullMarket.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                            this.setOddsInMarket(this.$scope.fullMarket, data);
                            if (data.gs && data.gs.length > 0) {
                                this.setGameString(data.gs);
                            }
                            if (this.$scope.fullMarket.marketStatus == intranet.common.enums.MarketStatus.CLOSED) {
                                if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Up7Down
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti2
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti3
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Card32
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.ClashOfKings
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.PokerT20
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.DragonTiger) {
                                    this.commonDataService.setWinnerBySection(this.$scope.fullMarket);
                                }
                                this.$timeout(() => { this.getNextMarket(this.$scope.fullMarket.id); }, 5000);
                            }
                        }
                    });
                }
                else {
                    this.$timeout(() => { this.getNextMarket(0); }, 5000);
                }
            }
            placeBet(m, side, runnerId, price, runnerName, sectionId, percentage = 100) {
                if (this.$scope.fullMarket.marketStatus == intranet.common.enums.MarketStatus.OPEN) {
                    var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage);
                    model.model.sectionId = sectionId;
                    if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Card32 || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.ClashOfKings) {
                        model.model.inlineBetFalse = true;
                    }
                    super.executeBet(model.model);
                }
            }
            openBook(marketId, showMe = true) {
                this.commonDataService.openScorePosition(marketId, showMe);
            }
            viewCards(item) {
                this.commonDataService.viewCards(item);
            }
            matkaColSelectionChanged(runnerIndex, g, all = false) {
                if (all) {
                    (this.$scope.fullMarket.marketRunner[runnerIndex].metadata.Sections.filter((m) => { return m.group == g.group; }) || []).forEach((m) => { m.isSelected = g.colSelected; });
                }
            }
            matkaRowSelectionChanged(runnerIndex, r, all = false) {
                if (all) {
                    (this.$scope.fullMarket.marketRunner[runnerIndex].metadata.Sections.filter((m) => { return m.row == r.row; }) || []).forEach((m) => { m.isSelected = r.rowSelected; });
                }
            }
            matkaAllSectionChanged(runnerIndex, selectionstatus) {
                this.$scope.fullMarket.marketRunner[runnerIndex].metadata.Sections.forEach((m) => { m.isSelected = selectionstatus; m.rowSelected = selectionstatus; m.colSelected = selectionstatus; });
            }
        }
        home.LiveGamesMarketCtrl = LiveGamesMarketCtrl;
        angular.module('intranet.home').controller('liveGamesMarketCtrl', LiveGamesMarketCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LiveGamesMarket.js.map