module intranet.mobile {

    export interface IMobileMarketScope extends intranet.common.IBetScopeBase {
        timer_market_status: any;
        isLMTAvailable: any;
        eventTypeName: any;

        fullMarket: any;
        fancyMarkets: any[];
        otherMarkets: any[];
        selectedTab: any;

        pinnedMarkets: any[];
        placeBetData: any;
        currentInlineBet: any;

        //open bets
        openBets: any[];
        countBets: any;
        hasUnmatched: boolean;
        hasMatched: boolean;
        editTracker: any[];

        selectedTopTab: any;
        parent: any;

        isRequestProcessing: any;
    }

    export class MobileMarketCtrl extends intranet.common.BetControllerBase<IMobileMarketScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileMarketScope,
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
            public modalService: common.services.ModalService,
            public settings: common.IBaseSettings,
            private exposureService: services.ExposureService,
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
                    var data = JSON.parse(response.data);
                    var mr = this.findMarket(data.MarketId);
                    if (mr && mr.id) {
                        this.$rootScope.$emit("balance-changed");
                        this.getOpenBets();
                        this.getExposure();
                    }
                }
            });

            var wsListnerScore = this.$rootScope.$on("ws-score-changed", (event, response) => {
                if (response.success) {
                    if (response.data.scoreSource) {
                        var data = response.data;
                        this.$scope.fullMarket.event.scoreSource = data.scoreSource;
                        if (data.commentary) {
                            this.$scope.fullMarket.commentary = JSON.parse(data.commentary);
                        }
                        if (data.audioConfig) {
                            this.$scope.fullMarket.audioConfig = JSON.parse(data.audioConfig);
                        }
                    }
                    else {
                        angular.forEach(response.data, (data: any) => {
                            if (this.$scope.fullMarket && data.eventId == this.$scope.fullMarket.event.sourceId) {
                                if (data.eventTypeId == this.settings.SoccerBfId) { this.getSoccerScore(data); }
                                else if (data.eventTypeId == this.settings.TennisBfId) { this.getTennisScore(data); }
                                else if (data.eventTypeId == this.settings.CricketBfId) { this.getCricketScore(data); }
                            }
                        });
                    }
                }
            });

            var wsListnerMarketCount = this.$rootScope.$on("ws-marketcount-changed", (event, response) => {
                if (response.success) {
                    var data = JSON.parse(response.data);
                    this.checkNewMarket(data.eventId);
                }
            });

            var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                if (response.success) {
                    this.setMarketOdds(response.data);
                }
            });

            this.$scope.$on('$destroy', () => {
                this.$rootScope.displayOneClick = false;
                this.$timeout.cancel(this.$scope.timer_market_status);
                listenPPL();
                if (this.$scope.currentInlineBet) { this.placeBetDataService.pushPPL(null); }
                place_bet_started();
                place_bet_ended();
                wsListner();
                wsListnerScore();
                wsListnerMarketCount();
                wsListnerMarketOdds();
            });
            super.init(this);
        }

        // bet process related
        private betProcessStarted(marketid: any): void {
            if (this.$scope.fullMarket.id == marketid) {
                this.$scope.fullMarket.betInProcess = true;
            } else {
                this.$scope.otherMarkets.forEach((o: any) => {
                    o.markets.forEach((m: any) => {
                        if (m.id == marketid) { m.betInProcess = true; }
                    });
                });
                this.$scope.fancyMarkets.forEach((o: any) => {
                    if (o.id == marketid) { o.betInProcess = true; }
                });
            }
        }

        private betProcessComplete(marketid: any): void {
            if (this.$scope.fullMarket.id == marketid) {
                this.$scope.fullMarket.betInProcess = false;
            } else {
                this.$scope.otherMarkets.forEach((o: any) => {
                    o.markets.forEach((m: any) => {
                        if (m.id == marketid) { m.betInProcess = false; }
                    });
                });
                this.$scope.fancyMarkets.forEach((o: any) => {
                    if (o.id == marketid) { o.betInProcess = false; }
                });
            }
        }

        private calculatePPL(singlemarket: boolean = true): void {
            this.$scope.placeBetData = this.placeBetDataService.getPPLdata();
            if (this.$scope.placeBetData && this.$scope.placeBetData.bets && this.$scope.placeBetData.bets.length > 0) {
                if (singlemarket && this.$scope.fullMarket) {
                    var bets = this.$scope.placeBetData.bets.filter((b: any) => { return b.marketId == this.$scope.fullMarket.id; });
                    intranet.common.helpers.PotentialPLCalc.calcPL(this.$scope.fullMarket, bets);
                }
                else {
                    if (this.$scope.otherMarkets) {
                        this.$scope.otherMarkets.forEach((om: any) => {
                            om.markets.forEach((m: any) => {
                                var bets = this.$scope.placeBetData.bets.filter((b: any) => { return b.marketId == m.id; });
                                intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                            });
                        });
                    }
                    if (this.$scope.fancyMarkets) {
                        this.$scope.fancyMarkets.forEach((m: any) => {
                            var bets = this.$scope.placeBetData.bets.filter((b: any) => { return b.marketId == m.id; });
                            intranet.common.helpers.PotentialPLCalc.calcPL(m, bets);
                        });
                    }
                }
            } else {
                if (this.$scope.fullMarket) { this.$scope.fullMarket.marketRunner.forEach((mr: any) => { mr.pPL = 0; }); }

                if (this.$scope.otherMarkets) {
                    this.$scope.otherMarkets.forEach((om: any) => {
                        om.markets.forEach((m: any) => {
                            m.marketRunner.forEach((mr: any) => { mr.pPL = 0; });
                        });
                    });
                }
                if (this.$scope.fancyMarkets) {
                    this.$scope.fancyMarkets.forEach((m: any) => {
                        m.marketRunner.forEach((mr: any) => { mr.pPL = 0; });
                    });
                }
            }
        }

        public initScopeValues() {
            this.$scope.otherMarkets = [];
            this.$scope.fancyMarkets = [];
            this.$scope.pinnedMarkets = [];
            this.$scope.selectedTab = -1;
            this.$rootScope.displayOneClick = true;
            this.$scope.editTracker = [];
            this.$scope.countBets = 0;
            this.$scope.parent = this.$scope.$parent;
            this.$scope.isLMTAvailable = this.settings.IsLMTAvailable;
        }

        public loadInitialData() {
            this.getFullmarket();
            this.loadPinnedMarkets();
        }

        private handleEventChange(eventid: any, bfEventId: any, eventType: any, scoreSourceId: any): void {
            var data = { eventId: eventid, bfEventId: bfEventId, eventType: eventType, scoreSourceId: scoreSourceId };
            this.$scope.$emit('event-changed', data);
        }


        // pin/unpin market
        private loadPinnedMarkets(): void {
            var pinned = this.localStorageHelper.get(this.settings.MultiMarketPin);
            if (pinned) {
                this.$scope.pinnedMarkets = pinned;
            }
        }

        private isMarketPinned(marketid: any): any {
            return this.$scope.pinnedMarkets.some((m: any) => { return m == marketid; });
        }

        private pinMe(market: any): void {
            market.pin = !market.pin;
            if (market.pin) {
                this.localStorageHelper.setInArray(this.settings.MultiMarketPin, market.id);
                this.$scope.pinnedMarkets.push(market.id);
            }
            else {
                this.localStorageHelper.removeFromArray(this.settings.MultiMarketPin, market.id);
                var index = this.$scope.pinnedMarkets.indexOf(market.id);
                if (index > -1) { this.$scope.pinnedMarkets.splice(index, 1); }
            }
        }


        // get main market data
        public getFullmarket(): void {
            this.$scope.isRequestProcessing = true;
            var promise;
            if (this.$stateParams.eventid) {
                promise = this.marketOddsService.getFullMarketByEventId(this.$stateParams.eventid);
            } else {
                promise = this.marketOddsService.getFullMarketById(this.$stateParams.marketid);
            }

            this.commonDataService.addMobilePromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                this.$scope.fullMarket = response.data;
                if (this.$scope.fullMarket.event) {
                    this.handleEventChange(this.$scope.fullMarket.eventId, this.$scope.fullMarket.event.sourceId, this.$scope.fullMarket.eventType.id, this.$scope.fullMarket.event.scoreSourceId);
                    this.$scope.fullMarket.betInProcess = this.commonDataService.BetInProcess(this.$scope.fullMarket.id);
                    this.$scope.fullMarket.pin = this.isMarketPinned(this.$scope.fullMarket.id);

                    if (this.$scope.fullMarket.event.scoreSource != common.enums.ScoreSource.AANS)
                        this.readScoreFromBF();

                    this.$scope.eventTypeName = this.commonDataService.getEventTypeName(this.$scope.fullMarket.eventType.id);


                    // load other markets
                    this.getOtherMarkets(this.$scope.fullMarket.eventId, this.$scope.fullMarket.id);
                }
            }).finally(() => {
                this.subscribeOdds(); this.calculatePPL();
                if (this.settings.ThemeName == 'dimd' || this.settings.ThemeName == 'sports' || this.settings.ThemeName == 'dimd2') {
                    this.getOpenBets();
                    this.getExposure();
                    this.tabChanged(this.$scope.isLMTAvailable ? 0 : (this.$scope.fullMarket.inPlay ? 2 : 0));
                }
            });
        }



        // Other Markets
        private getTabName(group: any): any {
            var name = common.enums.MarketGroup[group];
            return name.replace('_', ' ');
        }

        private getOtherMarkets(eventid: any, marketid: any): void {
            this.marketOddsService.getOtherMarketsById(eventid, marketid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.otherMarkets = response.data;
                        if (this.$scope.otherMarkets.length > 0) {
                            this.$scope.otherMarkets.forEach((o: any) => {
                                o.markets.forEach((m: any) => {
                                    if (this.commonDataService.BetInProcess(m.id)) { m.betInProcess = true; }
                                });
                            });

                            var sessionsIndex = common.helpers.Utility.IndexOfObject(this.$scope.otherMarkets, 'group', common.enums.MarketGroup.Fancy);
                            if (sessionsIndex > -1) {
                                this.$scope.fancyMarkets = this.$scope.otherMarkets[sessionsIndex].markets;
                                this.$scope.otherMarkets.splice(sessionsIndex, 1);
                            } else { this.$scope.fancyMarkets.splice(0); }

                            angular.forEach(this.$scope.fancyMarkets, (f: any) => { super.setSessionPrice(f); });

                            // extract popular matchodds markets
                            var popularIndex = common.helpers.Utility.IndexOfObject(this.$scope.otherMarkets, 'group', common.enums.MarketGroup.Popular);
                            if (popularIndex > -1) {
                                var mIndex: any[] = [];
                                angular.forEach(this.$scope.otherMarkets[popularIndex].markets, (pm: any, index: any) => {
                                    if (pm.bettingType == common.enums.BettingType.ODDS || pm.bettingType == common.enums.BettingType.BM) {
                                        this.$scope.fancyMarkets.push(pm);
                                        mIndex.push(index);
                                    }
                                });
                                angular.forEach(mIndex.reverse(), (m: any) => {
                                    this.$scope.otherMarkets[popularIndex].markets.splice(m, 1);
                                });
                                if (this.$scope.otherMarkets[popularIndex].markets.length <= 0) { this.$scope.otherMarkets.splice(popularIndex, 1); }
                            }
                        }
                    }
                }).finally(() => {
                    this.subscribeOdds(); this.calculatePPL();
                    this.$scope.isRequestProcessing = false;
                });
        }

        private selectedTabChanged(index: number): void {
            if (this.$scope.selectedTab == index) {
                this.$scope.selectedTab = -1;
            }
            else {
                this.$scope.selectedTab = index;
            }
            this.subscribeOdds();
        }

        public subscribeOdds(): void {
            var mids: any[] = [];

            if (this.$scope.fullMarket && this.$scope.fullMarket.id) {
                mids.push(this.$scope.fullMarket.id);
            }
            if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                this.$scope.otherMarkets[this.$scope.selectedTab].markets.forEach((m: any) => {
                    if (m.marketStatus != common.enums.MarketStatus.CLOSED && m.temporaryStatus != common.enums.TemporaryStatus.SUSPEND) {
                        mids.push(m.id);
                    }
                });
            }
            if (this.$scope.fancyMarkets.length > 0) {
                this.$scope.fancyMarkets.forEach((f: any) => {
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
            responseData.forEach((data: any) => {
                if (this.$scope.fullMarket && this.$scope.fullMarket.id == data.id) {
                    this.setOddsInMarket(this.$scope.fullMarket, data);
                    if (this.$scope.fullMarket.prepareRadarView) { this.$scope.fullMarket.prepareRadarView(); }
                }
                if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab > -1) {
                    this.$scope.otherMarkets[this.$scope.selectedTab].markets.forEach((m: any) => {
                        if (m.id == data.id) {
                            this.setOddsInMarket(m, data);
                        }
                    });
                }
                if (this.$scope.fancyMarkets.length > 0) {
                    this.$scope.fancyMarkets.forEach((f: any) => {
                        if (f.id == data.id) {
                            this.setOddsInMarket(f, data);
                            if (f.prepareRadarView) { f.prepareRadarView(); }
                        }
                    });
                }
            });
        }

        // get score from betfair
        private readScoreFromBF(): void {
            if (this.$scope.fullMarket.inPlay) {
                this.commonDataService.getEventTypes().then(() => {
                    var bfEventType = this.commonDataService.getBFEventTypeId(this.$scope.fullMarket.eventType.id);
                    if (bfEventType == this.settings.SoccerBfId
                        || bfEventType == this.settings.TennisBfId
                        || bfEventType == this.settings.CricketBfId) {
                        this.$timeout(() => { this.checkScoreSource(); }, 1000);
                    }
                });
            }
        }

        private checkScoreSource(): void {
            this.commentaryService.getCommentary(this.$scope.fullMarket.eventId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.fullMarket.event.scoreSource = response.data.scoreSource;
                        if (response.data.scoreSource == common.enums.ScoreSource.Betfair) {
                            this.WSSocketService.sendMessage({
                                Scid: [this.$scope.fullMarket.event.sourceId], MessageType: common.enums.WSMessageType.Score
                            });
                        } else {
                            if (response.data.commentary) { this.$scope.fullMarket.commentary = JSON.parse(response.data.commentary) };
                        }
                    }
                });
        }

        private getSoccerScore(response: any): void {
            if (response) {
                var score = response;
                if (!!score.updateDetails) {
                    this.$scope.fullMarket.score = score;
                    this.$scope.fullMarket.isSoccer = true;

                    this.$scope.fullMarket.score.firstHalf = {};
                    this.$scope.fullMarket.score.secondHalf = {};

                    this.$scope.fullMarket.score.firstHalf.detail = [];
                    this.$scope.fullMarket.score.secondHalf.detail = [];

                    this.$scope.fullMarket.score.firstHalf.divideBy = (100 / 45);
                    this.$scope.fullMarket.score.secondHalf.divideBy = (100 / 45);

                    var isFirst = true; var isSecond = false;
                    this.$scope.fullMarket.score.updateDetails.forEach((u: any) => {
                        if (isFirst) {
                            this.$scope.fullMarket.score.firstHalf.timeElapsed = this.$scope.fullMarket.score.timeElapsed;
                            this.$scope.fullMarket.score.firstHalf.detail.push(u);
                            if (u.type == 'SecondHalfKickOff') {
                                this.$scope.fullMarket.score.firstHalf.timeElapsed = u.matchTime;
                                this.$scope.fullMarket.score.firstHalf.divideBy = (100 / u.matchTime);
                                isFirst = false;
                                isSecond = true
                            }
                        }
                        else if (isSecond) {
                            u.left = u.matchTime - 45;
                            this.$scope.fullMarket.score.secondHalf.timeElapsed = this.$scope.fullMarket.score.timeElapsed - 45;
                            this.$scope.fullMarket.score.secondHalf.detail.push(u);
                            if (u.elapsedAddedTime) {
                                this.$scope.fullMarket.score.secondHalf.timeElapsed = u.left;
                                this.$scope.fullMarket.score.secondHalf.divideBy = (100 / (this.$scope.fullMarket.score.secondHalf.timeElapsed));
                            }
                        }
                    });
                }
            }
        }

        private getTennisScore(score: any): void {
            if (score) {
                this.$scope.fullMarket.score = score;
                this.$scope.fullMarket.isTennis = true;
            }
        }

        private getCricketScore(cricket: any): void {
            var commentary: any = {};
            if (cricket) {

                if (cricket.score.home.name != 'HOME') { commentary.homeTeam = cricket.score.home.name; } else {
                    commentary.homeTeam = this.$scope.fullMarket.marketRunner[0].runner.name;
                    //if (this.$scope.fullMarket.commentary) { commentary.homeTeam = this.$scope.fullMarket.commentary.homeTeam; }
                }
                if (cricket.score.away.name != 'AWAY') { commentary.awayTeam = cricket.score.away.name; } else {
                    commentary.awayTeam = this.$scope.fullMarket.marketRunner[1].runner.name;
                    //if (this.$scope.fullMarket.commentary) { commentary.awayTeam = this.$scope.fullMarket.commentary.awayTeam; }
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

                this.$scope.fullMarket.commentary = commentary;
            }
        }

        private openBFChart(market: any, r: any): void {
            var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
            this.commonDataService.openBFChart(ids);
        }

        // top tab management
        private tabChanged(index: any): void {
            if (this.settings.ThemeName == 'sports') {
                if (this.$scope.selectedTopTab == index) {
                    this.$scope.selectedTopTab = -1;
                }
                else { this.$scope.selectedTopTab = index; }
            } else {
                this.$scope.selectedTopTab = index;
                if (index == 2 || index == 5 || index == 6) {
                    if (index == 2) this.$scope.selectedTopTab = 5;
                    this.$scope.parent.ctrl.getVideoOptions();
                }
            }
        }

        // Place bet
        private placeBet(m: any, side: any, runnerId: any, price: any, runnerName: string, percentage: any = 100, tdId: number = 0, trId: number = 0): void {
            var model = new common.helpers.BetModal(m, side, runnerId, price, runnerName, false, '', percentage, true);

            if (m.marketRunner.length == tdId && tdId > 0) {
                this.$scope.inlineElementId = math.multiply(tdId, -1);
            } else {
                this.$scope.inlineElementId = tdId;
            }
            this.$scope.inlineTRElementId = 0;
            if (trId != 0) {
                this.$scope.inlineTRElementId = trId;
            }

            super.executeBet(model.model, true);
        }

        private modalPlaceBet(h: any, side: any, runnerId: any, price: any, runnerName: string, percentage: any = 100): void {
            var model = new common.helpers.BetModal(h, side, runnerId, price, runnerName, false, '', percentage);
            this.$scope.stopPPL = true;
            this.$scope.inlineOnMarketOnly = true;
            super.executeBet(model.model, false, true);
        }

        public openBook(marketId: any, showMe: boolean = true): void {
            this.commonDataService.openScorePosition(marketId, showMe);
        }


        // check markets status
        public checkAllMarketStatus(): void {
            if (this.$scope.timer_market_status) { this.$timeout.cancel(this.$scope.timer_market_status); }

            // redirect to home if market closed
            if (this.$scope.fullMarket) {
                this.isSingleMarketClosed(this.$scope.fullMarket, this.$state);
            }

            // change selected tab from other market
            if (this.$scope.otherMarkets.length > 0 && this.$scope.selectedTab >= 0) {
                var removeTab = this.isMultiMarketClosed(this.$scope.otherMarkets[this.$scope.selectedTab].markets);
                if (removeTab) {
                    this.$scope.otherMarkets.splice(this.$scope.selectedTab, 1);
                    if (this.$scope.otherMarkets.length > 0) {
                        this.$scope.selectedTab = 0;
                    }
                }
            }

            // check fancy market status
            if (this.$scope.fancyMarkets.length > 0) {
                this.isMultiMarketClosed(this.$scope.fancyMarkets);
            }

            // check that any new market added
            //this.checkNewMarket();

            if (!this.$scope.$$destroyed) {
                this.$scope.timer_market_status = this.$timeout(() => {
                    this.checkAllMarketStatus();
                }, 20000);
            }
        }

        private getNewlyAddedMarkets(marketIds: any[]) {
            this.marketOddsService.getMultiMarkets(marketIds)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response && response.success) {
                        if (response.data.length > 0) {
                            angular.forEach(response.data, (m: any) => {
                                m.newitem = true;
                                if (m.group == common.enums.MarketGroup.Fancy) {
                                    this.$scope.fancyMarkets.forEach((x: any) => { if (marketIds.indexOf(x.id) < 0) x.newitem = false; });
                                    if (common.helpers.Utility.IndexOfObject(this.$scope.fancyMarkets, 'id', m.id) < 0)
                                        this.$scope.fancyMarkets.push(m);
                                }
                                else {
                                    var isFound = false;
                                    this.$scope.otherMarkets.forEach((om: any) => {
                                        if (om.group == m.group) {
                                            isFound = true;
                                            if (common.helpers.Utility.IndexOfObject(om.markets, 'id', m.id) < 0)
                                                om.markets.push(m);
                                        }
                                    });
                                    if (!isFound) {
                                        this.$scope.otherMarkets.push({ group: m.group, markets: [m] });
                                    }
                                }
                            });
                        }
                    }
                }).finally(() => { this.subscribeOdds(); });
        }

        public checkNewMarket(eventId: any): void {
            if (this.$scope.fullMarket) {
                if (eventId == this.$scope.fullMarket.eventId) {
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

                                            if (this.$scope.fullMarket.id == newid) { isFound = true; }
                                            if (!isFound) {
                                                this.$scope.fancyMarkets.forEach((m: any) => {
                                                    if (m.id == newid) {
                                                        isFound = true;
                                                        m.marketStatus = ms.marketStatus;
                                                        m.temporaryStatus = ms.temporaryStatus;
                                                    }
                                                });
                                            }
                                            if (!isFound) {
                                                this.$scope.otherMarkets.forEach((om: any) => {
                                                    om.markets.forEach((m: any) => {
                                                        if (m.id == newid) {
                                                            isFound = true;
                                                            m.marketStatus = ms.marketStatus;
                                                            m.temporaryStatus = ms.temporaryStatus;
                                                        }
                                                    });
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
        }

        // Open Bets
        private getOpenBets(): void {
            var promise = this.betService.openBetsEvent(this.$scope.fullMarket.eventId);
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
            })
        }

        private isInEdit(b: any): void {
            var index = common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', b.id);
            if (index > -1) {
                b.edit = true;
                b.newPrice = this.$scope.editTracker[index].price;
            }
            else {
                b.newPrice = b.price;
                b.edit = false;
            }
        }

        private updateBetNow(bet: any): void {
            var model = { betId: bet.id, price: bet.newPrice, marketName: bet.marketName, runnerName: bet.runnerName };
            var promise = this.betService.updateBet(model);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    bet.edit = false;
                    var index = common.helpers.Utility.IndexOfObject(this.$scope.editTracker, 'id', bet.id);
                    if (index > -1) { this.$scope.editTracker.splice(index, 1); }
                    if (response.data) {
                        var r = response.data;
                        if (r.orderStatus) {
                            if (r.sizeRemaining > 0) {
                                var matched = this.$filter('toRate')(r.sizeMatched);
                                var remaining = this.$filter('toRate')(r.sizeRemaining);
                                var msg = this.$filter('translate')('bet.unmatched.message');
                                msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), r.bet.runnerName, matched, r.avgPrice, remaining, r.bet.price);
                                this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg, 5000);
                            }
                            else {
                                var matched = this.$filter('toRate')(r.sizeMatched);
                                var placed = this.$filter('toRate')(r.bet.size);
                                var msg = this.$filter('translate')('bet.matched.message');
                                msg = msg.format((r.bet.side == 1 ? 'BACK' : 'LAY'), r.bet.runnerName, placed, r.bet.price, matched, r.avgPrice);
                                this.toasterService.showToastMessage(common.helpers.ToastType.Success, msg, 5000);
                            }
                        }
                        else {
                            var msg = r.message.format(r.bet.marketName, r.bet.runnerName);
                            this.toasterService.showToastMessage(common.helpers.ToastType.Error, msg);
                        }
                    }
                }
                if (response.messages) {
                    this.toasterService.showMessages(response.messages, 3000);
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

        private getExposure(): void {
            this.exposureService.getExposure()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.commonDataService.setUserPL(response.data);
                    }
                });
        }

        private findMarket(marketid: any): any {
            var market = {};
            if (this.$scope.fullMarket.id == marketid) { market = this.$scope.fullMarket; }
            else {
                var isFound = false;
                this.$scope.otherMarkets.forEach((om: any, index: any) => {
                    om.markets.forEach((m: any) => {
                        if (m.id == marketid) { isFound = true; market = m; if (this.$scope.selectedTab != index) { this.selectedTabChanged(index); } }
                    });
                });
                if (!isFound) {
                    this.$scope.fancyMarkets.forEach((m: any) => {
                        if (m.id == marketid) { isFound = true; market = m; }
                    });
                }
            }
            return market;
        }

        private openBetsModal() {
            var modal = new common.helpers.CreateModal();
            modal.header = 'My Bets';

            modal.data = {
                bets: this.$scope.openBets,
                eventName: this.$scope.fullMarket.event.name
            }

            modal.bodyUrl = this.settings.ThemeName + '/mobile/open-bets-modal.html';
            modal.controller = 'openBetsModalCtrl';
            modal.options.actionButton = '';
            modal.options.closeButton = '';
            modal.options.showFooter = false;
            modal.SetModal();

            this.modalService.showWithOptions(modal.options, modal.modalDefaults);
        }
    }
    angular.module('intranet.mobile').controller('mobileMarketCtrl', MobileMarketCtrl);
}