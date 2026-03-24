module intranet.admin {

    export interface ISAPositionScope extends intranet.common.IScopeBase {
        pinnedMarkets: any[];

        timer_pinnedmarket: any;
        timer_position: any;
        spinnerImg: any;

        userpositionTemplate: any;
        userpositionChildTemplate: any;

        sessionpositionTemplate: any;
        sessionpositionChildTemplate: any;
        selectedInterval: any;
    }

    export class SAPositionCtrl extends intranet.common.ControllerBase<ISAPositionScope>
        implements common.init.IInit {
        constructor($scope: ISAPositionScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings,
            private $timeout: ng.ITimeoutService,
            private commonDataService: common.services.CommonDataService,
            private $window: any,
            private $state: any,
            protected $rootScope: any,
            private WSSocketService: any,
            private $sce: any,
            private $q: ng.IQService,
            private positionService: services.PositionService) {
            super($scope);

            var pinChangedFromTree = this.$scope.$on("market-pin-changed-from-tree", (event, data) => {
                this.reflectPinChanges(data);

            });

            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    var data = JSON.parse(response.data);
                    this.$scope.pinnedMarkets.forEach((p: any) => {
                        if (p.id == data.MarketId) { p.isBetCountChanged = true; }
                    });
                }
            });

            var wsListnerMarketOdds = this.$rootScope.$on("ws-marketodds-changed", (event, response) => {
                if (response.success) {
                    this.setMarketOdds(response.data);
                }
            });

            this.$timeout(() => {
                jQuery("#leftdiv").resizable({
                    handles: 'e',
                    resize: function (event, ui) {
                        var w = jQuery('#leftdiv').outerWidth();
                        jQuery('#rightdiv').css('width', 'calc(100% - ' + w + 'px)');
                    }
                });
            }, 1000);

            this.$scope.$on('$destroy', () => {
                pinChangedFromTree();
                this.$timeout.cancel(this.$scope.timer_pinnedmarket);
                wsListner();
                wsListnerMarketOdds();
            });
            this.WSSocketService.setController(this);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.pinnedMarkets = [];
            this.$scope.spinnerImg = this.commonDataService.rippleImg;

            this.$scope.userpositionTemplate = this.settings.ThemeName + '/template/sa-detail-user-position.html';
            this.$scope.userpositionChildTemplate = this.settings.ThemeName + '/template/sa-detail-user-position-child.html';

            this.$scope.sessionpositionTemplate = this.settings.ThemeName + '/template/sa-detail-session-position.html';
            this.$scope.sessionpositionChildTemplate = this.settings.ThemeName + '/template/sa-detail-session-position-child.html';
        }

        public loadInitialData(): void {
            this.loadPinnedMarkets();
        }

        private pinnedMarketTabClicked(pin: any): void {
            pin.expanded = !pin.expanded;
            //this.getAllPinnedMarketOdds();
        }

        // pinned markets
        private loadPinnedMarkets(): void {
            var pinned = this.localStorageHelper.get(this.settings.BookMarketPin);
            if (pinned && pinned.length > 0) {
                pinned.forEach((p: any) => {
                    this.$scope.pinnedMarkets.push({ id: p, openedPosition: [], openedBook: [] });
                });
                this.loadAllPinnedMarketDetail(pinned);
            }
        }

        private loadSingleMarketDetail(marketid: any): void {
            this.positionService.getMarketpositionbyMarketId(marketid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.pinnedMarkets.forEach((m: any) => {
                            if (m.id == marketid) {
                                m.isBetCountChanged = false;
                                m.market = response.data;
                                m.expanded = true;
                                if (m.market.bettingType == common.enums.BettingType.SESSION || m.market.bettingType == common.enums.BettingType.LINE
                                    || m.market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                                    this.getSessionPosition(m);
                                }
                                else {
                                    this.getUserPosition(m);
                                }
                            }
                        });
                    }
                }).finally(() => { this.subscribeOdds(); });
        }

        private loadAllPinnedMarketDetail(ids: any): void {
            this.positionService.getMarketpositionbyMarketIds(ids)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        response.data.forEach((data: any) => {
                            this.$scope.pinnedMarkets.forEach((m: any) => {
                                if (m.id == data.id) {
                                    m.isBetCountChanged = false;
                                    m.market = data;
                                    if (m.market.bettingType == common.enums.BettingType.SESSION || m.market.bettingType == common.enums.BettingType.LINE
                                        || m.market.bettingType == common.enums.BettingType.SCORE_RANGE) {
                                        this.getSessionPosition(m);
                                    }
                                    else {
                                        this.getUserPosition(m);
                                    }
                                }
                            });
                        });
                    }
                }).finally(() => { this.subscribeOdds(); });
        }


        private wssReconnected(): void {
            this.subscribeOdds();
        }

        private subscribeOdds(): void {
            var mids: any[] = [];
            if (this.$scope.pinnedMarkets && this.$scope.pinnedMarkets.length > 0) {
                mids = this.$scope.pinnedMarkets.map((p: any) => { return p.id; });
            }

            this.WSSocketService.sendMessage({
                Mids: mids, MessageType: common.enums.WSMessageType.SubscribeMarket
            });
        }

        public unsubscribeOdds(): void {
            this.WSSocketService.sendMessage({
                Mids: [], MessageType: common.enums.WSMessageType.SubscribeMarket
            });
        }

        private setMarketOdds(responseData: any[]): void {
            responseData.forEach((r: any) => {
                angular.forEach((this.$scope.pinnedMarkets), (p: any) => {
                    if (p.market && p.market.id == r.id) {
                        if (p.market) { p.market.height = jQuery('#market_' + p.market.id).height(); }
                        if (p.market.height < 200) { p.market.height = 200; }
                        this.setOddsInMarket(p.market, r, false);
                    }
                });
            });
        }

        private getUserPosition(pin: any): void {
            var self = this;
            var isOpen = ((p: any) => {
                self.open_Close_Check_Position(p, pin);
                if (p.downline && p.downline.length > 0) {
                    angular.forEach(p.downline, (d: any) => {
                        isOpen(d);
                    });
                }
            });
            var findMember = ((m: any, id: any) => {
                if (m.userId == id) {
                    pin.loginUserPosition = m;
                    pin.positions = m.downline;
                }
                else {
                    if (m.downline && m.downline.length > 0) {
                        angular.forEach(m.downline, (d: any) => {
                            findMember(d, id);
                        });
                    }
                }
            });
            var model = { MarketId: pin.market.id };
            this.positionService.getUserPositionPost(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        pin.loginUserPosition = response.data;
                        pin.positions = response.data.downline;
                        if (pin.positions) {
                            angular.forEach(pin.positions, (p: any) => {
                                isOpen(p);
                            });
                        }
                    }
                }).finally(() => {
                    this.startTimer();
                    if (pin.loginUserPosition && pin.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(pin.loginUserPosition.marketRunners, (m: any) => {
                            if (m.pl < pl) { pl = m.pl; }
                        });
                        pin.market.pl = pl;
                    }
                });
        }

        private open_Close_Check_Position(user: any, pin: any, isclick: boolean = false): void {
            if (user.downline && user.downline.length > 0) {
                if (isclick) {
                    user.open = !user.open;
                    if (user.open) { pin.openedPosition.push(user.userId); }
                    else {
                        var index = pin.openedPosition.indexOf(user.userId);
                        if (index > -1) { pin.openedPosition.splice(index, 1); }
                    }
                } else {
                    if (pin.openedPosition.indexOf(user.userId) > -1) {
                        user.open = true;
                    } else {
                        user.open = false;
                    }
                }
            }
        }

        private open_Close_Check_Book(user: any, pin: any, isclick: boolean = false): void {
            if (user.downline && user.downline.length > 0) {
                if (isclick) {
                    user.showSession = !user.showSession;
                    if (user.showSession) { pin.openedBook.push(user.userId); }
                    else {
                        var index = pin.openedBook.indexOf(user.userId);
                        if (index > -1) { pin.openedBook.splice(index, 1); }
                    }
                } else {
                    if (pin.openedBook.indexOf(user.userId) > -1) {
                        user.showSession = true;
                        this.commonDataService.openScorePosition(pin.market.id + '_' + user.userId, user.showSession, user.ladders, true);
                    } else {
                        user.showSession = false;
                    }
                }
            }
        }

        public openBook(event: any, user: any, pin: any): void {
            if (event) { event.stopPropagation(); }
            this.open_Close_Check_Book(user, pin, true);
            this.commonDataService.openScorePosition(pin.market.id + '_' + user.userId, user.showSession, user.ladders, true);
        }

        private getSessionPosition(pin: any): void {
            var self = this;
            var isOpen = ((p: any) => {
                self.open_Close_Check_Position(p, pin);
                self.open_Close_Check_Book(p, pin);
                if (p.downline && p.downline.length > 0) {
                    angular.forEach(p.downline, (d: any) => {
                        isOpen(d);
                    });
                }
            });

            var findMember = ((m: any, id: any) => {
                if (m.userId == id) {
                    pin.loginUserPosition = m;
                    pin.positions = m.downline;
                }
                else {
                    if (m.downline && m.downline.length > 0) {
                        angular.forEach(m.downline, (d: any) => {
                            findMember(d, id);
                        });
                    }
                }
            });


            var model = { MarketId: pin.market.id };
            this.positionService.getFancyUserPosition(model)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        pin.loginUserPosition = response.data;
                        pin.positions = response.data.downline;
                        if (pin.positions) {
                            angular.forEach(pin.positions, (p: any) => {
                                isOpen(p);
                            });
                        }
                        self.open_Close_Check_Book(pin.loginUserPosition, pin);
                    }
                }).finally(() => {
                    this.startTimer();
                    if (pin.loginUserPosition && pin.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(pin.loginUserPosition.marketRunners, (m: any) => {
                            if (m.pl < pl) { pl = m.pl; }
                        });
                        pin.market.pl = pl;
                    }
                });

        }


        private openFullPositionView(event: any, marketId: any): void {
            if (event) { event.stopPropagation(); }
            var url = this.$state.href('admin.fullposition', { marketid: marketId });
            this.$window.open(this.$sce.trustAsUrl(url));
        }

        private openBFChart(market: any, r: any): void {
            var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
            this.commonDataService.openBFChart(ids);
        }

        // pin related
        private reflectPinChanges(market: any, justDelete: boolean = false): void {
            if (justDelete) {
                this.localStorageHelper.removeFromArray(this.settings.BookMarketPin, market);
                var index = common.helpers.Utility.IndexOfObject(this.$scope.pinnedMarkets, 'id', market);
                if (index > -1) { this.$scope.pinnedMarkets.splice(index, 1); }
                this.informToTree({ id: market, pin: false });
                this.subscribeOdds();
            }
            else {
                if (market.pin) {
                    this.$scope.pinnedMarkets.push({ id: market.id, openedPosition: [], openedBook: [] });
                    this.loadSingleMarketDetail(market.id);
                }
                else {
                    var index = common.helpers.Utility.IndexOfObject(this.$scope.pinnedMarkets, 'id', market.id);
                    if (index > -1) { this.$scope.pinnedMarkets.splice(index, 1); }
                    this.subscribeOdds();
                }
            }
        }

        private pinMe(market: any): void {
            market.pin = !market.pin;
            if (market.pin) {
                this.localStorageHelper.setInArray(this.settings.BookMarketPin, market.id);
                this.$scope.pinnedMarkets.push({ id: market.id });
                this.loadSingleMarketDetail(market.id);
            }
            else {
                this.removePin(market.id);
            }
            this.informToTree(market);
        }

        private removePin(marketid: any): void {
            this.localStorageHelper.removeFromArray(this.settings.BookMarketPin, marketid);
            var index = common.helpers.Utility.IndexOfObject(this.$scope.pinnedMarkets, 'id', marketid);
            if (index > -1) { this.$scope.pinnedMarkets.splice(index, 1); }
            this.subscribeOdds();
        }

        private informToTree(market: any): void {
            this.$scope.$broadcast('market-pin-changed-from-position', { id: market.id, pin: market.pin });
        }

        private startTimer(start: boolean = true): void {
            if (!start) {
                this.$timeout.cancel(this.$scope.timer_position);
            }
            else {
                this.$timeout.cancel(this.$scope.timer_position);
                this.$scope.selectedInterval = this.$scope.selectedInterval ? this.$scope.selectedInterval : 5;
                var startdelay = (() => {
                    if (this.$scope.selectedInterval > 0) {
                        this.$scope.selectedInterval = this.$scope.selectedInterval - 1;
                        this.$scope.timer_position = this.$timeout(() => {
                            startdelay()
                        }, 1000);
                    } else {
                        this.refreshPosition();
                        this.startTimer();
                    }
                });
                this.$timeout(() => { startdelay() }, 1000);
            }
        }

        private refreshPosition(forceFully: boolean = false): void {
            this.$scope.pinnedMarkets.forEach((p: any) => {
                if (p.isBetCountChanged || forceFully) {
                    if (p.market.bettingType != common.enums.BettingType.SESSION && p.market.bettingType != common.enums.BettingType.LINE && p.market.bettingType != common.enums.BettingType.SCORE_RANGE) {
                        this.getUserPosition(p);
                    } else {
                        this.getSessionPosition(p);
                    }
                    p.isBetCountChanged = false;
                    this.$rootScope.$emit("admin-balance-changed");
                }
            });
        }

        private shortcut(event): void {
            if ((event.originalEvent.ctrlKey == true && event.originalEvent.code === 'KeyB' || (event.originalEvent.code === 'F7'))
                && !this.$scope.$$destroyed) {
                this.refreshPosition(true);
            }
        }
    }
    angular.module('intranet.admin').controller('sAPositionCtrl', SAPositionCtrl);
}