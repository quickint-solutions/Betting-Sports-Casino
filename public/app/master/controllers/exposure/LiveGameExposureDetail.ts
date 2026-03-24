module intranet.master {

    export interface ILiveGameExposureDetailScope extends intranet.common.IScopeBase {
        market: any;
        positions: any;


        timer_position: any;
        timer_nextmarket: any;


        isBetCountChanged: any;
        isBetTickerView: any;
        userPTtree: any;

        selectedInterval: any;

        canILoad: boolean;
        cardImagePath: any;
        themeImagePath: string;
        lastClosedMarket: any;

        userpositionTemplate: any;
        userpositionChildTemplate: any;

        sessionpositionTemplate: any;
        sessionpositionChildTemplate: any;

        openedPosition: any[];
        openedBook: any[];

        loginUserPosition: any;
    }

    export class LiveGameExposureDetailCtrl extends intranet.common.ControllerBase<ILiveGameExposureDetailScope>
        implements common.init.IInit {
        constructor($scope: ILiveGameExposureDetailScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private $stateParams: any,
            private $filter: any,
            private settings: common.IBaseSettings,
            private $timeout: ng.ITimeoutService,
            private commentaryService: services.CommentaryService,
            private commonDataService: common.services.CommonDataService,
            private marketOddsService: services.MarketOddsService,
            private marketService: services.MarketService,
            private exposureService: services.ExposureService,
            private betService: services.BetService,
            private userService: services.UserService,
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

        public initScopeValues(): void {
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
            this.marketOddsService.getGameByEventId(this.$stateParams.eventid)
                .success((response: common.messaging.IResponse<any>) => {
                    this.$scope.market = response.data;
                    this.$scope.market.includePT = this.commonDataService.getExposurePTOption();

                    if (this.$scope.market.bettingType == common.enums.BettingType.FIXED_ODDS) {
                        if (this.$scope.market.gameType == common.enums.GameType.Patti2) {
                            var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                            this.$scope.market.pattiRunner = metadata.patti2;
                        }
                        else if (this.$scope.market.gameType == common.enums.GameType.PokerT20) {
                            var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                            this.$scope.market.pattiRunner = metadata.pokert20;
                        }
                        else if (this.$scope.market.gameType == common.enums.GameType.Patti3) {
                            var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                            this.$scope.market.pattiRunner = metadata.patti3;
                        }
                        else if (this.$scope.market.gameType == common.enums.GameType.DragonTiger || this.$scope.market.gameType == common.enums.GameType.Up7Down
                            || this.$scope.market.gameType == common.enums.GameType.ClashOfKings) {
                            this.$scope.market.marketRunner.forEach((mr: any) => {
                                if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                    mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                    mr.runnerGroup = mr.metadata.runnerGroup;
                                }
                            });
                        }
                    } else if (this.$scope.market.gameType == common.enums.GameType.Card32) {
                        this.$scope.market.marketRunner.forEach((mr: any) => {
                            if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                mr.runnerGroup = mr.metadata.runnerGroup;
                            }
                        });
                    }
                    this.subscribeOdds();
                    if (this.$scope.market.bettingType == common.enums.BettingType.SESSION || this.$scope.market.bettingType == common.enums.BettingType.LINE) {
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
                    r.mr.forEach((value: any, index: any) => {
                        this.$scope.market.marketRunner[index].status = value.rs;
                        this.$scope.market.marketRunner[index].backPrice = value.bp;
                        this.$scope.market.marketRunner[index].layPrice = value.lp;
                    });
                    if (this.$scope.market.marketStatus == common.enums.MarketStatus.CLOSED) {
                        this.$scope.lastClosedMarket = this.$scope.market.id;
                        this.$timeout(() => { this.getNextMarket(); }, 5000);
                    }
                }
            });
        }

        private getNextMarket(): void {
            this.$timeout.cancel(this.$scope.timer_nextmarket);
            var currentMarketId = this.$scope.market.id;
            this.marketOddsService.getGameByEventId(this.$stateParams.eventid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data && response.data.id) {
                        if (response.data.id != currentMarketId && response.data.id != this.$scope.lastClosedMarket) {
                            this.$scope.market = response.data;

                            if (this.$scope.market.bettingType == common.enums.BettingType.FIXED_ODDS) {
                                if (this.$scope.market.gameType == common.enums.GameType.Patti2) {
                                    var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.market.pattiRunner = metadata.patti2;
                                }
                                else if (this.$scope.market.gameType == common.enums.GameType.PokerT20) {
                                    var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.market.pattiRunner = metadata.pokert20;
                                }
                                else if (this.$scope.market.gameType == common.enums.GameType.Patti3) {
                                    var metadata = JSON.parse(this.$scope.market.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.market.pattiRunner = metadata.patti3;
                                }
                                else if (this.$scope.market.gameType == common.enums.GameType.DragonTiger || this.$scope.market.gameType == common.enums.GameType.Up7Down
                                    || this.$scope.market.gameType == common.enums.GameType.ClashOfKings) {
                                    this.$scope.market.marketRunner.forEach((mr: any) => {
                                        if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                            mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                            mr.runnerGroup = mr.metadata.runnerGroup;
                                        }
                                    });
                                }
                            } else if (this.$scope.market.gameType == common.enums.GameType.Card32) {
                                this.$scope.market.marketRunner.forEach((mr: any) => {
                                    if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                        mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                        mr.runnerGroup = mr.metadata.runnerGroup;
                                    }
                                });
                            }

                            this.subscribeOdds();
                            this.fetchLiveBetsData();

                            if (this.$scope.market.bettingType == common.enums.BettingType.SESSION || this.$scope.market.bettingType == common.enums.BettingType.LINE) {
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
            var model = { MarketId: this.$scope.market.id, IsPt: this.$scope.market.includePT };
            this.positionService.getUserPositionPost(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
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
                    } else { this.$scope.loginUserPosition = []; this.$scope.positions = []; }
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


            var model = { MarketId: this.$scope.market.id, IsPt: this.$scope.market.includePT };
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



        private getExposure(): void {
            this.exposureService.getExposure()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
        }


        private getMatchedBets(params: any): any {
            var searchQuery = {
                marketId: this.$scope.market.id
            };
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
            this.getExposure();
            this.fetchLiveBetsData();
            this.$rootScope.$emit('master-balance-changed');
            if (this.$scope.market.bettingType != common.enums.BettingType.SESSION && this.$scope.market.bettingType != common.enums.BettingType.LINE) {
                this.getUserPosition();
            } else {
                this.getSessionPosition();
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
                this.$scope.timer_position =  this.$timeout(() => { startdelay() }, 1000);
            }
        }


    }
    angular.module('intranet.master').controller('liveGameExposureDetailCtrl', LiveGameExposureDetailCtrl);
}