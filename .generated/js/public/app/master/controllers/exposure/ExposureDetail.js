var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class ExposureDetailCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, $stateParams, settings, $timeout, commentaryService, commonDataService, marketService, betService, WSSocketService, $rootScope, positionService) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.$stateParams = $stateParams;
                this.settings = settings;
                this.$timeout = $timeout;
                this.commentaryService = commentaryService;
                this.commonDataService = commonDataService;
                this.marketService = marketService;
                this.betService = betService;
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
                        if (data.MarketId == this.$scope.currentMarketId) {
                            this.$scope.isBetCountChanged = true;
                            this.playAudio();
                        }
                    }
                });
                var wsListnerScore = this.$rootScope.$on("ws-score-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        if (this.$scope.market && data.eventId == this.$scope.market.eventId) {
                            this.$scope.market.event.scoreSource = data.scoreSource;
                            if (data.scoreSource == intranet.common.enums.ScoreSource.Betfair) {
                                this.getCricketScore();
                            }
                            else {
                                if (data.commentary) {
                                    this.$scope.market.commentary = JSON.parse(data.commentary);
                                }
                            }
                        }
                    }
                });
                var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                    if (response.success) {
                        this.setMarketOdds(response.data);
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_market_score);
                    this.$timeout.cancel(this.$scope.timer_position);
                    newPageLoader();
                    wsListner();
                    wsListnerScore();
                    wsListnerMarketOdds();
                    this.unsubscribeOdds();
                });
                this.WSSocketService.setController(this);
                super.init(this);
            }
            initScopeValues() {
                this.$scope.currentMarketId = this.$stateParams.marketid;
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
            getMarketsListByEvent(eventid) {
                this.marketService.getMarketByEventId(eventid)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.drpMarkets = response.data;
                    }
                });
            }
            marketSelectionChanged() {
                if (this.$scope.positions && this.$scope.positions.length > 0)
                    this.$scope.positions.splice(0);
                this.getMarketpositionbyMarketId();
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
                this.positionService.getMarketpositionbyMarketId(this.$scope.currentMarketId)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.market = response.data;
                        this.subscribeOdds();
                        this.$scope.market.includePT = this.commonDataService.getExposurePTOption();
                        if (this.$scope.currentMarketId == this.$stateParams.marketid) {
                            this.getMarketsListByEvent(this.$scope.market.eventId);
                        }
                        if (this.$scope.market.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.market.bettingType == intranet.common.enums.BettingType.LINE
                            || this.$scope.market.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                            this.getSessionPosition();
                        }
                        else {
                            this.getUserPosition();
                        }
                    }
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
                        super.setOddsInMarket(this.$scope.market, r);
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
                var model = { MarketId: this.$scope.currentMarketId, IsPt: this.$scope.market.includePT };
                this.positionService.getUserPositionPost(model)
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
                var model = { MarketId: this.$scope.currentMarketId, IsPt: this.$scope.market.includePT };
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
            readScoreFromBF() {
                var bfEventType = this.commonDataService.getBFEventTypeId(this.$scope.market.eventType.id);
                if (bfEventType == this.settings.SoccerBfId) {
                    this.getSoccerScore();
                }
                else if (bfEventType == this.settings.TennisBfId) {
                    this.getTennisScore();
                }
                else if (bfEventType == this.settings.CricketBfId) {
                    this.$timeout(() => { this.checkScoreSource(); }, 3000);
                }
            }
            getSoccerScore() {
                if (this.$scope.timer_market_score) {
                    this.$timeout.cancel(this.$scope.timer_market_score);
                }
                this.commentaryService.getBFSoccerScore(this.$scope.market.event.sourceId)
                    .success((response) => {
                    if (response) {
                        var score = response;
                        if (!!score.updateDetails) {
                            this.$scope.market.score = score;
                            this.$scope.market.isSoccer = true;
                            this.$scope.market.score.firstHalf = {};
                            this.$scope.market.score.secondHalf = {};
                            this.$scope.market.score.firstHalf.detail = [];
                            this.$scope.market.score.secondHalf.detail = [];
                            this.$scope.market.score.firstHalf.divideBy = (100 / 45);
                            this.$scope.market.score.secondHalf.divideBy = (100 / 45);
                            var isFirst = true;
                            var isSecond = false;
                            this.$scope.market.score.updateDetails.forEach((u) => {
                                if (isFirst) {
                                    this.$scope.market.score.firstHalf.timeElapsed = this.$scope.market.score.timeElapsed;
                                    this.$scope.market.score.firstHalf.detail.push(u);
                                    if (u.type == 'SecondHalfKickOff') {
                                        this.$scope.market.score.firstHalf.timeElapsed = u.matchTime;
                                        this.$scope.market.score.firstHalf.divideBy = (100 / u.matchTime);
                                        isFirst = false;
                                        isSecond = true;
                                    }
                                }
                                else if (isSecond) {
                                    u.left = u.matchTime - 45;
                                    this.$scope.market.score.secondHalf.timeElapsed = this.$scope.market.score.timeElapsed - 45;
                                    this.$scope.market.score.secondHalf.detail.push(u);
                                    if (u.elapsedAddedTime) {
                                        this.$scope.market.score.secondHalf.timeElapsed = u.left;
                                        this.$scope.market.score.secondHalf.divideBy = (100 / (this.$scope.market.score.secondHalf.timeElapsed));
                                    }
                                }
                            });
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed && this.$scope.market.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                        var seconds = (this.$scope.market.inPlay ? 5 : 60);
                        this.$scope.timer_market_score = this.$timeout(() => {
                            this.getSoccerScore();
                        }, 1000 * seconds);
                    }
                });
            }
            getTennisScore() {
                if (this.$scope.timer_market_score) {
                    this.$timeout.cancel(this.$scope.timer_market_score);
                }
                this.commentaryService.getBFTennisScore(this.$scope.market.event.sourceId)
                    .success((response) => {
                    if (response || response.length > 0) {
                        var score = response[0];
                        if (score) {
                            this.$scope.market.score = score;
                            this.$scope.market.isTennis = true;
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed && this.$scope.market.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                        var seconds = (this.$scope.market.inPlay ? 5 : 60);
                        this.$scope.timer_market_score = this.$timeout(() => {
                            this.getTennisScore();
                        }, 1000 * seconds);
                    }
                });
            }
            checkScoreSource() {
                this.commentaryService.getCommentary(this.$scope.market.eventId)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.market.event.scoreSource = response.data.scoreSource;
                        if (response.data.scoreSource == intranet.common.enums.ScoreSource.Betfair) {
                            this.getCricketScore();
                        }
                        else {
                            if (response.data.commentary) {
                                this.$scope.market.commentary = JSON.parse(response.data.commentary);
                            }
                            ;
                        }
                    }
                });
            }
            getCricketScore() {
                if (this.$scope.market.event.scoreSource == intranet.common.enums.ScoreSource.Betfair) {
                    this.commentaryService.getBFTennisScore(this.$scope.market.event.sourceId)
                        .success((response) => {
                        if (response || response.length > 0) {
                            var cricket = response[0];
                            var commentary = {};
                            if (cricket) {
                                if (cricket.score.home.name != 'HOME') {
                                    commentary.homeTeam = cricket.score.home.name;
                                }
                                else {
                                    if (this.$scope.market.commentary) {
                                        commentary.homeTeam = this.$scope.market.commentary.homeTeam;
                                    }
                                }
                                if (cricket.score.away.name != 'AWAY') {
                                    commentary.awayTeam = cricket.score.away.name;
                                }
                                else {
                                    if (this.$scope.market.commentary) {
                                        commentary.awayTeam = this.$scope.market.commentary.awayTeam;
                                    }
                                }
                                if (cricket.score.home.inning1) {
                                    commentary.inning1HomeScore = cricket.score.home.inning1.runs;
                                    commentary.inning1HomeScore += (isNaN(cricket.score.home.inning1.wickets * 1) ? '' : '/' + cricket.score.home.inning1.wickets);
                                    commentary.inning1HomeScore += ' (' + cricket.score.home.inning1.overs + ')';
                                }
                                if (cricket.score.away.inning1) {
                                    commentary.inning1AwayScore = cricket.score.away.inning1.runs;
                                    commentary.inning1AwayScore += (isNaN(cricket.score.away.inning1.wickets * 1) ? '' : '/' + cricket.score.away.inning1.wickets);
                                    commentary.inning1AwayScore += ' (' + cricket.score.away.inning1.overs + ')';
                                }
                                if (cricket.score.home.inning2) {
                                    commentary.inning2InPlay = true;
                                    commentary.inning2HomeScore = cricket.score.home.inning2.runs;
                                    commentary.inning2HomeScore += (isNaN(cricket.score.home.inning2.wickets * 1) ? '' : '/' + cricket.score.home.inning2.wickets);
                                    commentary.inning2HomeScore += ' (' + cricket.score.home.inning2.overs + ')';
                                }
                                if (cricket.score.away.inning2) {
                                    commentary.inning2InPlay = true;
                                    commentary.inning2AwayScore = cricket.score.away.inning2.runs;
                                    commentary.inning2AwayScore += (isNaN(cricket.score.away.inning2.wickets * 1) ? '' : '/' + cricket.score.away.inning2.wickets);
                                    commentary.inning2AwayScore += ' (' + cricket.score.away.inning2.overs + ')';
                                }
                                if (cricket.stateOfBall) {
                                    commentary.stateOfBall = { batsmanName: cricket.stateOfBall.batsmanName, bowlerName: cricket.stateOfBall.bowlerName };
                                }
                                if (cricket.matchType == 'TEST') {
                                    commentary.currentDay = cricket.currentDay;
                                }
                                this.$scope.market.commentary = commentary;
                            }
                        }
                    }).finally(() => {
                        if (!this.$scope.$$destroyed && this.$scope.market.marketStatus != intranet.common.enums.MarketStatus.CLOSED) {
                            var seconds = (this.$scope.market.inPlay ? 5 : 60);
                            this.$scope.timer_market_score = this.$timeout(() => {
                                this.getCricketScore();
                            }, 1000 * seconds);
                        }
                    });
                }
            }
            getMatchedBets(params) {
                var searchQuery = {
                    marketId: this.$scope.currentMarketId
                };
                if (this.$stateParams.memberid) {
                    searchQuery.userId = this.$stateParams.memberid;
                }
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
                this.fetchLiveBetsData();
                this.$rootScope.$emit('master-balance-changed');
                if (this.$scope.market.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.market.bettingType == intranet.common.enums.BettingType.LINE
                    || this.$scope.market.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                    this.getSessionPosition();
                }
                else {
                    this.getUserPosition();
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
        master.ExposureDetailCtrl = ExposureDetailCtrl;
        angular.module('intranet.master').controller('exposureDetailCtrl', ExposureDetailCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ExposureDetail.js.map