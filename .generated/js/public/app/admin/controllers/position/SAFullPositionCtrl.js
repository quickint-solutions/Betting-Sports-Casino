var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAFullPositionCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, $stateParams, settings, commentaryService, commonDataService, betService, userService, marketOddsService, $timeout, WSSocketService, toasterService, marketService, $rootScope, positionService) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.$stateParams = $stateParams;
                this.settings = settings;
                this.commentaryService = commentaryService;
                this.commonDataService = commonDataService;
                this.betService = betService;
                this.userService = userService;
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.WSSocketService = WSSocketService;
                this.toasterService = toasterService;
                this.marketService = marketService;
                this.$rootScope = $rootScope;
                this.positionService = positionService;
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        if (data.MarketId == this.$stateParams.marketid) {
                            this.$scope.isBetCountChanged = true;
                        }
                    }
                });
                var wsListnerScore = this.$rootScope.$on("ws-score-changed", (event, response) => {
                    if (response.success) {
                        if (response.data.scoreSource) {
                            var data = response.data;
                            this.$scope.market.event.scoreSource = data.scoreSource;
                            if (data.commentary) {
                                this.$scope.market.commentary = JSON.parse(data.commentary);
                            }
                            if (data.audioConfig) {
                                this.$scope.market.audioConfig = JSON.parse(data.audioConfig);
                            }
                        }
                        else {
                            angular.forEach(response.data, (data) => {
                                if (this.$scope.market && data.eventId == this.$scope.market.event.sourceId) {
                                    if (data.eventTypeId == this.settings.SoccerBfId) {
                                        this.getSoccerScore(data);
                                    }
                                    else if (data.eventTypeId == this.settings.TennisBfId) {
                                        this.getTennisScore(data);
                                    }
                                    else if (data.eventTypeId == this.settings.CricketBfId) {
                                        this.getCricketScore(data);
                                    }
                                }
                            });
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
                    wsListner();
                    wsListnerScore();
                    wsListnerMarketOdds();
                    this.unsubscribeOdds();
                });
                this.WSSocketService.setController(this);
                super.init(this);
            }
            initScopeValues() {
                this.$scope.autoOpenSec = 3;
                this.$scope.isAutoOpen = false;
                this.$scope.startBMTimer = false;
                this.$scope.betStatus = [];
                this.$scope.betSides = [];
                this.$scope.webAdminList = [];
                this.$scope.adminList = [];
                this.$scope.masterList = [];
                this.$scope.userList = [];
                this.$scope.openedPosition = [];
                this.$scope.openedBook = [];
                this.$scope.isBetCountChanged = false;
                this.$scope.anyUserList = [];
                this.$scope.search = {
                    status: '2',
                    betside: '-1'
                };
                this.$scope.userpositionTemplate = this.settings.ThemeName + '/template/sa-detail-user-position.html';
                this.$scope.userpositionChildTemplate = this.settings.ThemeName + '/template/sa-detail-user-position-child.html';
                this.$scope.sessionpositionTemplate = this.settings.ThemeName + '/template/sa-detail-session-position.html';
                this.$scope.sessionpositionChildTemplate = this.settings.ThemeName + '/template/sa-detail-session-position-child.html';
            }
            loadInitialData() {
                this.getLoggedInUser();
                this.getMarketpositionbyMarketId(this.$stateParams.marketid);
                this.fillBetSide();
                this.fillBetStatus();
            }
            getMarketpositionbyMarketId(marketid) {
                this.positionService.getMarketpositionbyMarketId(marketid)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.market = response.data;
                        this.$scope.p = { market: response.data };
                        if (this.$scope.market.bettingType == intranet.common.enums.BettingType.SESSION || this.$scope.market.bettingType == intranet.common.enums.BettingType.LINE || this.$scope.market.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                            this.getSessionPosition();
                        }
                        else {
                            this.getUserPosition();
                        }
                        this.readScoreFromBF();
                    }
                }).finally(() => { this.subscribeOdds(); });
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
                        super.setOddsInMarket(this.$scope.market, r, false);
                        if (r.ts == intranet.common.enums.TemporaryStatus.BALL && this.$scope.isAutoOpen && !this.$scope.startBMTimer) {
                            this.$scope.startBMTimer = true;
                            this.changeMarketStatus();
                        }
                    }
                });
            }
            unsubscribeOdds() {
                this.WSSocketService.sendMessage({
                    Mids: [], MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            wssReconnected() {
                this.subscribeOdds();
            }
            open_Close_Check_Position(user, p = null, isclick = false) {
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
                    if (response.success) {
                        this.$scope.loginUserPosition = response.data;
                        this.$scope.positions = response.data.downline;
                        if (this.$scope.positions) {
                            angular.forEach(this.$scope.positions, (p) => {
                                isOpen(p);
                            });
                        }
                    }
                }).finally(() => {
                    this.startTimer();
                    if (this.$scope.loginUserPosition && this.$scope.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(this.$scope.loginUserPosition.marketRunners, (m) => {
                            if (m.pl < pl) {
                                pl = m.pl;
                            }
                        });
                        this.$scope.market.pl = pl;
                    }
                });
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
                            this.commonDataService.openScorePosition(this.$scope.market.id + '_' + user.userId, user.showSession, user.ladders, true);
                        }
                        else {
                            user.showSession = false;
                        }
                    }
                }
            }
            openBook(event, user, p = null) {
                if (event) {
                    event.stopPropagation();
                }
                this.open_Close_Check_Book(user, true);
                this.commonDataService.openScorePosition(this.$scope.market.id + '_' + user.userId, user.showSession, user.ladders, true);
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
                        self.open_Close_Check_Book(this.$scope.loginUserPosition);
                    }
                }).finally(() => {
                    this.startTimer();
                    if (this.$scope.loginUserPosition && this.$scope.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(this.$scope.loginUserPosition.marketRunners, (m) => {
                            if (m.pl < pl) {
                                pl = m.pl;
                            }
                        });
                        this.$scope.market.pl = pl;
                    }
                });
            }
            readScoreFromBF() {
                this.commonDataService.getEventTypes().then(() => {
                    var bfEventType = this.commonDataService.getBFEventTypeId(this.$scope.market.eventType.id);
                    if (bfEventType == this.settings.SoccerBfId
                        || bfEventType == this.settings.TennisBfId
                        || bfEventType == this.settings.CricketBfId) {
                        this.$timeout(() => { this.checkScoreSource(); }, 1000);
                    }
                });
            }
            checkScoreSource() {
                this.commentaryService.getCommentary(this.$scope.market.eventId)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.market.event.scoreSource = response.data.scoreSource;
                        if (response.data.scoreSource == intranet.common.enums.ScoreSource.Betfair) {
                            this.WSSocketService.sendMessage({
                                Scid: [this.$scope.market.event.sourceId], MessageType: intranet.common.enums.WSMessageType.Score
                            });
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
            getSoccerScore(response) {
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
            }
            getTennisScore(score) {
                if (score) {
                    this.$scope.market.score = score;
                    this.$scope.market.isTennis = true;
                }
            }
            getCricketScore(cricket) {
                var commentary = {};
                if (cricket) {
                    if (cricket.score.home.name != 'HOME') {
                        commentary.homeTeam = cricket.score.home.name;
                    }
                    else {
                        commentary.homeTeam = this.$scope.market.marketRunner[0].runner.name;
                    }
                    if (cricket.score.away.name != 'AWAY') {
                        commentary.awayTeam = cricket.score.away.name;
                    }
                    else {
                        commentary.awayTeam = this.$scope.market.marketRunner[1].runner.name;
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
            openBFChart(market, r) {
                var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
                this.commonDataService.openBFChart(ids);
            }
            fillBetSide() {
                this.$scope.betSides.push({ id: -1, name: 'All' });
                this.$scope.betSides.push({ id: 1, name: 'Back' });
                this.$scope.betSides.push({ id: 2, name: 'Lay' });
            }
            fillBetStatus() {
                this.$scope.betStatus.push({ id: -1, name: 'All' });
                this.$scope.betStatus.push({ id: 2, name: 'Matched' });
                this.$scope.betStatus.push({ id: 3, name: 'Unmatched' });
            }
            getLoggedInUser() {
                this.$scope.currentUser = this.commonDataService.getLoggedInUserData();
            }
            searchUser(search) {
                if (search && search.length >= 3) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.userService.findMembers(search);
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.anyUserList = response.data;
                            if (this.$scope.anyUserList && this.$scope.anyUserList.length > 0) {
                                this.$scope.anyUserList.forEach((u) => {
                                    u.extra = super.getUserTypesObj(u.userType);
                                });
                            }
                        });
                    }
                }
                else {
                    this.$scope.anyUserList.splice(0);
                }
            }
            getMatchedBets(params) {
                var searchQuery = {
                    status: 'matched',
                    side: this.$scope.search.betside,
                    marketId: this.$stateParams.marketid
                };
                if (params && params.orderBy == '') {
                    params.orderBy = 'createdon';
                    params.orderByDesc = true;
                }
                var userId = '';
                if (this.$scope.search.selectedUser) {
                    userId = this.$scope.search.selectedUser.id;
                }
                return this.betService.getLiveBetsByMarketId({ searchQuery: searchQuery, params: params, id: userId });
            }
            getUnmatchedBets(params) {
                var searchQuery = {
                    status: 'unmatched',
                    side: this.$scope.search.betside,
                    marketId: this.$stateParams.marketid
                };
                if (params && params.orderBy == '') {
                    params.orderBy = 'createdon';
                    params.orderByDesc = true;
                }
                var userId = '';
                if (this.$scope.search.selectedUser) {
                    userId = this.$scope.search.selectedUser.id;
                }
                return this.betService.getLiveBetsByMarketId({ searchQuery: searchQuery, params: params, id: userId });
            }
            fetchLiveBetsData() {
                if (this.$scope.search.status == 2 || this.$scope.search.status == -1) {
                    var refreshCMD = "refreshGrid";
                    refreshCMD = refreshCMD + "_kt-matchedlivebets-grid";
                    this.$scope.$broadcast(refreshCMD);
                }
                if (this.$scope.search.status == 3 || this.$scope.search.status == -1) {
                    var refreshCMD = "refreshGrid";
                    refreshCMD = refreshCMD + "_kt-unmatchedlivebets-grid";
                    this.$scope.$broadcast(refreshCMD);
                }
            }
            playAudio() {
                var audio = new Audio('audio/short_1.mp3');
                audio.play();
            }
            resetCriteria() {
                this.$scope.search.status = '2';
                this.$scope.search.betside = '-1';
                this.$scope.search.selectedUser = undefined;
                this.fetchLiveBetsData();
            }
            refreshBetsAndPosition() {
                this.fetchLiveBetsData();
                this.$rootScope.$emit('admin-balance-changed');
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
                    this.$timeout(() => { startdelay(); }, 1000);
                }
            }
            shortcut(event) {
                if ((event.originalEvent.ctrlKey == true && event.originalEvent.code === 'KeyB' || (event.originalEvent.code === 'F7'))
                    && !this.$scope.$$destroyed) {
                    this.refreshBetsAndPosition();
                }
            }
            autoBookMakerChanged() {
                if (!this.$scope.isAutoOpen) {
                    this.$scope.startBMTimer = false;
                }
            }
            changeMarketStatus() {
                if (this.$scope.isAutoOpen && this.$scope.startBMTimer) {
                    this.$timeout(() => {
                        this.marketService.changeTemporaryStatus(this.$scope.market.id, intranet.common.enums.TemporaryStatus.OPEN)
                            .success((response) => {
                            if (response.success) {
                                this.toasterService.showToast(intranet.common.helpers.ToastType.Success, 'market.tempstatus.changed.success');
                            }
                            else {
                                this.toasterService.showMessages(response.messages);
                            }
                        }).finally(() => { this.$scope.startBMTimer = false; });
                    }, this.$scope.autoOpenSec * 1000);
                }
            }
        }
        admin.SAFullPositionCtrl = SAFullPositionCtrl;
        angular.module('intranet.admin').controller('sAFullPositionCtrl', SAFullPositionCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAFullPositionCtrl.js.map