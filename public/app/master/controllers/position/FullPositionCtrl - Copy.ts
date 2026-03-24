module intranet.master {

    export interface IFullPositionScope2 extends intranet.common.IScopeBase {
        p: any;
        market: any;
        positions: any;
        loginUserPosition: any;
        openedPosition: any[];
        openedBook: any[];
        promiseItem: any;
        anyUserList: any[];

        userpositionTemplate: any;
        userpositionChildTemplate: any;

        sessionpositionTemplate: any;
        sessionpositionChildTemplate: any;

        selectedInterval: any;
        isBetCountChanged: any;

        timer_market_score: any;
        timer_position: any;

        // bets
        betStatus: any[];
        betSides: any[];
        search: any;
        currentUser: any;

        webAdminList: any[];
        adminList: any[];
        masterList: any[];
        userList: any[];

        isAutoOpen: boolean;
        autoOpenSec: any;
        startBMTimer: boolean;
    }

    export class FullPosition2Ctrl extends intranet.common.ControllerBase<IFullPositionScope2>
        implements common.init.IInit {
        constructor($scope: IFullPositionScope2,
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
            private toasterService: common.services.ToasterService,
            private marketService: services.MarketService,
            protected $rootScope: any,
            private positionService: services.PositionService) {
            super($scope);

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

        public initScopeValues(): void {
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

        public loadInitialData(): void {
            this.getLoggedInUser();
            this.getMarketpositionbyMarketId(this.$stateParams.marketid);
            this.fillBetSide();
            this.fillBetStatus();
        }

        private getMarketpositionbyMarketId(marketid: any): void {
            this.positionService.getMarketpositionbyMarketId(marketid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.market = response.data;
                        this.$scope.p = { market: response.data };
                        if (this.$scope.market.bettingType == common.enums.BettingType.SESSION || this.$scope.market.bettingType == common.enums.BettingType.LINE || this.$scope.market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                            this.getSessionPosition();
                        }
                        else {
                            this.getUserPosition();
                        }

                        this.readScoreFromBF();
                    }
                }).finally(() => { this.subscribeOdds(); });
        }

        private subscribeOdds(): void {
            var mids: any[] = [];

            if (this.$scope.market && this.$scope.market.id) {
                mids.push(this.$scope.market.id);
            }
            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });

        }

        private setMarketOdds(responseData: any[]): void {
            responseData.forEach((r: any) => {
                if (this.$scope.market && this.$scope.market.id == r.id) {
                    super.setOddsInMarket(this.$scope.market, r,false);
                    if (r.ts == common.enums.TemporaryStatus.BALL && this.$scope.isAutoOpen && !this.$scope.startBMTimer) {
                        this.$scope.startBMTimer = true;
                        this.changeMarketStatus();
                    }
                }
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


        private open_Close_Check_Position(user: any, p: any = null, isclick: boolean = false): void {
            if (user.downline && user.downline.length > 0) {
                if (isclick) {
                    user.open = !user.open;
                    if (user.open) { this.$scope.openedPosition.push(user.userId); }
                    else {
                        var index = this.$scope.openedPosition.indexOf(user.userId);
                        if (index > -1) { this.$scope.openedPosition.splice(index, 1); }
                    }
                } else {
                    if (this.$scope.openedPosition.indexOf(user.userId) > -1) {
                        user.open = true;
                    } else {
                        user.open = false;
                    }
                }
            }
        }

        private getUserPosition(): void {
            var self = this;
            var isOpen = ((p: any) => {
                self.open_Close_Check_Position(p);
                if (p.downline && p.downline.length > 0) {
                    angular.forEach(p.downline, (d: any) => {
                        isOpen(d);
                    });
                }
            });
            var findMember = ((m: any, id: any) => {
                if (m.userId == id) {
                    self.$scope.loginUserPosition = m;
                    self.$scope.positions = m.downline;
                }
                else {
                    if (m.downline && m.downline.length > 0) {
                        angular.forEach(m.downline, (d: any) => {
                            findMember(d, id);
                        });
                    }
                }
            });
            var model = { MarketId: this.$scope.market.id };
            this.positionService.getUserPositionPost(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.loginUserPosition = response.data;
                        this.$scope.positions = response.data.downline;
                        if (this.$scope.positions) {
                            angular.forEach(this.$scope.positions, (p: any) => {
                                isOpen(p);
                            });
                        }

                    }
                }).finally(() => {
                    this.startTimer();
                    if (this.$scope.loginUserPosition && this.$scope.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(this.$scope.loginUserPosition.marketRunners, (m: any) => {
                            if (m.pl < pl) { pl = m.pl; }
                        });
                        this.$scope.market.pl = pl;
                    }
                });
        }


        private open_Close_Check_Book(user: any, isclick: boolean = false): void {
            if (user.downline && user.downline.length > 0) {
                if (isclick) {
                    user.showSession = !user.showSession;
                    if (user.showSession) { this.$scope.openedBook.push(user.userId); }
                    else {
                        var index = this.$scope.openedBook.indexOf(user.userId);
                        if (index > -1) { this.$scope.openedBook.splice(index, 1); }
                    }
                } else {
                    if (this.$scope.openedBook.indexOf(user.userId) > -1) {
                        user.showSession = true;
                        this.commonDataService.openScorePosition(this.$scope.market.id + '_' + user.userId, user.showSession, user.ladders, true);
                    } else {
                        user.showSession = false;
                    }
                }
            }
        }

        public openBook(event: any, user: any, p: any = null): void {
            if (event) { event.stopPropagation(); }
            this.open_Close_Check_Book(user, true);
            this.commonDataService.openScorePosition(this.$scope.market.id + '_' + user.userId, user.showSession, user.ladders, true);
        }

        private getSessionPosition(firstTime: boolean = false): void {
            var self = this;
            var isOpen = ((p: any) => {
                self.open_Close_Check_Position(p);
                self.open_Close_Check_Book(p);
                if (p.downline && p.downline.length > 0) {
                    angular.forEach(p.downline, (d: any) => {
                        isOpen(d);
                    });
                }
            });

            var findMember = ((m: any, id: any) => {
                if (m.userId == id) {
                    self.$scope.loginUserPosition = m;
                    self.$scope.positions = m.downline;
                }
                else {
                    if (m.downline && m.downline.length > 0) {
                        angular.forEach(m.downline, (d: any) => {
                            findMember(d, id);
                        });
                    }
                }
            });


            var model = { MarketId: this.$scope.market.id};
            this.positionService.getFancyUserPosition(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.loginUserPosition = response.data;
                        this.$scope.positions = response.data.downline;
                        if (this.$scope.positions) {
                            angular.forEach(this.$scope.positions, (p: any) => {
                                isOpen(p);
                            });
                        }
                        self.open_Close_Check_Book(this.$scope.loginUserPosition);
                    }
                }).finally(() => {
                    this.startTimer();
                    if (this.$scope.loginUserPosition && this.$scope.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(this.$scope.loginUserPosition.marketRunners, (m: any) => {
                            if (m.pl < pl) { pl = m.pl; }
                        });
                        this.$scope.market.pl = pl;
                    }
                });

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
            if (this.$scope.search.selectedUser) { userId = this.$scope.search.selectedUser.id; }
            return this.betService.getLiveBetsByMarketId({ searchQuery: searchQuery, params: params, id: userId  });
        }

        private getUnmatchedBets(params: any): any {
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
            if (this.$scope.search.selectedUser) { userId = this.$scope.search.selectedUser.id; }
            return this.betService.getLiveBetsByMarketId({ searchQuery: searchQuery, params: params, id: userId  });
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


        private playAudio(): void {
            var audio = new Audio('audio/short_1.mp3');
            audio.play();
        }

        private resetCriteria(): void {
            this.$scope.search.status = '2';
            this.$scope.search.betside = '-1';
            this.$scope.search.selectedUser = undefined;
            this.fetchLiveBetsData();
        }

        private refreshBetsAndPosition(): void {
            this.fetchLiveBetsData();
            this.$rootScope.$emit('admin-balance-changed');
            if (this.$scope.market.bettingType == common.enums.BettingType.SESSION || this.$scope.market.bettingType == common.enums.BettingType.LINE
                || this.$scope.market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                this.getSessionPosition();
            } else {
                this.getUserPosition();
            }
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
                            this.$scope.isBetCountChanged = false;
                            this.refreshBetsAndPosition();
                        } else { this.startTimer(); }
                    }
                });
                this.$timeout(() => { startdelay() }, 1000);
            }
        }

        private shortcut(event): void {
            if ((event.originalEvent.ctrlKey == true && event.originalEvent.code === 'KeyB' || (event.originalEvent.code === 'F7'))
                && !this.$scope.$$destroyed) {
                this.refreshBetsAndPosition();
            }
        }

        private autoBookMakerChanged() {
            if (!this.$scope.isAutoOpen) { this.$scope.startBMTimer = false; }
        }

        private changeMarketStatus() {
            if (this.$scope.isAutoOpen && this.$scope.startBMTimer) {
                this.$timeout(() => {
                    this.marketService.changeTemporaryStatus(this.$scope.market.id, common.enums.TemporaryStatus.OPEN)
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.toasterService.showToast(common.helpers.ToastType.Success, 'market.tempstatus.changed.success');
                            } else {
                                this.toasterService.showMessages(response.messages);
                            }
                        }).finally(() => { this.$scope.startBMTimer = false; });
                }, this.$scope.autoOpenSec * 1000);
            }
        }
    }
    angular.module('intranet.master').controller('FullPosition2Ctrl', FullPosition2Ctrl);
}