module intranet.master {

    export interface IExposureDetailScope extends intranet.common.IScopeBase {
        market: any;
        positions: any;

        isBetTickerView: any;
        userPTtree: any[];

        timer_market_score: any;
        timer_position: any;

        isBetCountChanged: boolean;

        currentMarketId: any;
        drpMarkets: any[];
        selectedInterval: any;

        userpositionTemplate: any;
        userpositionChildTemplate: any;

        sessionpositionTemplate: any;
        sessionpositionChildTemplate: any;

        openedPosition: any[];
        openedBook: any[];

        loginUserPosition: any;
    }

    export class ExposureDetailCtrl extends intranet.common.ControllerBase<IExposureDetailScope>
        implements common.init.IInit {
        constructor($scope: IExposureDetailScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private $stateParams: any,
            private settings: common.IBaseSettings,
            private $timeout: ng.ITimeoutService,
            private commentaryService: services.CommentaryService,
            private commonDataService: common.services.CommonDataService,
            private marketService: services.MarketService,
            private betService: services.BetService,
            private WSSocketService: any,
            protected $rootScope: any,
            private positionService: services.PositionService) {
            super($scope);

            var newPageLoader = this.$scope.$on('newPageLoaded', (e: any, data: any) => {
                if (e.targetScope.gridId === 'kt-exposure-livebets-grid') {
                    if (data && data.result.length > 0) {
                        data.result.forEach((item: any) => {
                            var diff = (item.price - item.avgPrice);
                            if (diff != 0) {
                                if (diff < 0) { diff = math.abs(diff); }
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
                        if (data.scoreSource == common.enums.ScoreSource.Betfair) {
                            this.getCricketScore();
                        } else {
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

        public initScopeValues(): void {
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

        public loadInitialData(): void {
            this.getMarketpositionbyMarketId();
            this.buildUserTreeForPT();
        }

        private buildUserTreeForPT(): void {
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


        private getMarketsListByEvent(eventid: any): void {
            this.marketService.getMarketByEventId(eventid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.drpMarkets = response.data;
                    }
                });
        }

        private marketSelectionChanged(): void {
            if (this.$scope.positions && this.$scope.positions.length > 0) this.$scope.positions.splice(0);
            this.getMarketpositionbyMarketId();
        }

        private bookTypeChanged(): void {
            this.commonDataService.setExposurePTOption(this.$scope.market.includePT);
            if (this.$scope.market.bettingType == common.enums.BettingType.SESSION || this.$scope.market.bettingType == common.enums.BettingType.LINE
                || this.$scope.market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                this.getSessionPosition();
            } else {
                this.getUserPosition();
            }
        }


        private getMarketpositionbyMarketId(): void {
            this.positionService.getMarketpositionbyMarketId(this.$scope.currentMarketId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.market = response.data;
                        this.subscribeOdds();

                        this.$scope.market.includePT = this.commonDataService.getExposurePTOption();

                        if (this.$scope.currentMarketId == this.$stateParams.marketid) { this.getMarketsListByEvent(this.$scope.market.eventId); }
                        if (this.$scope.market.bettingType == common.enums.BettingType.SESSION || this.$scope.market.bettingType == common.enums.BettingType.LINE
                            || this.$scope.market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                            this.getSessionPosition();
                        }
                        else {
                            this.getUserPosition();
                        }
                        //this.readScoreFromBF();
                    }
                }).finally(() => {
                    this.fetchLiveBetsData();
                });
        }

        public unsubscribeOdds(): void {
            this.WSSocketService.sendMessage({
                Mids: [], MessageType: common.enums.WSMessageType.SubscribeMarket
            });
        }

        private wssReconnected(): void {
            this.subscribeOdds();
            this.refreshBetsAndPosition();
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
                    super.setOddsInMarket(this.$scope.market, r);
                }
            });
        }


        private open_Close_Check_Position(user: any, isclick: boolean = false): void {
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
            var model = { MarketId: this.$scope.currentMarketId, IsPt: this.$scope.market.includePT };
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

                        if (this.$stateParams.memberid && response.data.userId != this.$stateParams.memberid) {
                            this.$scope.positions.forEach((p: any) => {
                                findMember(p, this.$stateParams.memberid);
                            });
                        }
                    }
                }).finally(() => { this.startTimer(); });
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
                        this.commonDataService.openScorePosition(user.userId, user.showSession, user.ladders, true);
                    } else {
                        user.showSession = false;
                    }
                }
            }
        }

        public openBook(event: any, user: any): void {
            if (event) { event.stopPropagation(); }
            this.open_Close_Check_Book(user, true);
            this.commonDataService.openScorePosition(user.userId, user.showSession, user.ladders, true);
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


            var model = { MarketId: this.$scope.currentMarketId, IsPt: this.$scope.market.includePT };
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
                        if (this.$stateParams.memberid && response.data.userId != this.$stateParams.memberid) {
                            this.$scope.positions.forEach((p: any) => {
                                findMember(p, this.$stateParams.memberid);
                            });
                        }
                        self.open_Close_Check_Book(this.$scope.loginUserPosition);
                    }
                }).finally(() => { this.startTimer(); });

        }


        // get score from betfair
        private readScoreFromBF(): void {
            var bfEventType = this.commonDataService.getBFEventTypeId(this.$scope.market.eventType.id);
            if (bfEventType == this.settings.SoccerBfId) { this.getSoccerScore(); }
            else if (bfEventType == this.settings.TennisBfId) { this.getTennisScore(); }
            else if (bfEventType == this.settings.CricketBfId) { this.$timeout(() => { this.checkScoreSource(); }, 3000); }
        }

        private getSoccerScore(): void {
            if (this.$scope.timer_market_score) { this.$timeout.cancel(this.$scope.timer_market_score); }
            this.commentaryService.getBFSoccerScore(this.$scope.market.event.sourceId)
                .success((response: any) => {
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
                }).finally(() => {
                    if (!this.$scope.$$destroyed && this.$scope.market.marketStatus != common.enums.MarketStatus.CLOSED) {
                        var seconds = (this.$scope.market.inPlay ? 5 : 60);
                        this.$scope.timer_market_score = this.$timeout(() => {
                            this.getSoccerScore();
                        }, 1000 * seconds);
                    }
                });
        }

        private getTennisScore(): void {
            if (this.$scope.timer_market_score) { this.$timeout.cancel(this.$scope.timer_market_score); }
            this.commentaryService.getBFTennisScore(this.$scope.market.event.sourceId)
                .success((response: any) => {
                    if (response || response.length > 0) {
                        var score = response[0];
                        if (score) {
                            this.$scope.market.score = score;
                            this.$scope.market.isTennis = true;
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed && this.$scope.market.marketStatus != common.enums.MarketStatus.CLOSED) {
                        var seconds = (this.$scope.market.inPlay ? 5 : 60);
                        this.$scope.timer_market_score = this.$timeout(() => {
                            this.getTennisScore();
                        }, 1000 * seconds);
                    }
                });
        }

        private checkScoreSource(): void {
            this.commentaryService.getCommentary(this.$scope.market.eventId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.market.event.scoreSource = response.data.scoreSource;
                        if (response.data.scoreSource == common.enums.ScoreSource.Betfair) {
                            this.getCricketScore();
                        } else {
                            if (response.data.commentary) { this.$scope.market.commentary = JSON.parse(response.data.commentary) };
                        }
                    }
                });
        }

        private getCricketScore(): void {
            if (this.$scope.market.event.scoreSource == common.enums.ScoreSource.Betfair) {
                this.commentaryService.getBFTennisScore(this.$scope.market.event.sourceId)
                    .success((response: any) => {
                        if (response || response.length > 0) {
                            var cricket = response[0];
                            var commentary: any = {};
                            if (cricket) {
                                if (cricket.score.home.name != 'HOME') { commentary.homeTeam = cricket.score.home.name; } else { if (this.$scope.market.commentary) { commentary.homeTeam = this.$scope.market.commentary.homeTeam; } }
                                if (cricket.score.away.name != 'AWAY') { commentary.awayTeam = cricket.score.away.name; } else { if (this.$scope.market.commentary) { commentary.awayTeam = this.$scope.market.commentary.awayTeam; } }
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
                        if (!this.$scope.$$destroyed && this.$scope.market.marketStatus != common.enums.MarketStatus.CLOSED) {
                            var seconds = (this.$scope.market.inPlay ? 5 : 60);
                            this.$scope.timer_market_score = this.$timeout(() => {
                                this.getCricketScore();
                            }, 1000 * seconds);
                        }
                    });
            }
        }


        // get live bets
        private getMatchedBets(params: any): any {
            var searchQuery: any = {
                marketId: this.$scope.currentMarketId
            };
            if (this.$stateParams.memberid) { searchQuery.userId = this.$stateParams.memberid; }
            if (params && params.orderBy == '') {
                params.orderBy = 'createdon';
                params.orderByDesc = true;
            }

            return this.betService.getLiveBetsByMarketId({ searchQuery: searchQuery, params: params });
        }


        private playAudio(): void {
            var audio = new Audio('audio/short_1.mp3');
            audio.play();
        }

        private fetchLiveBetsData(): void {
            var refreshCMD = "refreshGrid";
            refreshCMD = refreshCMD + "_kt-exposure-livebets-grid";
            this.$scope.$broadcast(refreshCMD);
        }


        private refreshBetsAndPosition(): void {
            this.fetchLiveBetsData();
            this.$rootScope.$emit('master-balance-changed');
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
                this.$scope.timer_position = this.$timeout(() => { startdelay() }, 1000);
            }
        }

    }
    angular.module('intranet.master').controller('exposureDetailCtrl', ExposureDetailCtrl);
}