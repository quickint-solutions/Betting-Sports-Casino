
module intranet.master {

    export interface IFullPositionScope extends intranet.common.IScopeBase {
        market: any;
        otherMarkets: any[];
        bettingTypeList: any[];
        includePT: boolean;

        marketList: any[];

        promiseItem: any;
        anyUserList: any[];


        selectedInterval: any;
        bettingLocked: boolean;
        isBetCountChanged: any;
        newBetMarketIds: any[];

        timer_market_score: any;
        timer_position: any;
        timer_market_status: any;

        // bets
        betStatus: any[];
        betSides: any[];
        search: any;
        currentUser: any;

    }

    export class FullPositionCtrl extends intranet.common.ControllerBase<IFullPositionScope>
        implements common.init.IInit {
        constructor($scope: IFullPositionScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private $stateParams: any,
            private settings: common.IBaseSettings,
            private commentaryService: services.CommentaryService,
            private commonDataService: common.services.CommonDataService,
            private betService: services.BetService,
            private userService: services.UserService,
            private marketOddsService: services.MarketOddsService,
            private $timeout: ng.ITimeoutService,
            private WSSocketService: any,
            private $state: any,
            private $window: any,
            private $sce: any,
            private toasterService: common.services.ToasterService,
            private eventService: services.EventService,
            private marketService: services.MarketService,
            private $base64: any,
            protected $rootScope: any,
            private positionService: services.PositionService) {
            super($scope);

            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    console.log(response);
                    var data = JSON.parse(response.data);
                    if (data.EventId == this.$stateParams.eventid) {
                        this.$scope.newBetMarketIds.push(data.MarketId);
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
                        angular.forEach(response.data, (data: any) => {
                            if (this.$scope.market && data.eventId == this.$scope.market.event.sourceId) {
                                if (data.eventTypeId == this.settings.SoccerBfId) { this.getSoccerScore(data); }
                                else if (data.eventTypeId == this.settings.TennisBfId) { this.getTennisScore(data); }
                                else if (data.eventTypeId == this.settings.CricketBfId) { this.getCricketScore(data); }
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

            var wsListnerMarketCount = this.$rootScope.$on("ws-marketcount-changed", (event, response) => {
                if (response.success) {
                    var data = JSON.parse(response.data);
                    this.checkNewMarket(data.eventId);
                }
            });

            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timer_market_score);
                this.$timeout.cancel(this.$scope.timer_position);
                this.$timeout.cancel(this.$scope.timer_market_status);
                wsListner();
                wsListnerScore();
                wsListnerMarketOdds();
                wsListnerMarketCount();
                this.unsubscribeOdds();
            });
            this.WSSocketService.setController(this);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.betStatus = [];
            this.$scope.betSides = [];
            this.$scope.isBetCountChanged = false;
            this.$scope.anyUserList = [];
            this.$scope.search = {
                status: '2',
                betside: '-1'
            };
            this.$scope.newBetMarketIds = [];
            this.$scope.marketList = [];
            this.$scope.bettingTypeList = [];
            this.$scope.includePT = false;
        }

        public loadInitialData(): void {

            this.$scope.bettingTypeList.push({ id: common.enums.BettingType.SESSION, name: 'Fancy' });
            this.$scope.bettingTypeList.push({ id: common.enums.BettingType.LINE, name: 'Line' });
            this.$scope.bettingTypeList.push({ id: common.enums.BettingType.FIXED_ODDS, name: 'Winning' });
            this.$scope.bettingTypeList.push({ id: common.enums.BettingType.SCORE_RANGE, name: 'Khado' });

            this.getLoggedInUser();
            this.getMarketpositionbyMarketId(this.$stateParams.marketid);
            this.getMarketpositionbyEventId()
            this.fillBetSide();
            this.fillBetStatus();
            this.getMarketStatusByEventId();

            this.$timeout(() => { this.checkOtherMarketStatus(); }, 20000);
        }

        private getMarketpositionbyMarketId(marketid: any): void {
            this.positionService.getMarketpositionbyMarketId(marketid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.market = response.data;
                        this.$scope.marketList.push({ id: this.$scope.market.id, name: this.$scope.market.name });

                        if (this.$scope.market.bettingType == common.enums.BettingType.SESSION || this.$scope.market.bettingType == common.enums.BettingType.LINE
                            || this.$scope.market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                            this.getSessionPosition(this.$scope.market);
                        }
                        else {
                            this.getUserPosition(this.$scope.market);
                        }
                        this.readScoreFromBF();
                    }
                }).finally(() => { this.subscribeOdds(); this.startTimer(); });
        }

        private getMarketStatusByEventId() {
            this.eventService.GetMarketPtStatusByEventId(this.$stateParams.eventid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data) { this.$scope.bettingLocked = response.data.isLock; }
                    }
                });
        }

        private getTabName(group: any): any {
            return this.$scope.bettingTypeList[group].name;

        }

        private getMarketpositionbyEventId(): void {
            this.$scope.otherMarkets = [];
            this.marketOddsService.getOtherMarketsById(this.$stateParams.eventid, this.$stateParams.marketid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        var others = response.data;
                        var userIds: any[] = [];
                        var sessionIds: any[] = [];
                        others.forEach((om: any) => {
                            angular.forEach(om.markets, (m: any) => {
                                this.$scope.marketList.push({ id: m.id, name: m.name });
                                if (m.bettingType == common.enums.BettingType.SESSION || m.bettingType == common.enums.BettingType.LINE
                                    || m.bettingType == common.enums.BettingType.SCORE_RANGE) {
                                    sessionIds.push(m.id);
                                }
                                else {
                                    userIds.push(m.id)
                                }
                                this.$scope.otherMarkets.push(m);
                            });
                        });
                        if (userIds.length > 0) { this.getUserPositionByIds(userIds); }
                        if (sessionIds.length > 0) { this.getSessionPositionByIds(sessionIds); }
                    }
                }).finally(() => { this.subscribeOdds(); });
        }

        private bettingLockStatusChanged() {
            var model: any = {};
            model.nodeId = this.$scope.market.eventId;
            model.isLock = this.$scope.bettingLocked;
            model.nodeType = 4;

            this.eventService.UpdateMarketPtStatus(model)
                .success((response: common.messaging.IResponse<any>) => {
                    this.toasterService.showMessages(response.messages);
                });
        }

        // socket subscribtion

        private subscribeOdds(): void {
            var mids: any[] = [];

            if (this.$scope.market && this.$scope.market.id) {
                mids.push(this.$scope.market.id);
            }
            if (this.$scope.otherMarkets && this.$scope.otherMarkets.length > 0) {
                this.$scope.otherMarkets.forEach((f: any) => {
                    if (f.marketStatus != common.enums.MarketStatus.CLOSED && f.temporaryStatus != common.enums.TemporaryStatus.SUSPEND) {
                        mids.push(f.id);
                    }
                });
            }
            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });

        }

        private setMarketOdds(responseData: any[]): void {
            responseData.forEach((r: any) => {
                if (this.$scope.market && this.$scope.market.id == r.id) {
                    super.setOddsInMarket(this.$scope.market, r, false);
                }
                angular.forEach((this.$scope.otherMarkets), (m: any) => {
                    if (m.id == r.id) {
                        this.setOddsInMarket(m, r, false);
                    }
                });
            });
        }

        public unsubscribeOdds(): void {
            this.WSSocketService.sendMessage({
                Mids: [], MessageType: common.enums.WSMessageType.SubscribeMarket
            });
            //if (this.settings.IsBetfairLabel) {
            //    this.WSSocketService.sendToBf({
            //        Mids: [], MessageType: common.enums.WSMessageType.SubscribeMarket
            //    });
            //}
        }

        private wssReconnected(): void {
            this.subscribeOdds();
        }

        // positions

        private getUserPosition(market: any) {
            var model = { MarketId: market.id, isPT: this.$scope.includePT };
            this.positionService.getUserPositionPost(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        market.loginUserPosition = response.data;
                    }
                }).finally(() => {
                    if (market.loginUserPosition && market.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(market.marketRunner, (mr: any) => {
                            angular.forEach(market.loginUserPosition.marketRunners, (m: any) => {
                                if (mr.runner.id == m.runner.id) {
                                    mr.pl = m.pl;
                                    if (m.pl < pl) { pl = m.pl; }
                                }
                            });
                        });
                        market.pl = pl;
                    }
                });
        }

        private getUserPositionByIds(ids: any) {
            var model = { marketIds: ids, isPT: this.$scope.includePT };
            var resp: any[] = [];
            this.positionService.getExposurebyMarketIds(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        resp = response.data;
                    }
                }).finally(() => {
                    if (resp && resp.length > 0) {
                        angular.forEach(this.$scope.otherMarkets, (market: any) => {
                            var pl = 0;
                            angular.forEach(market.marketRunner, (mr: any) => {
                                var r = resp.filter((res: any) => { return res.marketId == market.id && res.runnerId == mr.runner.id; }) || [];
                                if (r && r.length > 0) {
                                    mr.pl = r[0].pl;
                                    if (mr.pl < pl) { pl = r[0].pl; }
                                }
                            });
                            market.pl = pl;
                        });

                    }
                });
        }

        private getSessionPosition(market: any) {
            var model = { MarketId: market.id, isPT: this.$scope.includePT };
            this.positionService.getFancyUserPosition(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        market.pl = response.data.pl;
                    }
                })
        }

        private getSessionPositionByIds(ids: any) {
            var model = { MarketIds: ids, isPT: this.$scope.includePT };
            var resp: any[] = [];
            this.positionService.getFancyExposurebyMarketIds(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        resp = response.data;
                    }
                }).finally(() => {
                    if (resp && resp.length > 0) {
                        angular.forEach(this.$scope.otherMarkets, (market: any) => {
                            var r = resp.filter((res: any) => { return res.marketId == market.id; }) || [];
                            if (r && r.length > 0) {
                                market.pl = r[0].pl;
                            }
                        });

                    }
                });
        }

        private includePTChanged() {
            if (this.$scope.market.bettingType == common.enums.BettingType.SESSION || this.$scope.market.bettingType == common.enums.BettingType.LINE
                || this.$scope.market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                this.getSessionPosition(this.$scope.market);
            }
            else {
                this.getUserPosition(this.$scope.market);
            }

            var userIds: any[] = [];
            var sessionIds: any[] = [];
            this.$scope.otherMarkets.forEach((m: any) => {
                if (m.bettingType == common.enums.BettingType.SESSION || m.bettingType == common.enums.BettingType.LINE
                    || m.bettingType == common.enums.BettingType.SCORE_RANGE) {
                    sessionIds.push(m.id);
                }
                else {
                    userIds.push(m.id)
                }
            });
            if (userIds.length > 0) { this.getUserPositionByIds(userIds); }
            if (sessionIds.length > 0) { this.getSessionPositionByIds(sessionIds); }
        }

        // get score from betfair
        private readScoreFromBF(): void {
            // if (this.$scope.market.inPlay) {
            this.commonDataService.getEventTypes().then(() => {
                var bfEventType = this.commonDataService.getBFEventTypeId(this.$scope.market.eventType.id);
                if (bfEventType == this.settings.SoccerBfId
                    || bfEventType == this.settings.TennisBfId
                    || bfEventType == this.settings.CricketBfId) {
                    this.$timeout(() => { this.checkScoreSource(); }, 1000);
                }
            });
            //  }
        }

        private checkScoreSource(): void {
            this.commentaryService.getCommentary(this.$scope.market.eventId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.market.event.scoreSource = response.data.scoreSource;
                        if (response.data.scoreSource == common.enums.ScoreSource.Betfair) {
                            this.WSSocketService.sendMessage({
                                Scid: [this.$scope.market.event.sourceId], MessageType: common.enums.WSMessageType.Score
                            });
                        } else {
                            if (response.data.commentary) { this.$scope.market.commentary = JSON.parse(response.data.commentary) };
                        }
                    }
                });
        }

        private getSoccerScore(response: any): void {
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

                    var isFirst = true; var isSecond = false;
                    this.$scope.market.score.updateDetails.forEach((u: any) => {
                        if (isFirst) {
                            this.$scope.market.score.firstHalf.timeElapsed = this.$scope.market.score.timeElapsed;
                            this.$scope.market.score.firstHalf.detail.push(u);
                            if (u.type == 'SecondHalfKickOff') {
                                this.$scope.market.score.firstHalf.timeElapsed = u.matchTime;
                                this.$scope.market.score.firstHalf.divideBy = (100 / u.matchTime);
                                isFirst = false;
                                isSecond = true
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

        private getTennisScore(score: any): void {
            if (score) {
                this.$scope.market.score = score;
                this.$scope.market.isTennis = true;
            }
        }

        private getCricketScore(cricket: any): void {
            var commentary: any = {};
            if (cricket) {

                if (cricket.score.home.name != 'HOME') { commentary.homeTeam = cricket.score.home.name; } else {
                    commentary.homeTeam = this.$scope.market.marketRunner[0].runner.name;
                    //if (this.$scope.market.commentary) { commentary.homeTeam = this.$scope.market.commentary.homeTeam; }
                }
                if (cricket.score.away.name != 'AWAY') { commentary.awayTeam = cricket.score.away.name; } else {
                    commentary.awayTeam = this.$scope.market.marketRunner[1].runner.name;
                    //if (this.$scope.market.commentary) { commentary.awayTeam = this.$scope.market.commentary.awayTeam; }
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

        private openBFChart(market: any, r: any): void {
            var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
            this.commonDataService.openBFChart(ids);
        }


        // live bets
        private fillBetSide(): void {
            this.$scope.betSides.push({ id: -1, name: 'All' });
            this.$scope.betSides.push({ id: 1, name: 'Back' });
            this.$scope.betSides.push({ id: 2, name: 'Lay' });
        }

        private fillBetStatus(): void {
            this.$scope.betStatus.push({ id: -1, name: 'All' });
            this.$scope.betStatus.push({ id: 2, name: 'Matched' });
            this.$scope.betStatus.push({ id: 3, name: 'Unmatched' });
        }

        private getLoggedInUser(): void {
            this.$scope.currentUser = this.commonDataService.getLoggedInUserData();
        }

        private searchUser(search: any): void {
            if (search && search.length >= 3) {
                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }
                this.$scope.promiseItem = this.userService.findMembers(search);
                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        this.$scope.anyUserList = response.data;
                        if (this.$scope.anyUserList && this.$scope.anyUserList.length > 0) {
                            this.$scope.anyUserList.forEach((u: any) => {
                                u.extra = super.getUserTypesObj(u.userType);
                            });
                        }
                    });
                }

            } else {
                this.$scope.anyUserList.splice(0);
            }
        }

        private getMatchedBets(params: any): any {
            var searchQuery: any = {
                status: 'matched',
                side: this.$scope.search.betside,
                eventId: this.$stateParams.eventid
            };
            if (this.$scope.search.selectedMarket) { searchQuery.marketId = this.$scope.search.selectedMarket.id; }

            if (params && params.orderBy == '') {
                params.orderBy = 'createdon';
                params.orderByDesc = true;
            }
            var userId = '';
            if (this.$scope.search.selectedUser) { userId = this.$scope.search.selectedUser.id; }
            return this.betService.getLiveBetsByEventId({ searchQuery: searchQuery, params: params, id: userId });
        }

        private getUnmatchedBets(params: any): any {
            var searchQuery: any = {
                status: 'unmatched',
                side: this.$scope.search.betside,
                eventId: this.$stateParams.eventid
            };
            if (this.$scope.search.selectedMarket) { searchQuery.marketId = this.$scope.search.selectedMarket.id; }

            if (params && params.orderBy == '') {
                params.orderBy = 'createdon';
                params.orderByDesc = true;
            }
            var userId = '';
            if (this.$scope.search.selectedUser) { userId = this.$scope.search.selectedUser.id; }
            return this.betService.getLiveBetsByEventId({ searchQuery: searchQuery, params: params, id: userId });
        }

        private fetchLiveBetsData(): void {
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

        private newBetReceived() {
            if (this.$scope.newBetMarketIds.length > 0) {
                if (this.$scope.newBetMarketIds.indexOf(this.$scope.market.id) > -1) {
                    if (this.$scope.market.bettingType == common.enums.BettingType.SESSION || this.$scope.market.bettingType == common.enums.BettingType.LINE
                        || this.$scope.market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                        this.getSessionPosition(this.$scope.market);
                    }
                    else {
                        this.getUserPosition(this.$scope.market);
                    }
                }

                var other = this.$scope.newBetMarketIds.filter((a: any) => { return a != this.$scope.market.id; }) || [];
                if (other && other.length > 0) {
                    var userIds: any[] = [];
                    var sessionIds: any[] = [];
                    this.$scope.otherMarkets.forEach((m: any) => {
                        if (other.indexOf(m.id) > -1) {
                            if (m.bettingType == common.enums.BettingType.SESSION || m.bettingType == common.enums.BettingType.LINE
                                || m.bettingType == common.enums.BettingType.SCORE_RANGE) {
                                sessionIds.push(m.id);
                            }
                            else {
                                userIds.push(m.id)
                            }
                        }
                    });
                    if (userIds.length > 0) { this.getUserPositionByIds(userIds); }
                    if (sessionIds.length > 0) { this.getSessionPositionByIds(sessionIds); }
                }

                this.fetchLiveBetsData();
                this.startTimer();
                this.playAudio();
            }
        }

        private playAudio(): void {
            var audio = new Audio('audio/short_1.mp3');
            audio.play();
        }

        private resetCriteria(): void {
            this.$scope.search.status = '2';
            this.$scope.search.betside = '-1';
            this.$scope.search.selectedUser = undefined;
            this.$scope.search.selectedMarket = undefined;
            this.fetchLiveBetsData();
        }

        private startTimer(start: boolean = true): void {
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
                            startdelay()
                        }, 1000);
                    } else {
                        if (this.$scope.isBetCountChanged) {
                            this.$timeout.cancel(this.$scope.timer_position);
                            this.$scope.isBetCountChanged = false;
                            this.newBetReceived();
                        } else { this.startTimer(); }
                    }
                });
                this.$timeout(() => { startdelay() }, 1000);
            }
        }

        private openBook(event: any, market: any) {
            if (event) { event.stopPropagation(); }
            var run = market.marketRunner.map((m: any) => { return m.runner.name }).join(',');
            var url = this.$state.href('positionviewer', { marketid: market.id, bettingtype: market.bettingType, runner: this.$base64.encode(run), name: this.$base64.encode(market.name) });
            this.$window.open(this.$sce.trustAsUrl(url), market.name, "width=700,height=250,left=400,top=50,location=no,right=50");
        }

        // new/close market

        private checkNewMarket(eventId: any) {
            if (eventId == this.$stateParams.eventid) {
                this.marketService.getMarketByEventId(eventId)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success && response.data) {
                            var myEvent: any[] = response.data;
                            if (myEvent.length > 0) {
                                var newIds: any[] = [];
                                myEvent.forEach((ms: any) => {
                                    if (ms.temporaryStatus != common.enums.TemporaryStatus.SUSPEND) {
                                        var isFound = false;
                                        var newid = ms.id;
                                        if (this.$scope.market.id == newid) { isFound = true; }
                                        if (!isFound) {
                                            this.$scope.otherMarkets.forEach((m: any) => {
                                                if (m.id == newid) {
                                                    isFound = true;
                                                    m.marketStatus = ms.marketStatus;
                                                    m.temporaryStatus = ms.temporaryStatus;
                                                }
                                            });
                                        }
                                        if (!isFound) { newIds.push(newid); }
                                    }
                                });
                                if (newIds.length > 0) { this.getNewlyAddedMarkets(newIds); }
                            }
                        }
                    });
            }
        }

        private getNewlyAddedMarkets(marketIds: any[]) {
            this.marketOddsService.getMultiMarkets(marketIds)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response && response.success) {
                        if (response.data.length > 0) {
                            angular.forEach(response.data, (m: any) => {
                                m.newitem = true;
                                this.$scope.otherMarkets.forEach((x: any) => { if (marketIds.indexOf(x.id) < 0) x.newitem = false; });
                                if (common.helpers.Utility.IndexOfObject(this.$scope.otherMarkets, 'id', m.id) < 0) {
                                    this.$scope.otherMarkets.push(m);
                                }
                            });
                        }
                    }
                }).finally(() => { this.subscribeOdds(); });
        }

        private checkOtherMarketStatus() {
            if (this.$scope.timer_market_status) { this.$timeout.cancel(this.$scope.timer_market_status); }

            // check other market status
            if (this.$scope.otherMarkets.length > 0) {
                this.isMultiMarketClosed(this.$scope.otherMarkets);
            }

            if (!this.$scope.$$destroyed) {
                this.$scope.timer_market_status = this.$timeout(() => {
                    this.checkOtherMarketStatus();
                }, 20000);
            }
        }

        public isMultiMarketClosed(markets: any[] = []): boolean {
            var needsToChangeIndex: boolean = false;
            var removeIds = [];
            markets.forEach((m: any) => {
                if (m.marketStatus == common.enums.MarketStatus.CLOSED) {
                    removeIds.push(m.id);
                }
            });
            if (removeIds.length > 0) {
                removeIds.forEach((id: any) => {
                    var index = common.helpers.Utility.IndexOfObject(markets, 'id', id);
                    if (index > -1) {
                        markets.splice(index, 1);
                    }
                });
                if (markets.length <= 0) { needsToChangeIndex = true; }
            }
            return needsToChangeIndex;
        }

    }
    angular.module('intranet.master').controller('fullPositionCtrl', FullPositionCtrl);
}