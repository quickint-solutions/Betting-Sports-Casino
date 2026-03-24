module intranet.mobile {

    export interface IMobileLiveGamesMarketScope extends intranet.common.IBetScopeBase {
        timer_nextmarket: any;

        fullMarket: any;

        placeBetData: any;
        currentInlineBet: any;

        selectedTopTab: any;
        parent: any;

        //open bets
        openBets: any[];
        countBets: any;
        hasUnmatched: boolean;
        hasMatched: boolean;
        compareBetSize: any;
        editTracker: any[]
        timer_openbet: any;
        resultsList: any[];

        openbet_loader: any;
        spinnerImg: any;
        cardImagePath: string;
        themeImagePath: string;

        iframeHeight: any;

        otherGames: any[];
        webImagePath: any;
    }

    export class MobileLiveGamesMarketCtrl extends intranet.common.BetControllerBase<IMobileLiveGamesMarketScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileLiveGamesMarketScope,
            private $stateParams: any,
            public $rootScope: any,
            private $state: any,
            public $compile: any,
            private $filter: any,
            public WSSocketService: any,
            private marketService: services.MarketService,
            private commentaryService: services.CommentaryService,
            private marketOddsService: services.MarketOddsService,
            public placeBetDataService: common.services.PlaceBetDataService,
            public $timeout: ng.ITimeoutService,
            public localStorageHelper: common.helpers.LocalStorageHelper,
            public toasterService: intranet.common.services.ToasterService,
            public commonDataService: common.services.CommonDataService,
            private localCacheHelper: common.helpers.LocalCacheHelper,
            public modalService: common.services.ModalService,
            private exposureService: services.ExposureService,
            private eventService: services.EventService,
            private promiseTracker: any,
            public settings: common.IBaseSettings,
            public betService: services.BetService) {
            super($scope);

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
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
                wsListner();
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

        public loadInitialData() {
            this.getFullmarket();
            this.getOtherGames();
        }

        private handleEventChange(eventid: any, bfEventId: any, eventType: any): void {
            var data = { eventId: eventid, bfEventId: bfEventId, eventType: eventType };
            this.$scope.$emit('event-changed', data);
        }


        // get main market data
        public getFullmarket(): void {
            var promise: any;
            promise = this.marketOddsService.getGameByEventId(this.$stateParams.eventid);
            this.commonDataService.addMobilePromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success && response.data.event) {
                    this.$scope.fullMarket = response.data;
                    this.handleEventChange(this.$scope.fullMarket.eventId, this.$scope.fullMarket.event.sourceId, this.$scope.fullMarket.eventType.id);

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

                    this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                    if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                        this.$scope.parent.ctrl.loadVideo(true);
                        this.getOpenBets();
                    }
                    else if (this.settings.ThemeName == 'dimd') { this.getOpenBets();}
                    this.getRecentResults();
                }
            }).finally(() => { this.subscribeOdds(); this.calculatePPL(); });
        }

        private getOtherGames(): void {
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                if (value.length > 0) {
                    angular.forEach(value, (v: any) => {
                        if (v.id == this.settings.LiveGamesId) {
                            var promise = this.eventService.searchGames(this.settings.LiveGamesId);
                            this.commonDataService.addMobilePromise(promise);
                            promise.success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    this.$scope.otherGames = response.data.filter((a: any) => { return a.id != this.$stateParams.eventid; });
                                    angular.forEach(this.$scope.otherGames, (g: any) => {
                                        g.cls = 'nosource';
                                        if (g.sourceId) g.cls = g.sourceId;
                                        g.imagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/' + g.name.replaceAll(' ', '-').replace('(', '').replace(')', '') + '.jpg';
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        private getNextMarket(lastMarketId: any): void {
            this.$timeout.cancel(this.$scope.timer_openbet);
            this.$timeout.cancel(this.$scope.timer_nextmarket);

            var currentMarketId = lastMarketId;
            this.marketOddsService.getGameByEventId(this.$stateParams.eventid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data && response.data.id) {
                        if (response.data.id != currentMarketId) {
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
            if (this.$scope.fullMarket && this.$scope.fullMarket.id) {
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
                                || this.$scope.fullMarket.gameType == common.enums.GameType.PokerT20
                                || this.$scope.fullMarket.gameType == common.enums.GameType.Patti3
                                || this.$scope.fullMarket.gameType == common.enums.GameType.Card32
                                || this.$scope.fullMarket.gameType == common.enums.GameType.ClashOfKings
                                || this.$scope.fullMarket.gameType == common.enums.GameType.DragonTiger) {
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

        // Place bet
        private placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string, sectionId: any = 0, percentage: any = 100, tdId: number = 0, islast: boolean = false): void {
            if (this.$scope.fullMarket.marketStatus == common.enums.MarketStatus.OPEN) {
                var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage, true);

                if (m.marketRunner.length == tdId && tdId > 0) {
                    this.$scope.inlineElementId = math.multiply(tdId, -1);
                } else {
                    this.$scope.inlineElementId = tdId;
                }
                model.model.sectionId = sectionId;

                if (this.$scope.fullMarket.gameType == common.enums.GameType.AndarBahar
                    || this.$scope.fullMarket.gameType == common.enums.GameType.Up7Down
                    || this.$scope.fullMarket.gameType == common.enums.GameType.DragonTiger) {
                    this.$scope.inlineOnMarketOnly = true;
                    if (islast) { this.$scope.inlineElementId = math.multiply(tdId, -1); }
                }

                super.executeBet(model.model, true);
            }
        }

        public openBook(marketId: any, showMe: boolean = true): void {
            this.commonDataService.openScorePosition(marketId, showMe);
        }

        private viewCards(item: any): void {
            this.commonDataService.viewCards(item);
        }


        // top tab management
        private tabChanged(index: any): void {
            this.$scope.selectedTopTab = index;
        }

        // open bets
        private getOpenBets(): void {
            var promise = this.betService.openBetsEvent(this.$scope.fullMarket.eventId);
            this.$scope.openbet_loader.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                this.$scope.countBets = 0;
                if (response.success && response.data) {
                    this.$scope.openBets = response.data;
                    this.commonDataService.setOpenBets(response.data);
                    this.$rootScope.$broadcast("openbets-updated");

                    this.$scope.hasUnmatched = false;
                    this.$scope.hasMatched = false;
                    
                    this.$scope.openBets.forEach((a: any) => {
                        this.$scope.countBets = this.$scope.countBets + a.bets.length;
                        if (!this.$scope.hasUnmatched) {
                            this.$scope.hasUnmatched = a.bets.some((a: any) => { return a.sizeRemaining > 0 });
                        }
                        if (!this.$scope.hasMatched) {
                            this.$scope.hasMatched = a.bets.some((a: any) => { return a.sizeMatched > 0 });
                        }
                    });
                }
            }).finally(() => {
                //this.checkNewBetSize(); this.getExposure();
            });
        }

        private checkNewBetSize(): void {
            if (this.$scope.timer_openbet) { this.$timeout.cancel(this.$scope.timer_openbet); }
            this.betService.getOpenBetSizeByEvent(this.$scope.fullMarket.eventId)
                .success((response: common.messaging.IResponse<any>) => {
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
                        } else {
                            this.$scope.compareBetSize = {};
                            this.$scope.compareBetSize.sizeMatched = response.data.sizeMatched;
                            this.$scope.compareBetSize.sizeRemaining = response.data.sizeRemaining;
                            this.$scope.compareBetSize.sizeCancelled = response.data.sizeCancelled;
                        }
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed) {
                        this.$scope.timer_openbet = this.$timeout(() => {
                            // this.checkNewBetSize();
                        }, 2000);
                    }
                });
        }

        private getExposure(): void {
            this.exposureService.getExposure()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
        }


        private cancelBet(bet: any): void {
            this.betService.cancelBet(bet.id)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.getOpenBets();
                    }
                    if (response.messages) {
                        this.toasterService.showMessages(response.messages, 3000);
                    }
                });
        }

        private cancelAllBets(): void {
            var ids: any[] = [];
            this.$scope.openBets.forEach((o: any) => {
                var id: any[] = o.bets.filter((a) => { return a.status == 3; }).map((a) => { return a.id; });
                if (id.length > 0) {
                    ids = ids.concat(id);
                }
            });
            if (ids.length > 0) {
                this.modalService.showDeleteConfirmation().then((result: any) => {
                    if (result == common.services.ModalResult.OK) {
                        this.betService.cancelAllBets(ids)
                            .success((response: common.messaging.IResponse<any>) => {
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

        // update bet
        private updateThisBet(detail: any, bet: any): void {
            this.commonDataService.setBetModelForUpdate(detail, bet);
            this.startInlineBet();
            this.tabChanged(0);
        }

        private openInlineToUpdateBet(): void {
            if (this.$stateParams.betid && this.commonDataService.updateBetModel) {
                this.startInlineBet();
            }
        }

        private startInlineBet(): void {
            var market = this.findMarket(this.commonDataService.updateBetModel.marketId);
            if (market.id) {
                super.updateBet(this.commonDataService.updateBetModel);
            }
        }

        private findMarket(marketid: any): any {
            var market = {};
            if (this.$scope.fullMarket.id == marketid) { market = this.$scope.fullMarket; }
            return market;
        }
    }
    angular.module('intranet.mobile').controller('mobileLiveGamesMarketCtrl', MobileLiveGamesMarketCtrl);
}