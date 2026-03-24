var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class PositionViewerCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, settings, $timeout, commonDataService, $window, $state, $base64, $rootScope, $stateParams, WSSocketService, $sce, $q, positionService) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                this.$timeout = $timeout;
                this.commonDataService = commonDataService;
                this.$window = $window;
                this.$state = $state;
                this.$base64 = $base64;
                this.$rootScope = $rootScope;
                this.$stateParams = $stateParams;
                this.WSSocketService = WSSocketService;
                this.$sce = $sce;
                this.$q = $q;
                this.positionService = positionService;
                var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                    if (response.success) {
                        var data = JSON.parse(response.data);
                        if (data.MarketId == this.$stateParams.marketid) {
                            this.$scope.isBetCountChanged = true;
                        }
                    }
                });
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_position);
                    wsListner();
                });
                this.WSSocketService.setController(this);
                super.init(this);
            }
            initScopeValues() {
                this.$scope.marketId = this.$stateParams.marketid;
                this.$scope.bettingType = this.$stateParams.bettingtype;
                this.$scope.includePT = false;
                this.$scope.p = {
                    market: { id: this.$scope.marketId, name: this.$base64.decode(this.$stateParams.name) }
                };
                this.$scope.runners = this.$base64.decode(this.$stateParams.runner).split(',');
                this.$scope.openedPosition = [];
                this.$scope.openedBook = [];
                this.$scope.isBetCountChanged = false;
                this.$scope.userpositionTemplate = this.settings.ThemeName + '/template/sa-detail-user-position.html';
                this.$scope.userpositionChildTemplate = this.settings.ThemeName + '/template/sa-detail-user-position-child.html';
                this.$scope.sessionpositionTemplate = this.settings.ThemeName + '/template/sa-detail-session-position.html';
                this.$scope.sessionpositionChildTemplate = this.settings.ThemeName + '/template/sa-detail-session-position-child.html';
            }
            loadInitialData() {
                this.refreshBetsAndPosition();
            }
            refreshBetsAndPosition() {
                if (this.$scope.bettingType == intranet.common.enums.BettingType.SESSION
                    || this.$scope.bettingType == intranet.common.enums.BettingType.LINE
                    || this.$scope.bettingType == intranet.common.enums.BettingType.SCORE_RANGE) {
                    this.getSessionPosition();
                }
                else {
                    this.getUserPosition();
                }
            }
            open_Close_Check_Position(user, p = null, isclick = false) {
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
                var model = { MarketId: this.$scope.marketId, isPT: this.$scope.includePT };
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
                    }
                }).finally(() => {
                    this.startTimer();
                    if (this.$scope.loginUserPosition && this.$scope.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(this.$scope.loginUserPosition.marketRunners, (m) => {
                            if (m.pl < pl) {
                                pl = m.pl;
                            }
                        });
                    }
                });
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
                            this.commonDataService.openScorePosition(this.$scope.marketId + '_' + user.userId, user.showSession, user.ladders, true);
                        }
                        else {
                            user.showSession = false;
                        }
                    }
                }
            }
            openBook(event, user, p = null) {
                debugger;
                if (event) {
                    event.stopPropagation();
                }
                this.open_Close_Check_Book(user, true);
                this.commonDataService.openScorePosition(this.$scope.marketId + '_' + user.userId, user.showSession, user.ladders, true);
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
                var model = { MarketId: this.$scope.marketId, isPT: this.$scope.includePT };
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
                        self.open_Close_Check_Book(this.$scope.loginUserPosition);
                    }
                }).finally(() => {
                    this.startTimer();
                    if (this.$scope.loginUserPosition && this.$scope.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(this.$scope.loginUserPosition.marketRunners, (m) => {
                            if (m.pl < pl) {
                                pl = m.pl;
                            }
                        });
                    }
                });
            }
            startTimer(start = true) {
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
                                startdelay();
                            }, 1000);
                        }
                        else {
                            if (this.$scope.isBetCountChanged) {
                                this.$scope.isBetCountChanged = false;
                                this.refreshBetsAndPosition();
                            }
                            else {
                                this.startTimer();
                            }
                        }
                    });
                    this.$timeout(() => { startdelay(); }, 1000);
                }
            }
        }
        master.PositionViewerCtrl = PositionViewerCtrl;
        angular.module('intranet.master').controller('positionViewerCtrl', PositionViewerCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=PositionViewerCtrl.js.map