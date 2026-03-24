module intranet.home {

    export interface ILiveGamesMarketScope extends intranet.common.IBetScopeBase {
        timer_nextmarket

        fullMarket: any;
        wcs_video: any;
        resultsList: any[];

        placeBetData: any;
        currentInlineBet: any;
        cardImagePath: string;
        themeImagePath: string;

    }

    export class LiveGamesMarketCtrl extends intranet.common.BetControllerBase<ILiveGamesMarketScope>
        implements intranet.common.init.IInit {
        constructor($scope: ILiveGamesMarketScope,
            private $stateParams: any,
            private marketOddsService: services.MarketOddsService,
            public $timeout: ng.ITimeoutService,
            public toasterService: intranet.common.services.ToasterService,
            public $rootScope: any,
            private videoService: services.VideoService,
            public $compile: any,
            private $state: any,
            private $filter: any,
            public WSSocketService: any,
            private marketService: services.MarketService,
            public placeBetDataService: common.services.PlaceBetDataService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public commonDataService: common.services.CommonDataService,
            private localCacheHelper: common.helpers.LocalCacheHelper,
            public settings: common.IBaseSettings,
            public betService: services.BetService) {
            super($scope);

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
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
                wsListnerMarketOdds();
            });
            super.init(this);
        }

        // bet process related
        private betProcessStarted(marketid: any): void {
            if (this.$scope.fullMarket.id == marketid) {
                this.$scope.fullMarket.betInProcess = true;
            }
        }

        private betProcessComplete(marketid: any): void {
            if (this.$scope.fullMarket.id == marketid) {
                this.$scope.fullMarket.betInProcess = false;
            }
        }

        private calculatePPL(singlemarket: boolean = true): void {
            this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
            if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                if (singlemarket && this.$scope.fullMarket) {
                    var bets = this.$scope.placeBetData.bets.filter((b: any) => { return b.marketId == this.$scope.fullMarket.id; });
                    intranet.common.helpers.PotentialPLCalc.calcPL(this.$scope.fullMarket, bets);
                }
            } else {
                if (this.$scope.fullMarket) {
                    this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
                        mr.pPL = 0; mr.pstake = 0;
                        if (this.$scope.fullMarket.gameType == common.enums.GameType.Up7Down) {
                            this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
                                mr.metadata.up7down.forEach((d: any) => { d.pstake = 0; });
                            });
                        }
                        if (this.$scope.fullMarket.gameType == common.enums.GameType.DragonTiger) {
                            this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
                                if (mr.metadata) {
                                    mr.metadata.dragonTiger.forEach((d: any) => { d.pstake = 0; });
                                }
                            });
                        }
                        if (this.$scope.fullMarket.gameType == common.enums.GameType.Card32) {
                            this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
                                if (mr.metadata && mr.metadata.card32) {
                                    mr.metadata.card32.forEach((d: any) => { d.pstake = 0; });
                                }
                            });
                        }
                        if (this.$scope.fullMarket.gameType == common.enums.GameType.ClashOfKings) {
                            this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
                                if (mr.metadata && mr.metadata.clashOfKing) {
                                    mr.metadata.clashOfKing.forEach((d: any) => { d.pstake = 0; });
                                }
                            });
                        }
                    });
                }
            }
        }


        public initScopeValues() {
            this.$scope.resultsList = [];
            this.$scope.cardImagePath = this.settings.ImagePath + 'images/scards/';
            this.$scope.themeImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
        }

        public loadInitialData() {
            this.handleEventChange();
            this.getFullmarket();
        }


        private startVideo(eventId: any): void {
            this.videoService.getVideoByEvent(eventId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data && response.data.streamName) {
                            this.$scope.wcs_video = response.data;
                        }
                    }
                });
        }

        private handleEventChange(): void {
            this.localCacheHelper.put('eventid', '');
            this.$scope.$emit('event-changed', '');
        }


        // get main market data
        public getFullmarket(): void {
            this.marketOddsService.getGameByEventId(this.$stateParams.eventid)
                .success((response: common.messaging.IResponse<any>) => {
                    this.$scope.fullMarket = response.data;
                    if (this.$scope.fullMarket && this.$scope.fullMarket.event) {
                        this.startVideo(this.$scope.fullMarket.event.id);
                        this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);

                        if (this.$scope.fullMarket.bettingType == common.enums.BettingType.FIXED_ODDS) {

                            if (this.$scope.fullMarket.gameType == common.enums.GameType.Patti2) {
                                var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                this.$scope.fullMarket.pattiRunner = metadata.patti2;
                            }
                            else if (this.$scope.fullMarket.gameType == common.enums.GameType.PokerT20) {
                                var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                this.$scope.fullMarket.pattiRunner = metadata.pokert20;
                            }
                            else if (this.$scope.fullMarket.gameType == common.enums.GameType.Patti3) {
                                var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                this.$scope.fullMarket.pattiRunner = metadata.patti3;
                            }
                            else if (this.$scope.fullMarket.gameType == common.enums.GameType.DragonTiger ||
                                this.$scope.fullMarket.gameType == common.enums.GameType.Up7Down ||
                                this.$scope.fullMarket.gameType == common.enums.GameType.ClashOfKings) {
                                this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
                                    if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                        mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                        mr.runnerGroup = mr.metadata.runnerGroup;
                                    }
                                });
                            }
                            else if (this.$scope.fullMarket.gameType == common.enums.GameType.Patti10) {
                                this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
                                    mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                    mr.runnerGroup = mr.metadata.runnerGroup;
                                });
                            }
                        } else {
                            if (this.$scope.fullMarket.gameType == common.enums.GameType.Card32) {
                                this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
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

        private getNextMarket(lastMarketId:any): void {
            this.$timeout.cancel(this.$scope.timer_nextmarket);

            var currentMarketId = lastMarketId;

            this.marketOddsService.getGameByEventId(this.$stateParams.eventid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data && response.data.id) {
                        if (response.data.id != currentMarketId ) {
                            this.$scope.fullMarket = response.data;
                            this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                            if (this.$scope.fullMarket.bettingType == common.enums.BettingType.FIXED_ODDS) {

                                if (this.$scope.fullMarket.gameType == common.enums.GameType.Patti2) {
                                    var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.fullMarket.pattiRunner = metadata.patti2;
                                }
                                else if (this.$scope.fullMarket.gameType == common.enums.GameType.PokerT20) {
                                    var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.fullMarket.pattiRunner = metadata.pokert20;
                                }
                                else if (this.$scope.fullMarket.gameType == common.enums.GameType.Patti3) {
                                    var metadata = JSON.parse(this.$scope.fullMarket.marketRunner[0].runner.runnerMetadata);
                                    this.$scope.fullMarket.pattiRunner = metadata.patti3;
                                }
                                else if (this.$scope.fullMarket.gameType == common.enums.GameType.DragonTiger ||
                                    this.$scope.fullMarket.gameType == common.enums.GameType.Up7Down ||
                                    this.$scope.fullMarket.gameType == common.enums.GameType.ClashOfKings) {
                                    this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
                                        if (mr.runner.runnerMetadata && mr.runner.runnerMetadata != 'NULL') {
                                            mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                            mr.runnerGroup = mr.metadata.runnerGroup;
                                        }
                                    });
                                }
                                else if (this.$scope.fullMarket.gameType == common.enums.GameType.Patti10) {
                                    this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
                                        mr.metadata = JSON.parse(mr.runner.runnerMetadata);
                                        mr.runnerGroup = mr.metadata.runnerGroup;
                                    });
                                }
                            } else {
                                if (this.$scope.fullMarket.gameType == common.enums.GameType.Card32) {
                                    this.$scope.fullMarket.marketRunner.forEach((mr: any) => {
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

        private getRecentResults(): void {
            var count = 20;
            if (this.$scope.fullMarket.gameType == common.enums.GameType.AndarBahar || this.$scope.fullMarket.gameType == common.enums.GameType.Up7Down || this.$scope.fullMarket.gameType == common.enums.GameType.DragonTiger) { count = 75; }
            this.marketService.getRecentCloseByEvent(this.$scope.fullMarket.event.id, count)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.resultsList = response.data;
                        if (this.$scope.resultsList.length > 0) {
                            this.$scope.resultsList.forEach((r: any) => {
                                if (this.$scope.fullMarket.gameType == common.enums.GameType.Patti3 || this.$scope.fullMarket.gameType == common.enums.GameType.Patti2
                                    || this.$scope.fullMarket.gameType == common.enums.GameType.PokerT20
                                    || this.$scope.fullMarket.gameType == common.enums.GameType.ClashOfKings
                                    || this.$scope.fullMarket.gameType == common.enums.GameType.Poker || this.$scope.fullMarket.gameType == common.enums.GameType.Up7Down
                                    || this.$scope.fullMarket.gameType == common.enums.GameType.DragonTiger) {
                                    r.winnerString = this.commonDataService.formatLiveGameResult(r.marketRunner, this.$scope.fullMarket.gameType);
                                }
                                else {
                                    if (r.marketRunner.length > 0) {
                                        r.splt = r.marketRunner[0].runner.name.split(' ');
                                    } else { r.splt = ['T', 'T']; }
                                }
                            });
                        }
                    }
                });
        }

        public subscribeOdds(): void {
            var mids: any[] = [];
            if (this.$scope.fullMarket.id) {
                mids.push(this.$scope.fullMarket.id);
            }

            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });
        }

        private setGameString(gs: any): void {
            var gameString = JSON.parse(gs);
            if (this.$scope.fullMarket.gameType == common.enums.GameType.AndarBahar) {
                if (JSON.stringify(this.$scope.fullMarket.gameString) != JSON.stringify(gameString)) {
                    this.$timeout(() => {
                        jQuery('.card-scroll').each((i, e: any) => {
                            jQuery(e).scrollLeft(1000);
                        });
                    }, this.$scope.fullMarket.gameString == undefined ? 2000 : 800);
                }
                if (gameString.length > 2) {
                    this.$scope.fullMarket.dealtCardCount = gameString[1].cards.length + gameString[2].cards.length;
                }
            }
            else if (gameString && gameString.length > 0 && gameString[0].cards && gameString[0].cards.length > 0) {
                if (this.$scope.fullMarket.gameType == common.enums.GameType.Up7Down) {
                    this.$scope.fullMarket.winnerCardNumber = gameString[0].cards[0].match(/\d/g).join('');
                }
            }
            this.$scope.fullMarket.gameString = gameString;
        }

        private setMarketOdds(responseData: any[]): void {
            if (responseData.length > 0) {
                responseData.forEach((data: any) => {
                    if (this.$scope.fullMarket && this.$scope.fullMarket.id == data.id && this.$scope.fullMarket.marketStatus != common.enums.MarketStatus.CLOSED) {
                        this.setOddsInMarket(this.$scope.fullMarket, data);
                        if (data.gs && data.gs.length > 0) {
                            this.setGameString(data.gs);
                        }
                        if (this.$scope.fullMarket.marketStatus == common.enums.MarketStatus.CLOSED) {
                            if (this.$scope.fullMarket.gameType == common.enums.GameType.Up7Down
                                || this.$scope.fullMarket.gameType == common.enums.GameType.Patti2
                                || this.$scope.fullMarket.gameType == common.enums.GameType.Patti3
                                || this.$scope.fullMarket.gameType == common.enums.GameType.Card32
                                || this.$scope.fullMarket.gameType == common.enums.GameType.ClashOfKings
                                || this.$scope.fullMarket.gameType == common.enums.GameType.PokerT20
                                || this.$scope.fullMarket.gameType == common.enums.GameType.DragonTiger) {
                                this.commonDataService.setWinnerBySection(this.$scope.fullMarket);
                            }
                            this.$timeout(() => { this.getNextMarket(this.$scope.fullMarket.id); }, 5000);
                        }
                    }
                });
            } else {
                this.$timeout(() => { this.getNextMarket(0); }, 5000);
            }
        }

        // Place bet

        public placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string, sectionId: any, percentage: any = 100): void {
            if (this.$scope.fullMarket.marketStatus == common.enums.MarketStatus.OPEN) {
                var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage);
               
                model.model.sectionId = sectionId;
              
                if (this.$scope.fullMarket.gameType == common.enums.GameType.Card32 || this.$scope.fullMarket.gameType == common.enums.GameType.ClashOfKings) {
                    model.model.inlineBetFalse = true;
                }
                super.executeBet(model.model);
            }
        }

        public openBook(marketId: any, showMe: boolean = true): void {
            this.commonDataService.openScorePosition(marketId, showMe);
        }

        private viewCards(item: any): void {
            this.commonDataService.viewCards(item);
        }

        // matka special
        private matkaColSelectionChanged(runnerIndex: any, g: any, all: boolean = false): void {
            if (all) {
                (this.$scope.fullMarket.marketRunner[runnerIndex].metadata.Sections.filter((m: any) => { return m.group == g.group; }) || []).forEach((m: any) => { m.isSelected = g.colSelected; });
            }
        }

        private matkaRowSelectionChanged(runnerIndex: any, r: any, all: boolean = false): void {
            if (all) {
                (this.$scope.fullMarket.marketRunner[runnerIndex].metadata.Sections.filter((m: any) => { return m.row == r.row; }) || []).forEach((m: any) => { m.isSelected = r.rowSelected; });
            }
        }

        private matkaAllSectionChanged(runnerIndex: any, selectionstatus: boolean): void {
            this.$scope.fullMarket.marketRunner[runnerIndex].metadata.Sections.forEach((m: any) => { m.isSelected = selectionstatus; m.rowSelected = selectionstatus; m.colSelected = selectionstatus; });
        }
    }
    angular.module('intranet.home').controller('liveGamesMarketCtrl', LiveGamesMarketCtrl);
}