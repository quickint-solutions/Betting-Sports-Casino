var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class NetExposureCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, settings, $timeout, $stateParams, commonDataService, $window, $q, $state, $rootScope, $sce, positionService) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                this.$timeout = $timeout;
                this.$stateParams = $stateParams;
                this.commonDataService = commonDataService;
                this.$window = $window;
                this.$q = $q;
                this.$state = $state;
                this.$rootScope = $rootScope;
                this.$sce = $sce;
                this.positionService = positionService;
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_exposure);
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.events = [];
                this.$scope.eventTypes = [];
                this.$scope.positions = [];
                this.$scope.openedPosition = [];
                this.$scope.openedBook = [];
                this.$scope.filterOptions = { onlyPT: this.commonDataService.getExposurePTOption(), eventType: '-1' };
                this.commonDataService.setExposurePTOption(this.$scope.filterOptions.onlyPT);
                this.$scope.isExposureView = true;
                this.$scope.userpositionTemplate = this.settings.ThemeName + '/template/exposure-user-position.html';
                this.$scope.userpositionChildTemplate = this.settings.ThemeName + '/template/exposure-user-position-child.html';
                this.$scope.sessionpositionTemplate = this.settings.ThemeName + '/template/exposure-session-position.html';
                this.$scope.sessionpositionChildTemplate = this.settings.ThemeName + '/template/exposure-session-position-child.html';
                this.$scope.canShowDetail = true;
                if (this.$stateParams.usertype) {
                    this.$scope.canShowDetail = this.$stateParams.usertype != intranet.common.enums.UserType.Player;
                }
                else {
                    var loggeduser = this.commonDataService.getLoggedInUserData();
                    if (loggeduser) {
                        this.$scope.canShowDetail = loggeduser.userType != intranet.common.enums.UserType.Player;
                    }
                }
            }
            loadInitialData() {
                this.loadEventTypes();
                this.getMarkets(true);
            }
            loadEventTypes() {
                var defer = this.$q.defer();
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    angular.copy(value, this.$scope.eventTypes);
                    this.$scope.eventTypes.splice(0, 0, { id: '-1', name: 'All' });
                    defer.resolve();
                });
                return defer.promise;
            }
            refreshMarkets() {
                this.commonDataService.setExposurePTOption(this.$scope.filterOptions.onlyPT);
                if (this.$scope.isExposureView)
                    this.getMarkets();
                else {
                    if (this.$scope.exposureTreeMarket.bettingType == intranet.common.enums.BettingType.ODDS ||
                        this.$scope.exposureTreeMarket.bettingType == intranet.common.enums.BettingType.BM) {
                        this.getUserPosition();
                    }
                    else if (this.$scope.exposureTreeMarket.bettingType == intranet.common.enums.BettingType.SESSION) {
                        this.getSessionPosition();
                    }
                }
            }
            startTimer() {
                this.$timeout.cancel(this.$scope.timer_exposure);
                this.$scope.selectedInterval = 7;
                var startdelay = (() => {
                    if (this.$scope.selectedInterval > 0) {
                        this.$scope.selectedInterval = this.$scope.selectedInterval - 1;
                        this.$scope.timer_exposure = this.$timeout(() => {
                            startdelay();
                        }, 1000);
                    }
                    else {
                        if (this.$scope.isExposureView)
                            this.getMarkets();
                        else {
                            if (this.$scope.exposureTreeMarket.bettingType == intranet.common.enums.BettingType.ODDS
                                || this.$scope.exposureTreeMarket.bettingType == intranet.common.enums.BettingType.BM) {
                                this.getUserPosition();
                            }
                            else if (this.$scope.exposureTreeMarket.bettingType == intranet.common.enums.BettingType.SESSION) {
                                this.getSessionPosition();
                            }
                        }
                    }
                });
                this.$scope.timer_exposure = this.$timeout(() => { startdelay(); }, 1000);
            }
            getMarkets(firstTime = false) {
                var promise;
                if (this.$stateParams.memberid) {
                    promise = this.positionService.getMarketByEventTypeById(this.$scope.filterOptions.eventType, this.$stateParams.memberid, this.$scope.filterOptions.onlyPT);
                }
                else {
                    promise = this.positionService.getMarketByEventTypeById(this.$scope.filterOptions.eventType, -1, this.$scope.filterOptions.onlyPT);
                }
                if (firstTime)
                    this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        if (response.data) {
                            angular.forEach(response.data, (d) => {
                                d.isRace = false;
                                if (d.eventTypeId == this.settings.LiveGamesId) {
                                    d.isLiveGame = true;
                                }
                                if (d.eventTypeId == this.settings.HorseRacingId || d.eventTypeId == this.settings.GreyhoundId) {
                                    d.isRace = true;
                                }
                            });
                        }
                        this.$scope.events = response.data;
                    }
                }).finally(() => {
                    if (!this.$scope.$$destroyed) {
                        this.startTimer();
                    }
                });
            }
            openFullPositionView(event, marketId) {
                if (event) {
                    event.stopPropagation();
                }
                if (this.$stateParams.memberid) {
                    this.$state.go('master.lotusmember.exposuredetail', { memberid: this.$stateParams.memberid, marketid: marketId });
                }
                else {
                    this.$state.go('master.exposuredetail', { marketid: marketId });
                }
            }
            openLiveGameFullPositionView(event, eventid) {
                if (event) {
                    event.stopPropagation();
                }
                if (this.$stateParams.memberid) {
                    this.$state.go('master.lotusmember.livegameexposuredetail', { memberid: this.$stateParams.memberid, eventid: eventid });
                }
                else {
                    this.$state.go('master.livegameexposuredetail', { eventid: eventid });
                }
            }
            openBetList(event, marketId, marketname = '', memberid = undefined) {
                if (event) {
                    event.stopPropagation();
                }
                if (memberid) {
                    this.$state.go('master.betsbymarket', { marketId: marketId, marketname: marketname, memberid: memberid });
                }
                else {
                    this.$state.go('master.betsbymarket', { marketId: marketId, marketname: marketname });
                }
            }
            openExposureTree(event, market, openLadder = false) {
                if (event) {
                    event.stopPropagation();
                }
                this.$scope.isExposureView = !this.$scope.isExposureView;
                if (!this.$scope.isExposureView) {
                    this.$scope.exposureTreeMarket = market;
                    if (this.$scope.exposureTreeMarket.bettingType == intranet.common.enums.BettingType.ODDS ||
                        this.$scope.exposureTreeMarket.bettingType == intranet.common.enums.BettingType.BM) {
                        this.getUserPosition();
                    }
                    if (this.$scope.exposureTreeMarket.bettingType == intranet.common.enums.BettingType.SESSION) {
                        if (openLadder)
                            this.$scope.exposureTreeMarket.position.showSession = true;
                        this.getSessionPosition(true);
                        if (openLadder) {
                            this.$timeout(() => {
                                this.openBook(null, this.$scope.exposureTreeMarket.position);
                            }, 1000);
                        }
                    }
                }
            }
            closeExposureTree() {
                this.$scope.isExposureView = true;
                this.getMarkets(true);
            }
            open_Close_Check_Position(user, isclick = false) {
                if (user.downline && user.downline.length > 0) {
                    if (isclick) {
                        user.open = !user.open;
                        if (user.open) {
                            this.$scope.openedPosition.push(user.userId);
                        }
                        else {
                            var index = this.$scope.openedPosition.indexOf(user.userId);
                            if (index > -1) {
                                this.$scope.openedPosition.splice(index, 1);
                            }
                        }
                    }
                    else {
                        if (this.$scope.openedPosition.indexOf(user.userId) > -1) {
                            user.open = true;
                        }
                        else {
                            user.open = false;
                        }
                    }
                }
            }
            open_Close_Check_Book(user, isclick = false) {
                if (user.downline && user.downline.length > 0) {
                    if (isclick) {
                        user.showSession = !user.showSession;
                        if (user.showSession) {
                            this.$scope.openedBook.push(user.userId);
                        }
                        else {
                            var index = this.$scope.openedBook.indexOf(user.userId);
                            if (index > -1) {
                                this.$scope.openedBook.splice(index, 1);
                            }
                        }
                    }
                    else {
                        if (this.$scope.openedBook.indexOf(user.userId) > -1) {
                            user.showSession = true;
                            this.commonDataService.openScorePosition(user.userId, user.showSession, user.ladders, true);
                        }
                        else {
                            user.showSession = false;
                        }
                    }
                }
            }
            getUserPosition() {
                var self = this;
                var isOpen = ((p) => {
                    self.open_Close_Check_Position(p);
                    if (p.downline && p.downline.length > 0) {
                        angular.forEach(p.downline, (d) => {
                            isOpen(d);
                        });
                    }
                });
                var findMember = ((m, id) => {
                    if (m.userId == id) {
                        self.$scope.loginUserPosition = m;
                        self.$scope.positions = m.downline;
                    }
                    else {
                        if (m.downline && m.downline.length > 0) {
                            angular.forEach(m.downline, (d) => {
                                findMember(d, id);
                            });
                        }
                    }
                });
                var model = { MarketId: this.$scope.exposureTreeMarket.id, IsPt: this.$scope.filterOptions.onlyPT };
                this.positionService.getUserPositionPost(model)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.loginUserPosition = response.data;
                        this.$scope.positions = response.data.downline;
                        if (this.$scope.positions) {
                            angular.forEach(this.$scope.positions, (p) => {
                                isOpen(p);
                            });
                        }
                        if (this.$stateParams.memberid && response.data.userId != this.$stateParams.memberid) {
                            this.$scope.positions.forEach((p) => {
                                findMember(p, this.$stateParams.memberid);
                            });
                        }
                    }
                }).finally(() => { this.startTimer(); });
            }
            openBook(event, user) {
                if (event) {
                    event.stopPropagation();
                }
                this.open_Close_Check_Book(user, true);
                this.commonDataService.openScorePosition(user.userId, user.showSession, user.ladders, true);
            }
            getSessionPosition(firstTime = false) {
                var self = this;
                var isOpen = ((p) => {
                    self.open_Close_Check_Position(p);
                    self.open_Close_Check_Book(p);
                    if (p.downline && p.downline.length > 0) {
                        angular.forEach(p.downline, (d) => {
                            isOpen(d);
                        });
                    }
                });
                var findMember = ((m, id) => {
                    if (m.userId == id) {
                        self.$scope.loginUserPosition = m;
                        self.$scope.positions = m.downline;
                    }
                    else {
                        if (m.downline && m.downline.length > 0) {
                            angular.forEach(m.downline, (d) => {
                                findMember(d, id);
                            });
                        }
                    }
                });
                if (firstTime) {
                    this.$scope.loginUserPosition = this.$scope.exposureTreeMarket.position;
                    this.$scope.positions = this.$scope.loginUserPosition.downline;
                }
                else {
                    var model = { MarketId: this.$scope.exposureTreeMarket.id, IsPt: this.$scope.filterOptions.onlyPT };
                    this.positionService.getFancyUserPosition(model)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.loginUserPosition = response.data;
                            this.$scope.positions = response.data.downline;
                            if (this.$scope.positions) {
                                angular.forEach(this.$scope.positions, (p) => {
                                    isOpen(p);
                                });
                            }
                            if (this.$stateParams.memberid && response.data.userId != this.$stateParams.memberid) {
                                this.$scope.positions.forEach((p) => {
                                    findMember(p, this.$stateParams.memberid);
                                });
                            }
                            else {
                                self.open_Close_Check_Book(this.$scope.loginUserPosition);
                            }
                        }
                    }).finally(() => { this.startTimer(); });
                }
            }
        }
        master.NetExposureCtrl = NetExposureCtrl;
        angular.module('intranet.master').controller('netExposureCtrl', NetExposureCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=NetExposureCtrl.js.map