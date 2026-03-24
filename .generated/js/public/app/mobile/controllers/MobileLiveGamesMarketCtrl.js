var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class MobileLiveGamesMarketCtrl extends intranet.common.BetControllerBase {
            constructor($scope, $stateParams, $rootScope, $state, $compile, $filter, WSSocketService, marketService, commentaryService, marketOddsService, placeBetDataService, $timeout, localStorageHelper, toasterService, commonDataService, localCacheHelper, modalService, exposureService, eventService, promiseTracker, settings, betService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$compile = $compile;
                this.$filter = $filter;
                this.WSSocketService = WSSocketService;
                this.marketService = marketService;
                this.commentaryService = commentaryService;
                this.marketOddsService = marketOddsService;
                this.placeBetDataService = placeBetDataService;
                this.$timeout = $timeout;
                this.localStorageHelper = localStorageHelper;
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.localCacheHelper = localCacheHelper;
                this.modalService = modalService;
                this.exposureService = exposureService;
                this.eventService = eventService;
                this.promiseTracker = promiseTracker;
                this.settings = settings;
                this.betService = betService;
                var listenPPL = this.$rootScope.$on("catch-for-ppl", () => {
                    this.calculatePPL();
                    this.calculatePPL(false);
                });
                var place_bet_started = this.$rootScope.$on("place-bet-started", (event, data) => { this.betProcessStarted(data.marketId); });
                var place_bet_ended = this.$rootScope.$on("place-bet-ended", (event, data) => { this.betProcessComplete(data.marketId); });
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        console.log('mobile live game');
                        this.$rootScope.$emit("balance-changed");
                        this.getOpenBets();
                        var data = JSON.parse(response.data);
                        if (this.$scope.fullMarket != undefined && data.MarketId == this.$scope.fullMarket.id) {
                            this.getExposure();
                        }
                    }
                });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                var body = document.getElementsByTagName('body')[0];
                var smallValue = body.clientWidth > body.clientHeight ? body.clientHeight : body.clientWidth;
                var bigValue = body.clientWidth > body.clientHeight ? body.clientWidth : body.clientHeight;
                this.$scope.iframeHeight = (smallValue / bigValue) * body.clientWidth;
                console.log(this.$scope.iframeHeight);
                this.$scope.$on('$destroy', () => {
                    this.$scope.parent.wcs_video = '';
                    this.$rootScope.displayOneClick = false;
                    this.$timeout.cancel(this.$scope.timer_openbet);
                    this.$timeout.cancel(this.$scope.timer_nextmarket);
                    listenPPL();
                    if (this.$scope.currentInlineBet) {
                        this.placeBetDataService.pushPPL(null);
                    }
                    place_bet_started();
                    place_bet_ended();
                    wsListner();
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
                this.$scope.spinnerImg = this.commonDataService.spinnerImg;
                this.$rootScope.displayOneClick = true;
                this.$scope.selectedTopTab = 0;
                this.$scope.parent = this.$scope.$parent;
                this.$scope.countBets = 0;
                this.$scope.openBets = [];
                this.$scope.resultsList = [];
                this.$scope.editTracker = [];
                this.$scope.openbet_loader = this.promiseTracker({ activationDelay: 100, minDuration: 750 });
                this.$scope.cardImagePath = this.settings.ImagePath + 'images/scards/';
                this.$scope.themeImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
            }
            loadInitialData() {
                this.getFullmarket();
                this.getOtherGames();
            }
            handleEventChange(eventid, bfEventId, eventType) {
                var data = { eventId: eventid, bfEventId: bfEventId, eventType: eventType };
                this.$scope.$emit('event-changed', data);
            }
            getFullmarket() {
                var promise;
                promise = this.marketOddsService.getGameByEventId(this.$stateParams.eventid);
                this.commonDataService.addMobilePromise(promise);
                promise.success((response) => {
                    if (response.success && response.data.event) {
                        this.$scope.fullMarket = response.data;
                        this.handleEventChange(this.$scope.fullMarket.eventId, this.$scope.fullMarket.event.sourceId, this.$scope.fullMarket.eventType.id);
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
                        this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                        if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                            this.$scope.parent.ctrl.loadVideo(true);
                            this.getOpenBets();
                        }
                        else if (this.settings.ThemeName == 'dimd') {
                            this.getOpenBets();
                        }
                        this.getRecentResults();
                    }
                }).finally(() => { this.subscribeOdds(); this.calculatePPL(); });
            }
            getOtherGames() {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    if (value.length > 0) {
                        angular.forEach(value, (v) => {
                            if (v.id == this.settings.LiveGamesId) {
                                var promise = this.eventService.searchGames(this.settings.LiveGamesId);
                                this.commonDataService.addMobilePromise(promise);
                                promise.success((response) => {
                                    if (response.success) {
                                        this.$scope.otherGames = response.data.filter((a) => { return a.id != this.$stateParams.eventid; });
                                        angular.forEach(this.$scope.otherGames, (g) => {
                                            g.cls = 'nosource';
                                            if (g.sourceId)
                                                g.cls = g.sourceId;
                                            g.imagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/' + g.name.replaceAll(' ', '-').replace('(', '').replace(')', '') + '.jpg';
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
            getNextMarket(lastMarketId) {
                this.$timeout.cancel(this.$scope.timer_openbet);
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
                            this.subscribeOdds();
                            this.getRecentResults();
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed && lastMarketId == this.$scope.fullMarket.id) {
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
                if (this.$scope.fullMarket && this.$scope.fullMarket.id) {
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
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.PokerT20
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Patti3
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Card32
                                    || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.ClashOfKings
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
            placeBet(m, side, runnerId, price, runnerName, sectionId = 0, percentage = 100, tdId = 0, islast = false) {
                if (this.$scope.fullMarket.marketStatus == intranet.common.enums.MarketStatus.OPEN) {
                    var model = new intranet.common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage, true);
                    if (m.marketRunner.length == tdId && tdId > 0) {
                        this.$scope.inlineElementId = math.multiply(tdId, -1);
                    }
                    else {
                        this.$scope.inlineElementId = tdId;
                    }
                    model.model.sectionId = sectionId;
                    if (this.$scope.fullMarket.gameType == intranet.common.enums.GameType.AndarBahar
                        || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.Up7Down
                        || this.$scope.fullMarket.gameType == intranet.common.enums.GameType.DragonTiger) {
                        this.$scope.inlineOnMarketOnly = true;
                        if (islast) {
                            this.$scope.inlineElementId = math.multiply(tdId, -1);
                        }
                    }
                    super.executeBet(model.model, true);
                }
            }
            openBook(marketId, showMe = true) {
                this.commonDataService.openScorePosition(marketId, showMe);
            }
            viewCards(item) {
                this.commonDataService.viewCards(item);
            }
            tabChanged(index) {
                this.$scope.selectedTopTab = index;
            }
            getOpenBets() {
                var promise = this.betService.openBetsEvent(this.$scope.fullMarket.eventId);
                this.$scope.openbet_loader.addPromise(promise);
                promise.success((response) => {
                    this.$scope.countBets = 0;
                    if (response.success && response.data) {
                        this.$scope.openBets = response.data;
                        this.commonDataService.setOpenBets(response.data);
                        this.$rootScope.$broadcast("openbets-updated");
                        this.$scope.hasUnmatched = false;
                        this.$scope.hasMatched = false;
                        this.$scope.openBets.forEach((a) => {
                            this.$scope.countBets = this.$scope.countBets + a.bets.length;
                            if (!this.$scope.hasUnmatched) {
                                this.$scope.hasUnmatched = a.bets.some((a) => { return a.sizeRemaining > 0; });
                            }
                            if (!this.$scope.hasMatched) {
                                this.$scope.hasMatched = a.bets.some((a) => { return a.sizeMatched > 0; });
                            }
                        });
                    }
                }).finally(() => {
                });
            }
            checkNewBetSize() {
                if (this.$scope.timer_openbet) {
                    this.$timeout.cancel(this.$scope.timer_openbet);
                }
                this.betService.getOpenBetSizeByEvent(this.$scope.fullMarket.eventId)
                    .success((response) => {
                    if (response.success && response.data) {
                        if (this.$scope.compareBetSize) {
                            if (this.$scope.compareBetSize.sizeMatched != response.data.sizeMatched ||
                                this.$scope.compareBetSize.sizeRemaining != response.data.sizeRemaining ||
                                this.$scope.compareBetSize.sizeCancelled != response.data.sizeCancelled) {
                                this.$scope.compareBetSize.sizeMatched = response.data.sizeMatched;
                                this.$scope.compareBetSize.sizeRemaining = response.data.sizeRemaining;
                                this.$scope.compareBetSize.sizeCancelled = response.data.sizeCancelled;
                                this.$rootScope.$emit("balance-changed");
                                this.getOpenBets();
                            }
                        }
                        else {
                            this.$scope.compareBetSize = {};
                            this.$scope.compareBetSize.sizeMatched = response.data.sizeMatched;
                            this.$scope.compareBetSize.sizeRemaining = response.data.sizeRemaining;
                            this.$scope.compareBetSize.sizeCancelled = response.data.sizeCancelled;
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed) {
                        this.$scope.timer_openbet = this.$timeout(() => {
                        }, 2000);
                    }
                });
            }
            getExposure() {
                this.exposureService.getExposure()
                    .success((response) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
            }
            cancelBet(bet) {
                this.betService.cancelBet(bet.id)
                    .success((response) => {
                    if (response.success) {
                        this.getOpenBets();
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
            }
            cancelAllBets() {
                var ids = [];
                this.$scope.openBets.forEach((o) => {
                    var id = o.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
                    if (id.length > 0) {
                        ids = ids.concat(id);
                    }
                });
                if (ids.length > 0) {
                    this.modalService.showDeleteConfirmation().then((result) => {
                        if (result == intranet.common.services.ModalResult.OK) {
                            this.betService.cancelAllBets(ids)
                                .success((response) => {
                                if (response.success) {
                                    this.getOpenBets();
                                }
                                if (response.messages) {
                                    this.toasterService.showMessages(response.messages, 3000);
                                }
                            });
                        }
                    });
                }
            }
            updateThisBet(detail, bet) {
                this.commonDataService.setBetModelForUpdate(detail, bet);
                this.startInlineBet();
                this.tabChanged(0);
            }
            openInlineToUpdateBet() {
                if (this.$stateParams.betid && this.commonDataService.updateBetModel) {
                    this.startInlineBet();
                }
            }
            startInlineBet() {
                var market = this.findMarket(this.commonDataService.updateBetModel.marketId);
                if (market.id) {
                    super.updateBet(this.commonDataService.updateBetModel);
                }
            }
            findMarket(marketid) {
                var market = {};
                if (this.$scope.fullMarket.id == marketid) {
                    market = this.$scope.fullMarket;
                }
                return market;
            }
        }
        mobile.MobileLiveGamesMarketCtrl = MobileLiveGamesMarketCtrl;
        angular.module('intranet.mobile').controller('mobileLiveGamesMarketCtrl', MobileLiveGamesMarketCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileLiveGamesMarketCtrl.js.map