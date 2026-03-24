var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class LiveGameExposureDetailCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, $stateParams, $filter, settings, $timeout, commentaryService, commonDataService, marketOddsService, marketService, exposureService, betService, userService, WSSocketService, $rootScope, positionService) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.$stateParams = $stateParams;
                this.$filter = $filter;
                this.settings = settings;
                this.$timeout = $timeout;
                this.commentaryService = commentaryService;
                this.commonDataService = commonDataService;
                this.marketOddsService = marketOddsService;
                this.marketService = marketService;
                this.exposureService = exposureService;
                this.betService = betService;
                this.userService = userService;
                this.WSSocketService = WSSocketService;
                this.$rootScope = $rootScope;
                this.positionService = positionService;
                var newPageLoader = this.$scope.$on('newPageLoaded', (e, data) => {
                    if (e.targetScope.gridId === 'kt-exposure-livebets-grid') {
                        if (data && data.result.length > 0) {
                            data.result.forEach((item) => {
                                var diff = (item.price - item.avgPrice);
                                if (diff != 0) {
                                    if (diff < 0) {
                                        diff = math.abs(diff);
                                    }
                                    item.alert = math.round(diff, 2) >= 0.07;
                                }
                            });
                        }
                    }
                });
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        if (this.$scope.market != undefined && data.MarketId == this.$scope.market.id) {
                            this.$scope.isBetCountChanged = true;
                            this.playAudio();
                        }
                    }
                });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_position);
                    this.$timeout.cancel(this.$scope.timer_nextmarket);
                    newPageLoader();
                    wsListner();
                    wsListnerMarketOdds();
                    this.unsubscribeOdds();
                });
                this.WSSocketService.setController(this);
                super.init(this);
            }
            initScopeValues() {
                this.$scope.canILoad = false;
                this.$scope.cardImagePath = this.settings.ImagePath + 'images/scards/';
                this.$scope.themeImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
                this.$scope.positions = [];
                this.$scope.openedPosition = [];
                this.$scope.openedBook = [];
                this.$scope.userPTtree = [];
                this.$scope.isBetCountChanged = false;
                this.$scope.isBetTickerView = '1';
                this.$scope.userpositionTemplate = this.settings.ThemeName + '/template/detail-user-position.html';
                this.$scope.userpositionChildTemplate = this.settings.ThemeName + '/template/detail-user-position-child.html';
                this.$scope.sessionpositionTemplate = this.settings.ThemeName + '/template/detail-session-position.html';
                this.$scope.sessionpositionChildTemplate = this.settings.ThemeName + '/template/detail-session-position-child.html';
            }
            loadInitialData() {
                this.getMarketpositionbyMarketId();
                this.buildUserTreeForPT();
            }
            buildUserTreeForPT() {
                if (this.$stateParams.usertype) {
                    this.$scope.userPTtree = super.getUserTypeForPT(this.$stateParams.usertype);
                    this.$scope.userPTtree = this.$scope.userPTtree.reverse();
                }
                else {
                    var loggeduser = this.commonDataService.getLoggedInUserData();
                    if (loggeduser) {
                        this.$scope.userPTtree = super.getUserTypeForPT(loggeduser.userType);
                        this.$scope.userPTtree = this.$scope.userPTtree.reverse();
                    }
                }
            }
            bookTypeChanged() {
                this.commonDataService.setExposurePTOption(this.$scope.market.includePT);
                if (this.$scope.market.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.market.bettingType == intranet.common.enums.BettingType.LINE
                    || this.$scope.market.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                    this.getSessionPosition();
                }
                else {
                    this.getUserPosition();
                }
            }
            getMarketpositionbyMarketId() {
                this.marketOddsService.getGameByEventId(this.$stateParams.eventid)
                    .success((response) => {
                    this.$scope.market = response.data;
                    this.$scope.market.includePT = this.commonDataService.getExposurePTOption();
                    if (this.$scope.market.bettingType == intranet.common.enums.BettingType.FIXED_ODDS) {
                        if (this.$scope.market.gameType == intranet.common.enums.GameType.Patti2) {
                            var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                            this.$scope.market.pattiRunner = metadata.patti2;
                        }
                        else if (this.$scope.market.gameType == intranet.common.enums.GameType.PokerT20) {
                            var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                            this.$scope.market.pattiRunner = metadata.pokert20;
                        }
                        else if (this.$scope.market.gameType == intranet.common.enums.GameType.Patti3) {
                            var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                            this.$scope.market.pattiRunner = metadata.patti3;
                        }
                        else if (this.$scope.market.gameType == intranet.common.enums.GameType.DragonTiger || this.$scope.market.gameType == intranet.common.enums.GameType.Up7Down
                            || this.$scope.market.gameType == intranet.common.enums.GameType.ClashOfKings) {
                            this.$scope.market.marketRunner.forEach((mr) => {
                                if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                    mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                    mr.runnerGroup = mr.metadata.runnerGroup;
                                }
                            });
                        }
                    }
                    else if (this.$scope.market.gameType == intranet.common.enums.GameType.Card32) {
                        this.$scope.market.marketRunner.forEach((mr) => {
                            if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                mr.runnerGroup = mr.metadata.runnerGroup;
                            }
                        });
                    }
                    this.subscribeOdds();
                    if (this.$scope.market.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.market.bettingType == intranet.common.enums.BettingType.LINE) {
                        this.getSessionPosition();
                    }
                    else {
                        this.getUserPosition();
                    }
                    this.$scope.canILoad = true;
                }).finally(() => {
                    this.fetchLiveBetsData();
                });
            }
            unsubscribeOdds() {
                this.WSSocketService.sendMessage({
                    Mids: [], MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            wssReconnected() {
                this.subscribeOdds();
                this.refreshBetsAndPosition();
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.market && this.$scope.market.id) {
                    mids.push(this.$scope.market.id);
                }
                this.WSSocketService.sendMessage({
                    Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            setMarketOdds(responseData) {
                responseData.forEach((r) => {
                    if (this.$scope.market && this.$scope.market.id == r.id) {
                        if (r.gs && r.gs.length > 0) {
                            this.$scope.market.gameString = JSON.parse(r.gs);
                        }
                        this.$scope.market.timer = r.t;
                        this.$scope.market.pl = r.pl;
                        this.$scope.market.totalMatched = r.tm;
                        this.$scope.market.inPlay = r.ip;
                        this.$scope.market.marketStatus = r.ms;
                        this.$scope.market.temporaryStatus = r.ts;
                        this.$scope.market.winner = r.wnr;
                        r.mr.forEach((value, index) => {
                            this.$scope.market.marketRunner[index].status = value.rs;
                            this.$scope.market.marketRunner[index].backPrice = value.bp;
                            this.$scope.market.marketRunner[index].layPrice = value.lp;
                        });
                        if (this.$scope.market.marketStatus == intranet.common.enums.MarketStatus.CLOSED) {
                            this.$scope.lastClosedMarket = this.$scope.market.id;
                            this.$timeout(() => { this.getNextMarket(); }, 5000);
                        }
                    }
                });
            }
            getNextMarket() {
                this.$timeout.cancel(this.$scope.timer_nextmarket);
                var currentMarketId = this.$scope.market.id;
                this.marketOddsService.getGameByEventId(this.$stateParams.eventid)
                    .success((response) => {
                    if (response.success && response.data && response.data.id) {
                        if (response.data.id != currentMarketId && response.data.id != this.$scope.lastClosedMarket) {
                            this.$scope.market = response.data;
                            if (this.$scope.market.bettingType == intranet.common.enums.BettingType.FIXED_ODDS) {
                                if (this.$scope.market.gameType == intranet.common.enums.GameType.Patti2) {
                                    var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.market.pattiRunner = metadata.patti2;
                                }
                                else if (this.$scope.market.gameType == intranet.common.enums.GameType.PokerT20) {
                                    var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.market.pattiRunner = metadata.pokert20;
                                }
                                else if (this.$scope.market.gameType == intranet.common.enums.GameType.Patti3) {
                                    var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.market.pattiRunner = metadata.patti3;
                                }
                                else if (this.$scope.market.gameType == intranet.common.enums.GameType.DragonTiger || this.$scope.market.gameType == intranet.common.enums.GameType.Up7Down
                                    || this.$scope.market.gameType == intranet.common.enums.GameType.ClashOfKings) {
                                    this.$scope.market.marketRunner.forEach((mr) => {
                                        if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                            mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                            mr.runnerGroup = mr.metadata.runnerGroup;
                                        }
                                    });
                                }
                            }
                            else if (this.$scope.market.gameType == intranet.common.enums.GameType.Card32) {
                                this.$scope.market.marketRunner.forEach((mr) => {
                                    if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                        mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                        mr.runnerGroup = mr.metadata.runnerGroup;
                                    }
                                });
                            }
                            this.subscribeOdds();
                            this.fetchLiveBetsData();
                            if (this.$scope.market.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.market.bettingType == intranet.common.enums.BettingType.LINE) {
                                this.getSessionPosition();
                            }
                            else {
                                this.getUserPosition();
                            }
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed && this.$scope.market.id == this.$scope.lastClosedMarket) {
                        this.$scope.timer_nextmarket = this.$timeout(() => {
                            this.getNextMarket();
                        }, 2000);
                    }
                });
            }
            open_Close_Check_Position(user, isclick = false) {
                if (user.downline && user.downline.length > 0) {
                    if (isclick) {
                        user.open = !user.open;
                        if (user.open) {
                            this.$scope.openedPosition.push(user.userId);
                        }
                        else {
                            var index = this.$scope.openedPosition.indexOf(user.userId);
                            if (index > -1) {
                                this.$scope.openedPosition.splice(index, 1);
                            }
                        }
                    }
                    else {
                        if (this.$scope.openedPosition.indexOf(user.userId) > -1) {
                            user.open = true;
                        }
                        else {
                            user.open = false;
                        }
                    }
                }
            }
            getUserPosition() {
                var self = this;
                var isOpen = ((p) => {
                    self.open_Close_Check_Position(p);
                    if (p.downline && p.downline.length > 0) {
                        angular.forEach(p.downline, (d) => {
                            isOpen(d);
                        });
                    }
                });
                var findMember = ((m, id) => {
                    if (m.userId == id) {
                        self.$scope.loginUserPosition = m;
                        self.$scope.positions = m.downline;
                    }
                    else {
                        if (m.downline && m.downline.length > 0) {
                            angular.forEach(m.downline, (d) => {
                                findMember(d, id);
                            });
                        }
                    }
                });
                var model = { MarketId: this.$scope.market.id, IsPt: this.$scope.market.includePT };
                this.positionService.getUserPositionPost(model)
                    .success((response) => {
                    if (response.success && response.data) {
                        this.$scope.loginUserPosition = response.data;
                        this.$scope.positions = response.data.downline;
                        if (this.$scope.positions) {
                            angular.forEach(this.$scope.positions, (p) => {
                                isOpen(p);
                            });
                        }
                        if (this.$stateParams.memberid && response.data.userId != this.$stateParams.memberid) {
                            this.$scope.positions.forEach((p) => {
                                findMember(p, this.$stateParams.memberid);
                            });
                        }
                    }
                    else {
                        this.$scope.loginUserPosition = [];
                        this.$scope.positions = [];
                    }
                }).finally(() => { this.startTimer(); });
            }
            open_Close_Check_Book(user, isclick = false) {
                if (user.downline && user.downline.length > 0) {
                    if (isclick) {
                        user.showSession = !user.showSession;
                        if (user.showSession) {
                            this.$scope.openedBook.push(user.userId);
                        }
                        else {
                            var index = this.$scope.openedBook.indexOf(user.userId);
                            if (index > -1) {
                                this.$scope.openedBook.splice(index, 1);
                            }
                        }
                    }
                    else {
                        if (this.$scope.openedBook.indexOf(user.userId) > -1) {
                            user.showSession = true;
                            this.commonDataService.openScorePosition(user.userId, user.showSession, user.ladders, true);
                        }
                        else {
                            user.showSession = false;
                        }
                    }
                }
            }
            openBook(event, user) {
                if (event) {
                    event.stopPropagation();
                }
                this.open_Close_Check_Book(user, true);
                this.commonDataService.openScorePosition(user.userId, user.showSession, user.ladders, true);
            }
            getSessionPosition(firstTime = false) {
                var self = this;
                var isOpen = ((p) => {
                    self.open_Close_Check_Position(p);
                    self.open_Close_Check_Book(p);
                    if (p.downline && p.downline.length > 0) {
                        angular.forEach(p.downline, (d) => {
                            isOpen(d);
                        });
                    }
                });
                var findMember = ((m, id) => {
                    if (m.userId == id) {
                        self.$scope.loginUserPosition = m;
                        self.$scope.positions = m.downline;
                    }
                    else {
                        if (m.downline && m.downline.length > 0) {
                            angular.forEach(m.downline, (d) => {
                                findMember(d, id);
                            });
                        }
                    }
                });
                var model = { MarketId: this.$scope.market.id, IsPt: this.$scope.market.includePT };
                this.positionService.getFancyUserPosition(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.loginUserPosition = response.data;
                        this.$scope.positions = response.data.downline;
                        if (this.$scope.positions) {
                            angular.forEach(this.$scope.positions, (p) => {
                                isOpen(p);
                            });
                        }
                        if (this.$stateParams.memberid && response.data.userId != this.$stateParams.memberid) {
                            this.$scope.positions.forEach((p) => {
                                findMember(p, this.$stateParams.memberid);
                            });
                        }
                        self.open_Close_Check_Book(this.$scope.loginUserPosition);
                    }
                }).finally(() => { this.startTimer(); });
            }
            getExposure() {
                this.exposureService.getExposure()
                    .success((response) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
            }
            getMatchedBets(params) {
                var searchQuery = {
                    marketId: this.$scope.market.id
                };
                if (params && params.orderBy == '') {
                    params.orderBy = 'createdon';
                    params.orderByDesc = true;
                }
                return this.betService.getLiveBetsByMarketId({ searchQuery: searchQuery, params: params });
            }
            playAudio() {
                var audio = new Audio('audio/short_1.mp3');
                audio.play();
            }
            fetchLiveBetsData() {
                var refreshCMD = "refreshGrid";
                refreshCMD = refreshCMD + "_kt-exposure-livebets-grid";
                this.$scope.$broadcast(refreshCMD);
            }
            refreshBetsAndPosition() {
                this.getExposure();
                this.fetchLiveBetsData();
                this.$rootScope.$emit('master-balance-changed');
                if (this.$scope.market.bettingType != intranet.common.enums.BettingType.SESSION && this.$scope.market.bettingType != intranet.common.enums.BettingType.LINE) {
                    this.getUserPosition();
                }
                else {
                    this.getSessionPosition();
                }
            }
            startTimer(start = true) {
                if (!start) {
                    this.$timeout.cancel(this.$scope.timer_position);
                }
                else {
                    this.$timeout.cancel(this.$scope.timer_position);
                    this.$scope.selectedInterval = this.$scope.selectedInterval ? this.$scope.selectedInterval : 10;
                    var startdelay = (() => {
                        if (this.$scope.selectedInterval > 0) {
                            this.$scope.selectedInterval = this.$scope.selectedInterval - 1;
                            this.$scope.timer_position = this.$timeout(() => {
                                startdelay();
                            }, 1000);
                        }
                        else {
                            if (this.$scope.isBetCountChanged) {
                                this.$scope.isBetCountChanged = false;
                                this.refreshBetsAndPosition();
                            }
                            else {
                                this.startTimer();
                            }
                        }
                    });
                    this.$scope.timer_position = this.$timeout(() => { startdelay(); }, 1000);
                }
            }
        }
        master.LiveGameExposureDetailCtrl = LiveGameExposureDetailCtrl;
        angular.module('intranet.master').controller('liveGameExposureDetailCtrl', LiveGameExposureDetailCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LiveGameExposureDetail.js.map