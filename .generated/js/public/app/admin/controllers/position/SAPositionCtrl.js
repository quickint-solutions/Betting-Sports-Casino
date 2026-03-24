var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAPositionCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, settings, $timeout, commonDataService, $window, $state, $rootScope, WSSocketService, $sce, $q, positionService) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                this.$timeout = $timeout;
                this.commonDataService = commonDataService;
                this.$window = $window;
                this.$state = $state;
                this.$rootScope = $rootScope;
                this.WSSocketService = WSSocketService;
                this.$sce = $sce;
                this.$q = $q;
                this.positionService = positionService;
                var pinChangedFromTree = this.$scope.$on("market-pin-changed-from-tree", (event, data) => {
                    this.reflectPinChanges(data);
                });
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        this.$scope.pinnedMarkets.forEach((p) => {
                            if (p.id == data.MarketId) {
                                p.isBetCountChanged = true;
                            }
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
            initScopeValues() {
                this.$scope.pinnedMarkets = [];
                this.$scope.spinnerImg = this.commonDataService.rippleImg;
                this.$scope.userpositionTemplate = this.settings.ThemeName + '/template/sa-detail-user-position.html';
                this.$scope.userpositionChildTemplate = this.settings.ThemeName + '/template/sa-detail-user-position-child.html';
                this.$scope.sessionpositionTemplate = this.settings.ThemeName + '/template/sa-detail-session-position.html';
                this.$scope.sessionpositionChildTemplate = this.settings.ThemeName + '/template/sa-detail-session-position-child.html';
            }
            loadInitialData() {
                this.loadPinnedMarkets();
            }
            pinnedMarketTabClicked(pin) {
                pin.expanded = !pin.expanded;
            }
            loadPinnedMarkets() {
                var pinned = this.localStorageHelper.get(this.settings.BookMarketPin);
                if (pinned && pinned.length > 0) {
                    pinned.forEach((p) => {
                        this.$scope.pinnedMarkets.push({ id: p, openedPosition: [], openedBook: [] });
                    });
                    this.loadAllPinnedMarketDetail(pinned);
                }
            }
            loadSingleMarketDetail(marketid) {
                this.positionService.getMarketpositionbyMarketId(marketid)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.pinnedMarkets.forEach((m) => {
                            if (m.id == marketid) {
                                m.isBetCountChanged = false;
                                m.market = response.data;
                                m.expanded = true;
                                if (m.market.bettingType == intranet.common.enums.BettingType.SESSION || m.market.bettingType == intranet.common.enums.BettingType.LINE
                                    || m.market.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
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
            loadAllPinnedMarketDetail(ids) {
                this.positionService.getMarketpositionbyMarketIds(ids)
                    .success((response) => {
                    if (response.success) {
                        response.data.forEach((data) => {
                            this.$scope.pinnedMarkets.forEach((m) => {
                                if (m.id == data.id) {
                                    m.isBetCountChanged = false;
                                    m.market = data;
                                    if (m.market.bettingType == intranet.common.enums.BettingType.SESSION || m.market.bettingType == intranet.common.enums.BettingType.LINE
                                        || m.market.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
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
            wssReconnected() {
                this.subscribeOdds();
            }
            subscribeOdds() {
                var mids = [];
                if (this.$scope.pinnedMarkets && this.$scope.pinnedMarkets.length > 0) {
                    mids = this.$scope.pinnedMarkets.map((p) => { return p.id; });
                }
                this.WSSocketService.sendMessage({
                    Mids: mids, MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            unsubscribeOdds() {
                this.WSSocketService.sendMessage({
                    Mids: [], MessageType: intranet.common.enums.WSMessageType.SubscribeMarket
                });
            }
            setMarketOdds(responseData) {
                responseData.forEach((r) => {
                    angular.forEach((this.$scope.pinnedMarkets), (p) => {
                        if (p.market && p.market.id == r.id) {
                            if (p.market) {
                                p.market.height = jQuery('#market_' + p.market.id).height();
                            }
                            if (p.market.height < 200) {
                                p.market.height = 200;
                            }
                            this.setOddsInMarket(p.market, r, false);
                        }
                    });
                });
            }
            getUserPosition(pin) {
                var self = this;
                var isOpen = ((p) => {
                    self.open_Close_Check_Position(p, pin);
                    if (p.downline && p.downline.length > 0) {
                        angular.forEach(p.downline, (d) => {
                            isOpen(d);
                        });
                    }
                });
                var findMember = ((m, id) => {
                    if (m.userId == id) {
                        pin.loginUserPosition = m;
                        pin.positions = m.downline;
                    }
                    else {
                        if (m.downline && m.downline.length > 0) {
                            angular.forEach(m.downline, (d) => {
                                findMember(d, id);
                            });
                        }
                    }
                });
                var model = { MarketId: pin.market.id };
                this.positionService.getUserPositionPost(model)
                    .success((response) => {
                    if (response.success) {
                        pin.loginUserPosition = response.data;
                        pin.positions = response.data.downline;
                        if (pin.positions) {
                            angular.forEach(pin.positions, (p) => {
                                isOpen(p);
                            });
                        }
                    }
                }).finally(() => {
                    this.startTimer();
                    if (pin.loginUserPosition && pin.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(pin.loginUserPosition.marketRunners, (m) => {
                            if (m.pl < pl) {
                                pl = m.pl;
                            }
                        });
                        pin.market.pl = pl;
                    }
                });
            }
            open_Close_Check_Position(user, pin, isclick = false) {
                if (user.downline && user.downline.length > 0) {
                    if (isclick) {
                        user.open = !user.open;
                        if (user.open) {
                            pin.openedPosition.push(user.userId);
                        }
                        else {
                            var index = pin.openedPosition.indexOf(user.userId);
                            if (index > -1) {
                                pin.openedPosition.splice(index, 1);
                            }
                        }
                    }
                    else {
                        if (pin.openedPosition.indexOf(user.userId) > -1) {
                            user.open = true;
                        }
                        else {
                            user.open = false;
                        }
                    }
                }
            }
            open_Close_Check_Book(user, pin, isclick = false) {
                if (user.downline && user.downline.length > 0) {
                    if (isclick) {
                        user.showSession = !user.showSession;
                        if (user.showSession) {
                            pin.openedBook.push(user.userId);
                        }
                        else {
                            var index = pin.openedBook.indexOf(user.userId);
                            if (index > -1) {
                                pin.openedBook.splice(index, 1);
                            }
                        }
                    }
                    else {
                        if (pin.openedBook.indexOf(user.userId) > -1) {
                            user.showSession = true;
                            this.commonDataService.openScorePosition(pin.market.id + '_' + user.userId, user.showSession, user.ladders, true);
                        }
                        else {
                            user.showSession = false;
                        }
                    }
                }
            }
            openBook(event, user, pin) {
                if (event) {
                    event.stopPropagation();
                }
                this.open_Close_Check_Book(user, pin, true);
                this.commonDataService.openScorePosition(pin.market.id + '_' + user.userId, user.showSession, user.ladders, true);
            }
            getSessionPosition(pin) {
                var self = this;
                var isOpen = ((p) => {
                    self.open_Close_Check_Position(p, pin);
                    self.open_Close_Check_Book(p, pin);
                    if (p.downline && p.downline.length > 0) {
                        angular.forEach(p.downline, (d) => {
                            isOpen(d);
                        });
                    }
                });
                var findMember = ((m, id) => {
                    if (m.userId == id) {
                        pin.loginUserPosition = m;
                        pin.positions = m.downline;
                    }
                    else {
                        if (m.downline && m.downline.length > 0) {
                            angular.forEach(m.downline, (d) => {
                                findMember(d, id);
                            });
                        }
                    }
                });
                var model = { MarketId: pin.market.id };
                this.positionService.getFancyUserPosition(model)
                    .success((response) => {
                    if (response.success) {
                        pin.loginUserPosition = response.data;
                        pin.positions = response.data.downline;
                        if (pin.positions) {
                            angular.forEach(pin.positions, (p) => {
                                isOpen(p);
                            });
                        }
                        self.open_Close_Check_Book(pin.loginUserPosition, pin);
                    }
                }).finally(() => {
                    this.startTimer();
                    if (pin.loginUserPosition && pin.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(pin.loginUserPosition.marketRunners, (m) => {
                            if (m.pl < pl) {
                                pl = m.pl;
                            }
                        });
                        pin.market.pl = pl;
                    }
                });
            }
            openFullPositionView(event, marketId) {
                if (event) {
                    event.stopPropagation();
                }
                var url = this.$state.href('admin.fullposition', { marketid: marketId });
                this.$window.open(this.$sce.trustAsUrl(url));
            }
            openBFChart(market, r) {
                var ids = { marketSource: market.sourceId, runnerSource: r.runner.sourceId, eventType: market.eventType.id };
                this.commonDataService.openBFChart(ids);
            }
            reflectPinChanges(market, justDelete = false) {
                if (justDelete) {
                    this.localStorageHelper.removeFromArray(this.settings.BookMarketPin, market);
                    var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.pinnedMarkets, 'id', market);
                    if (index > -1) {
                        this.$scope.pinnedMarkets.splice(index, 1);
                    }
                    this.informToTree({ id: market, pin: false });
                    this.subscribeOdds();
                }
                else {
                    if (market.pin) {
                        this.$scope.pinnedMarkets.push({ id: market.id, openedPosition: [], openedBook: [] });
                        this.loadSingleMarketDetail(market.id);
                    }
                    else {
                        var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.pinnedMarkets, 'id', market.id);
                        if (index > -1) {
                            this.$scope.pinnedMarkets.splice(index, 1);
                        }
                        this.subscribeOdds();
                    }
                }
            }
            pinMe(market) {
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
            removePin(marketid) {
                this.localStorageHelper.removeFromArray(this.settings.BookMarketPin, marketid);
                var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.pinnedMarkets, 'id', marketid);
                if (index > -1) {
                    this.$scope.pinnedMarkets.splice(index, 1);
                }
                this.subscribeOdds();
            }
            informToTree(market) {
                this.$scope.$broadcast('market-pin-changed-from-position', { id: market.id, pin: market.pin });
            }
            startTimer(start = true) {
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
                                startdelay();
                            }, 1000);
                        }
                        else {
                            this.refreshPosition();
                            this.startTimer();
                        }
                    });
                    this.$timeout(() => { startdelay(); }, 1000);
                }
            }
            refreshPosition(forceFully = false) {
                this.$scope.pinnedMarkets.forEach((p) => {
                    if (p.isBetCountChanged || forceFully) {
                        if (p.market.bettingType != intranet.common.enums.BettingType.SESSION && p.market.bettingType != intranet.common.enums.BettingType.LINE && p.market.bettingType != intranet.common.enums.BettingType.SCORE_RANGE) {
                            this.getUserPosition(p);
                        }
                        else {
                            this.getSessionPosition(p);
                        }
                        p.isBetCountChanged = false;
                        this.$rootScope.$emit("admin-balance-changed");
                    }
                });
            }
            shortcut(event) {
                if ((event.originalEvent.ctrlKey == true && event.originalEvent.code === 'KeyB' || (event.originalEvent.code === 'F7'))
                    && !this.$scope.$$destroyed) {
                    this.refreshPosition(true);
                }
            }
        }
        admin.SAPositionCtrl = SAPositionCtrl;
        angular.module('intranet.admin').controller('sAPositionCtrl', SAPositionCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAPositionCtrl.js.map