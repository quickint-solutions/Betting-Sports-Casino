namespace intranet.common {
    export abstract class BetControllerBase<T extends IBetScopeBase> {
        protected $scope: T;
        protected currentController;
        $timeout: any;
        localStorageHelper: any;
        settings: any;
        betService: any;
        commonDataService: any;
        placeBetDataService: any;
        $rootScope: any;
        $compile: any;
        toasterService: any;
        WSSocketService: any;
        modalService: any;

        constructor($scope: T) {
            this.$scope = $scope;
            this.initBase();

            this.$scope.$on('$destroy', () => {
                this.unsubscribeOdds();
            });
        }

        private initBase(): void {
            this.$scope.ctrl = this;
            this.$scope.stopPPL = false;
            this.$scope.inlineOnMarketOnly = false;
            this.$scope.inlineElementId = 0;
        }

        public init(currentInstance: any): void {
            this.currentController = currentInstance;
            if (currentInstance.initScopeValues) {
                currentInstance.initScopeValues();
            }

            if (currentInstance.loadInitialData) {
                currentInstance.loadInitialData();
            }

            if (currentInstance.checkAllMarketStatus) {
                this.$timeout(() => { currentInstance.checkAllMarketStatus(); }, 20000);
            }

            this.WSSocketService.setController(currentInstance);

            this.$scope.isLMTAvailable = this.settings.IsLMTAvailable;
        }

        private validateBet(model: any): boolean {
            if (model.bettingType == common.enums.BettingType.FIXED_ODDS) {
                return model.price != '';
            }
            else return true;
        }

        private invalidOdds(): void {
            this.toasterService.showToast(intranet.common.helpers.ToastType.Info,
                'market.odds.invalid',
                3000);
        }

        public executeBet(model: any, isMobile: boolean = false, inPopup: boolean = false): void {
            if (this.validateBet(model)) {
                this.commonDataService.getUserBetConfig().then((response: any) => {
                    angular.forEach(response, (r: any) => {
                        if (model.eventTypeId == r.eventTypeId) {
                            model.minBet = r.minBet;
                        }
                    });
                    var oneclick = this.localStorageHelper.get(this.settings.OneClickConfig);
                    if (oneclick && math.number(oneclick) > 0 && (model.source == common.enums.EventSource.Betfair || model.bettingType == common.enums.BettingType.FIXED_ODDS)) {
                        if (model.price == '') { this.invalidOdds(); }
                        else {
                            if (model.bettingType == common.enums.BettingType.SCORE_RANGE) {
                                this.placeInlineBet(model);
                            }
                            else {
                                this.$rootScope.$broadcast('place-bet-started', { marketId: model.marketId, eventTypeId: model.eventTypeId, bettingType: model.bettingType, betDelay: model.betDelay });
                                this.removeInlineBet();
                                model.size = math.number(oneclick);
                                model.betFrom = common.enums.BetFrom.OneClick;
                                var promise = this.betService.placeBet(model);
                                this.commonDataService.handleOneClickBetResponse(model, promise);
                            }
                        }
                    }
                    else {
                        if (inPopup) { this.openBetPopup(model); }
                        else if (isMobile) {
                            this.placeInlineBet(model);
                        } else {
                            var stakeconfig = this.localStorageHelper.get(this.settings.StakeConfig);
                            if (stakeconfig && stakeconfig.inlineBet) {
                                this.placeInlineBet(model);
                            } else {
                                this.removeInlineBet();
                                if (stakeconfig && stakeconfig.defaultStake && !isNaN(stakeconfig.defaultStake)) { model.size = math.number(stakeconfig.defaultStake); }
                                this.placeBetDataService.setSharedData(model);
                                this.$rootScope.$emit("bet-placed");
                            }
                        }
                    }
                });
            }
            else {
                this.invalidOdds();
            }
        }

        private openBetPopup(model: any) {
            var modal = new common.helpers.CreateModal();
            modal.header = 'confirm.bet.modal.header';
            modal.data = {};
            modal.data.side = model.side;
            modal.data.price = model.price;
            modal.data.ladderType = model.priceLadderType;
            modal.data.maxValue = model.maxUnitValue;
            modal.data.minValue = model.minUnitValue;
            modal.data.interval = model.interval;
            modal.data.marketId = model.marketId;
            modal.data.runnerId = model.runnerId;
            modal.data.bettingType = model.bettingType;
            modal.data.percentage = model.percentage;
            modal.data.eventName = model.eventName;
            modal.data.marketName = model.marketName;
            modal.data.runnerName = model.runnerName;
            modal.data.eventTypeId = model.eventTypeId;
            modal.data.sectionId = model.sectionId;
            modal.data.canChange = model.canChange;
            modal.data.maxBet = model.maxBet;
            modal.data.minBet = model.minBet;
            modal.data.betDelay = model.betDelay;
            modal.data.temporaryStatus = model.temporaryStatus;
            modal.data.maxProfit = model.maxProfit;
            modal.data.maxLiability = model.maxLiability;

            modal.bodyUrl = 'app/common/components/inline-bet/bet-modal.html';
            modal.controller = 'betModalCtrl';
            modal.options.showFooter = false;
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                }
            });
        }

        private removeInlineBet(): void {
            if (this.$scope.currentInlineBet) {
                this.$scope.currentInlineBet = undefined;
                angular.element(document.getElementById('tr_inlinebet')).remove();
                this.placeBetDataService.pushPPL(null);
                if (!this.$scope.stopPPL) {
                    this.$rootScope.$broadcast("catch-for-ppl");
                }
            }
        }

        private placeInlineBet(model: any): void {
            var existing = false;
            if (this.$scope.currentInlineBet) {
                if (model.marketId == this.$scope.currentInlineBet.marketId
                    && model.runnerId == this.$scope.currentInlineBet.runnerId
                    && (model.side == this.$scope.currentInlineBet.side && (this.$scope.inlineTRElementId == 0 || !this.$scope.inlineTRElementId))
                    && model.sectionId == this.$scope.currentInlineBet.sectionId) {
                    existing = true;
                }
                this.removeInlineBet();
            }
            if (!existing) {
                var scope: any = this.$scope.$new(true);
                scope.side = model.side;
                scope.price = model.price;
                scope.priceLadderType = model.priceLadderType;
                scope.maxUnitValue = model.maxUnitValue;
                scope.minUnitValue = model.minUnitValue;
                scope.interval = model.interval;
                scope.marketId = model.marketId;
                scope.runnerId = model.runnerId;
                scope.bettingType = model.bettingType;
                scope.gameType = model.gameType;
                scope.percentage = model.percentage;
                scope.eventName = model.eventName;
                scope.marketName = model.marketName;
                scope.runnerName = model.runnerName;
                scope.eventTypeId = model.eventTypeId;
                scope.sectionId = model.sectionId;
                scope.canChange = model.canChange;
                scope.maxBet = model.maxBet;
                scope.minBet = model.minBet;
                scope.betDelay = model.betDelay;
                scope.temporaryStatus = model.temporaryStatus;
                scope.maxProfit = model.maxProfit;

                this.$scope.currentInlineBet = { marketId: scope.marketId, runnerId: scope.runnerId, side: scope.side, sectionId: scope.sectionId };
                scope.removeInlineCtrl = () => { this.removeInlineBet(); };

                if (this.$scope.inlineElementId != 0) {
                    var tdId = this.$scope.inlineElementId;
                    if (tdId < 0) { tdId = math.multiply(tdId, -1); }
                    else if (math.mod(tdId, 2) != 0) { tdId = math.add(tdId, 1); }
                    var html = ''
                    if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'dimd' || this.settings.ThemeName == 'sports') {
                        html = '<div ng-class="{\'back-2\':side==1,\'lay-2\':side==2}" id="tr_inlinebet" name="td_' + scope.marketId + '_' + tdId + '"' +
                            '><kt-inline-bet data-min="{{minUnitValue}}"' +
                            'data-max="{{maxUnitValue}}"' +
                            'data-interval="{{interval}}"' +
                            'data-market-id="{{marketId}}"' +
                            'data-runner-id="{{runnerId}}"' +
                            'data-ladder-type="{{priceLadderType}}"' +
                            'data-percentage="{{percentage}}"' +
                            'data-betting-type="{{bettingType}}"' +
                            'data-game-type="{{gameType}}"' +
                            'data-remove-inline-bet="removeInlineCtrl()"' +
                            (model.isMobile ? ' mobile="true" ' : ' ') +
                            'data-event-name="{{eventName}}"' +
                            'data-market-name="{{marketName}}"' +
                            'data-runner-name="{{runnerName}}"' +
                            'data-event-type-id="{{eventTypeId}}"' +
                            'data-section-id="{{sectionId}}"' +
                            'data-can-change="{{canChange}}"' +
                            'data-max-bet="{{maxBet}}"' +
                            'data-min-bet="{{minBet}}"' +
                            'data-bet-delay="{{betDelay}}"' +
                            'data-max-profit="{{maxProfit}}"' +
                            'data-temporary-status="{{temporaryStatus}}"' +
                            'data-price="{{price}}" data-side="{{side}}"></kt-inline-bet></div>';
                    }
                    else {
                        html = '<td id="tr_inlinebet" name="td_' + scope.marketId + '_' + tdId + '"' +
                            'class="td-popup" ng-class="{\'back-2\':side==1,\'lay-2\':side==2}"><kt-inline-bet data-min="{{minUnitValue}}"' +
                            'data-max="{{maxUnitValue}}"' +
                            'data-interval="{{interval}}"' +
                            'data-market-id="{{marketId}}"' +
                            'data-runner-id="{{runnerId}}"' +
                            'data-ladder-type="{{priceLadderType}}"' +
                            'data-percentage="{{percentage}}"' +
                            'data-betting-type="{{bettingType}}"' +
                            'data-game-type="{{gameType}}"' +
                            'data-remove-inline-bet="removeInlineCtrl()"' +
                            (model.isMobile ? ' mobile="true" ' : ' ') +
                            'data-event-name="{{eventName}}"' +
                            'data-market-name="{{marketName}}"' +
                            'data-runner-name="{{runnerName}}"' +
                            'data-event-type-id="{{eventTypeId}}"' +
                            'data-section-id="{{sectionId}}"' +
                            'data-can-change="{{canChange}}"' +
                            'data-max-bet="{{maxBet}}"' +
                            'data-min-bet="{{minBet}}"' +
                            'data-bet-delay="{{betDelay}}"' +
                            'data-max-profit="{{maxProfit}}"' +
                            'data-temporary-status="{{temporaryStatus}}"' +
                            'data-price="{{price}}" data-side="{{side}}"></kt-inline-bet></td>';
                    }
                    angular.element(document.getElementById('td_' + scope.marketId + '_' + tdId)).after(this.$compile(html)(scope));
                }
                else if (this.$scope.inlineTRElementId && this.$scope.inlineTRElementId != 0) {
                    var html = '';
                    if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'dimd' || this.settings.ThemeName == 'sports') {
                        html = '<div ng-class="{\'back-2\':side==1,\'lay-2\':side==2}" id="tr_inlinebet"><kt-inline-bet data-min="{{minUnitValue}}"' +
                            'data-max="{{maxUnitValue}}"' +
                            'data-interval="{{interval}}"' +
                            'data-market-id="{{marketId}}"' +
                            'data-runner-id="{{runnerId}}"' +
                            'data-ladder-type="{{priceLadderType}}"' +
                            'data-percentage="{{percentage}}"' +
                            'data-betting-type="{{bettingType}}"' +
                            'data-game-type="{{gameType}}"' +
                            'data-remove-inline-bet="removeInlineCtrl()"' +
                            (model.isMobile ? ' mobile="true" ' : ' ') +
                            'data-event-name="{{eventName}}"' +
                            'data-market-name="{{marketName}}"' +
                            'data-runner-name="{{runnerName}}"' +
                            'data-event-type-id="{{eventTypeId}}"' +
                            'data-section-id="{{sectionId}}"' +
                            'data-can-change="{{canChange}}"' +
                            'data-max-bet="{{maxBet}}"' +
                            'data-min-bet="{{minBet}}"' +
                            'data-bet-delay="{{betDelay}}"' +
                            'data-max-profit="{{maxProfit}}"' +
                            'data-temporary-status="{{temporaryStatus}}"' +
                            'data-price="{{price}}" data-side="{{side}}"></kt-inline-bet></div>';
                    }
                    else {
                        html = '<tr id="tr_inlinebet"><td colspan="8" class="td-popup" ng-class="{\'back-2\':side==1,\'lay-2\':side==2}"><kt-inline-bet data-min="{{minUnitValue}}"' +
                            'data-max="{{maxUnitValue}}"' +
                            'data-interval="{{interval}}"' +
                            'data-market-id="{{marketId}}"' +
                            'data-runner-id="{{runnerId}}"' +
                            'data-ladder-type="{{priceLadderType}}"' +
                            'data-percentage="{{percentage}}"' +
                            'data-betting-type="{{bettingType}}"' +
                            'data-game-type="{{gameType}}"' +
                            'data-remove-inline-bet="removeInlineCtrl()"' +
                            (model.isMobile ? ' mobile="true" ' : ' ') +
                            'data-event-name="{{eventName}}"' +
                            'data-market-name="{{marketName}}"' +
                            'data-runner-name="{{runnerName}}"' +
                            'data-event-type-id="{{eventTypeId}}"' +
                            'data-section-id="{{sectionId}}"' +
                            'data-can-change="{{canChange}}"' +
                            'data-max-bet="{{maxBet}}"' +
                            'data-min-bet="{{minBet}}"' +
                            'data-bet-delay="{{betDelay}}"' +
                            'data-max-profit="{{maxProfit}}"' +
                            'data-temporary-status="{{temporaryStatus}}"' +
                            'data-price="{{price}}" data-side="{{side}}"></kt-inline-bet></td></tr>';
                    }
                    angular.element(document.getElementById('tr_' + scope.marketId + '_' + this.$scope.inlineTRElementId)).after(this.$compile(html)(scope));
                }
                else {
                    var html = '';
                    if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'dimd' || this.settings.ThemeName == 'sports') {
                        html = '<div ng-class="{\'back-2\':side==1,\'lay-2\':side==2}" id="tr_inlinebet"><kt-inline-bet data-min="{{minUnitValue}}"' +
                            'data-max="{{maxUnitValue}}"' +
                            'data-interval="{{interval}}"' +
                            'data-market-id="{{marketId}}"' +
                            'data-runner-id="{{runnerId}}"' +
                            'data-ladder-type="{{priceLadderType}}"' +
                            'data-percentage="{{percentage}}"' +
                            'data-betting-type="{{bettingType}}"' +
                            'data-game-type="{{gameType}}"' +
                            'data-remove-inline-bet="removeInlineCtrl()"' +
                            (model.isMobile ? ' mobile="true" ' : ' ') +
                            'data-event-name="{{eventName}}"' +
                            'data-market-name="{{marketName}}"' +
                            'data-runner-name="{{runnerName}}"' +
                            'data-event-type-id="{{eventTypeId}}"' +
                            'data-section-id="{{sectionId}}"' +
                            'data-can-change="{{canChange}}"' +
                            'data-max-bet="{{maxBet}}"' +
                            'data-min-bet="{{minBet}}"' +
                            'data-bet-delay="{{betDelay}}"' +
                            'data-max-profit="{{maxProfit}}"' +
                            'data-temporary-status="{{temporaryStatus}}"' +
                            'data-price="{{price}}" data-side="{{side}}"></kt-inline-bet></div>';
                    }
                    else {
                        html = '<tr id="tr_inlinebet"><td colspan="8" class="td-popup" ng-class="{\'back-2\':side==1,\'lay-2\':side==2}"><kt-inline-bet data-min="{{minUnitValue}}"' +
                            'data-max="{{maxUnitValue}}"' +
                            'data-interval="{{interval}}"' +
                            'data-market-id="{{marketId}}"' +
                            'data-runner-id="{{runnerId}}"' +
                            'data-ladder-type="{{priceLadderType}}"' +
                            'data-percentage="{{percentage}}"' +
                            'data-betting-type="{{bettingType}}"' +
                            'data-game-type="{{gameType}}"' +
                            'data-remove-inline-bet="removeInlineCtrl()"' +
                            (model.isMobile ? ' mobile="true" ' : ' ') +
                            'data-event-name="{{eventName}}"' +
                            'data-market-name="{{marketName}}"' +
                            'data-runner-name="{{runnerName}}"' +
                            'data-event-type-id="{{eventTypeId}}"' +
                            'data-section-id="{{sectionId}}"' +
                            'data-can-change="{{canChange}}"' +
                            'data-max-bet="{{maxBet}}"' +
                            'data-min-bet="{{minBet}}"' +
                            'data-bet-delay="{{betDelay}}"' +
                            'data-max-profit="{{maxProfit}}"' +
                            'data-temporary-status="{{temporaryStatus}}"' +
                            'data-price="{{price}}" data-side="{{side}}"></kt-inline-bet></td></tr>';
                    }

                    if (this.$scope.inlineOnMarketOnly) {
                        angular.element(document.getElementById('tr_' + scope.marketId)).after(this.$compile(html)(scope));
                    }
                    else {
                        angular.element(document.getElementById('tr_' + scope.marketId + '_' + scope.runnerId)).after(this.$compile(html)(scope));
                    }
                }
                // clear all bet slip data
                this.placeBetDataService.clearSharedData();
                this.$rootScope.$emit("bet-placed");
            }
        }

        public isSingleMarketClosed(market: any, state: any): void {
            if (market.marketStatus == common.enums.MarketStatus.CLOSED) {
                if (this.settings.IsFaaS) {
                    this.$timeout(() => { state.go('fs'); }, 2000);
                }
                else {
                    this.$timeout(() => {
                        if (this.commonDataService.isMobile.any) {
                            if (this.settings.ThemeName == 'bking' || this.settings.ThemeName == 'lotus') {
                                state.go('mobile.seven.base.home');
                            }
                            else {
                                state.go('mobile.base.home');
                            }
                        } else {
                            state.go('base.home');
                        }
                    }, 2000);
                }
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

        protected updateBet(model: any): void {
            this.removeInlineBet();

            var scope: any = this.$scope.$new(true);
            scope.side = model.side;
            scope.betSize = model.size;
            scope.price = model.price;
            scope.priceLadderType = model.priceLadderType;
            scope.maxUnitValue = model.maxUnitValue;
            scope.minUnitValue = model.minUnitValue;
            scope.interval = model.interval;
            scope.marketId = model.marketId;
            scope.runnerId = model.runnerId;
            scope.bettingType = model.bettingType;
            scope.gameType = model.gameType;
            scope.percentage = model.percentage;
            scope.eventName = model.eventName;
            scope.marketName = model.marketName;
            scope.runnerName = model.runnerName;
            scope.eventTypeId = model.eventTypeId;
            scope.betId = model.betId;
            scope.maxProfit = model.maxProfit;

            this.$scope.currentInlineBet = { marketId: scope.marketId, runnerId: scope.runnerId, side: scope.side };
            scope.removeInlineCtrl = () => { this.removeInlineBet(); };

            if (this.$scope.inlineElementId != 0) {
                var tdId = this.$scope.inlineElementId;
                if (tdId < 0) { tdId = math.multiply(tdId, -1); }
                else if (math.mod(tdId, 2) != 0) { tdId = math.add(tdId, 1); }

                var html = '<td id="tr_inlinebet" class="td-popup" ng-class="{\'back-1\':side==1,\'lay-1\':side==2}"><kt-inline-bet data-min="{{minUnitValue}}"' +
                    'data-max="{{maxUnitValue}}"' +
                    'data-interval="{{interval}}"' +
                    'data-market-id="{{marketId}}"' +
                    'data-runner-id="{{runnerId}}"' +
                    'data-ladder-type="{{priceLadderType}}"' +
                    'data-percentage="{{percentage}}"' +
                    'data-betting-type="{{bettingType}}"' +
                    'data-game-type="{{gameType}}"' +
                    'data-remove-inline-bet="removeInlineCtrl()"' +
                    (model.isMobile ? ' mobile="true" ' : ' ') +
                    'data-event-name="{{eventName}}"' +
                    'data-market-name="{{marketName}}"' +
                    'data-runner-name="{{runnerName}}"' +
                    'data-event-type-id="{{eventTypeId}}"' +
                    'data-bet-id="{{betId}}"' +
                    'data-max-profit="{{maxProfit}}"' +
                    'data-price="{{price}}" data-bet-size="{{betSize}}" data-side="{{side}}"></kt-inline-bet></td>';

                angular.element(document.getElementById('td_' + scope.marketId + '_' + tdId)).after(this.$compile(html)(scope));
            }
            else {
                var html = '<tr id="tr_inlinebet"><td colspan="8" class="td-popup" ng-class="{\'back-1\':side==1,\'lay-1\':side==2}"><kt-inline-bet data-min="{{minUnitValue}}"' +
                    'data-max="{{maxUnitValue}}"' +
                    'data-interval="{{interval}}"' +
                    'data-market-id="{{marketId}}"' +
                    'data-runner-id="{{runnerId}}"' +
                    'data-ladder-type="{{priceLadderType}}"' +
                    'data-percentage="{{percentage}}"' +
                    'data-betting-type="{{bettingType}}"' +
                    'data-game-type="{{gameType}}"' +
                    'data-remove-inline-bet="removeInlineCtrl()"' +
                    (model.isMobile ? ' mobile="true" ' : ' ') +
                    'data-event-name="{{eventName}}"' +
                    'data-market-name="{{marketName}}"' +
                    'data-runner-name="{{runnerName}}"' +
                    'data-event-type-id="{{eventTypeId}}"' +
                    'data-bet-id="{{betId}}"' +
                    'data-max-profit="{{maxProfit}}"' +
                    'data-price="{{price}}" data-bet-size="{{betSize}}" data-side="{{side}}"></kt-inline-bet></td></tr>';

                angular.element(document.getElementById('tr_' + scope.marketId + '_' + scope.runnerId)).after(this.$compile(html)(scope));
            }
            // clear all bet slip data
            this.commonDataService.clearBetModel();
        }

        public popoverHtml(market: any): any {
            return 'Max Bet : ' + this.commonDataService.$filter('toRate')(market.maxBet) + ' <br/> Max Profit : ' + this.commonDataService.$filter('toRate')(market.maxProfit);
        }


        abstract subscribeOdds(): void;

        public unsubscribeOdds(): void {
            this.WSSocketService.sendMessage({
                Mids: [], MessageType: common.enums.WSMessageType.SubscribeMarket
            });
            this.WSSocketService.sendMessage({
                Scid: [], MessageType: common.enums.WSMessageType.Score
            });

        }

        public setOddsInMarket(market: any, data: any): void {
            if (market.bettingType == common.enums.BettingType.SESSION || market.bettingType == common.enums.BettingType.LINE
                || market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                market.pl = this.commonDataService.setPLInFancyMarket(market.id);
            }
            market.timer = data.t;
            market.betOpenTime = data.bot;
            market.betCloseTime = data.bct;
            market.notification = data.nf;
            market.winner = data.wnr;
            market.totalMatched = data.tm;
            market.inPlay = data.ip;
            market.marketStatus = data.ms;
            market.temporaryStatus = data.ts;
            data.mr.forEach((value: any, index: any) => {
                if (market.gameType == common.enums.GameType.Up7Down) {
                    this.commonDataService.setPLInOddsMarketFromBets(market.id, market.marketRunner[index], 'up7down');
                }
                else if (market.gameType == common.enums.GameType.DragonTiger && market.marketRunner[index].metadata) {
                    this.commonDataService.setPLInOddsMarketFromBets(market.id, market.marketRunner[index], 'dragonTiger');
                }
                else if (market.gameType == common.enums.GameType.Card32 && market.marketRunner[index].metadata && market.marketRunner[index].metadata.runnerGroup == 'LuckyNumber') {
                    this.commonDataService.setPLInOddsMarketFromBets(market.id, market.marketRunner[index], 'card32');
                }
                else if (market.gameType == common.enums.GameType.ClashOfKings && market.marketRunner[index].metadata) {
                    this.commonDataService.setPLInOddsMarketFromBets(market.id, market.marketRunner[index], 'clashOfKing');
                }
                else {
                    this.commonDataService.setPLInOddsMarket(market.id, market.marketRunner[index]);
                }
                market.marketRunner[index].status = value.rs;
                market.marketRunner[index].backPrice = value.bp;
                market.marketRunner[index].layPrice = value.lp;
                market.marketRunner[index].winner = value.wnr;
            });
            this.setSessionPrice(market);
        }

        public setSessionPrice(market: any): void {
            if (market.bettingType == common.enums.BettingType.SESSION || market.bettingType == common.enums.BettingType.LINE) {
                var mtr = market.marketRunner[0];
                if ((!mtr.backPrice || mtr.backPrice.length <= 0)
                    && (!mtr.layPrice || mtr.layPrice.length <= 0)
                    && (!market.mr || !market.mr.priceLength)) {
                    market.mr = common.helpers.CommonHelper.setSessionPrice(market.marketRunner[0]);
                    market.mr.priceLength = this.getPriceLength(market.mr.backPrice.length);
                } else if ((mtr.backPrice && mtr.backPrice.length > 0) || (mtr.layPrice && mtr.layPrice.length > 0)) {
                    var len = mtr.backPrice.length > mtr.layPrice.length ? mtr.backPrice.length : mtr.layPrice.length;
                    market.mr = mtr;
                    market.mr.priceLength = this.getPriceLength(len);
                }
            }
        }

        private getPriceLength(length: any): any {
            var arr = [];
            for (var i = 1; i <= length; i++) { arr.push(i); }
            return arr;
        }

        private wssReconnected(): void {
            if (this.currentController.subscribeOdds) {
                this.currentController.subscribeOdds();
            }
        }

        public betOnAllRunner(m: any, side: any, isHorse: boolean = false) {
            if (m.marketStatus == common.enums.MarketStatus.OPEN && m.temporaryStatus == common.enums.TemporaryStatus.OPEN) {
                angular.forEach(m.marketRunner, (mr: any) => {
                    if (side == 1) {
                        if (mr.backPrice && mr.backPrice.length > 0) {
                            var model = new common.helpers.BetModal(m, side, mr.runnerId, mr.backPrice[0].price, mr.runnerName, isHorse, '', 100).model;
                            this.removeInlineBet();
                            var stakeconfig = this.localStorageHelper.get(this.settings.StakeConfig);
                            if (stakeconfig && stakeconfig.defaultStake && !isNaN(stakeconfig.defaultStake)) { model.size = math.number(stakeconfig.defaultStake); }
                            this.placeBetDataService.setSharedData(model);
                            this.$rootScope.$emit("bet-placed");
                        }
                    } else {
                        if (mr.layPrice && mr.layPrice.length > 0) {
                            var model = new common.helpers.BetModal(m, side, mr.runnerId, mr.layPrice[0].price, mr.runnerName, isHorse, '', 100).model;
                            this.removeInlineBet();
                            var stakeconfig = this.localStorageHelper.get(this.settings.StakeConfig);
                            if (stakeconfig && stakeconfig.defaultStake && !isNaN(stakeconfig.defaultStake)) { model.size = math.number(stakeconfig.defaultStake); }
                            this.placeBetDataService.setSharedData(model);
                            this.$rootScope.$emit("bet-placed");
                        }
                    }
                });
            }
        }
    }
}