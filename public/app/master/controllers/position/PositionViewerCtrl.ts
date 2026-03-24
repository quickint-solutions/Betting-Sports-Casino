module intranet.master {

    export interface IPositionViewerScope extends intranet.common.IScopeBase {
        p: any;
        positions: any;
        loginUserPosition: any;
        openedPosition: any[];
        openedBook: any[];
        includePT: boolean;

        marketId: any;
        bettingType: any;
        runners: any;

        userpositionTemplate: any;
        userpositionChildTemplate: any;

        sessionpositionTemplate: any;
        sessionpositionChildTemplate: any;

        selectedInterval: any;
        isBetCountChanged: any;

        timer_position: any;
    }

    export class PositionViewerCtrl extends intranet.common.ControllerBase<IPositionViewerScope>
        implements common.init.IInit {
        constructor($scope: IPositionViewerScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings,
            private $timeout: ng.ITimeoutService,
            private commonDataService: common.services.CommonDataService,
            private $window: any,
            private $state: any,
            private $base64: any,
            protected $rootScope: any,
            private $stateParams: any,
            private WSSocketService: any,
            private $sce: any,
            private $q: ng.IQService,
            private positionService: services.PositionService) {
            super($scope);

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

        public initScopeValues(): void {
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

        public loadInitialData(): void {
            this.refreshBetsAndPosition();
        }

        private refreshBetsAndPosition() {
            if (this.$scope.bettingType == common.enums.BettingType.SESSION
                || this.$scope.bettingType == common.enums.BettingType.LINE
                || this.$scope.bettingType == common.enums.BettingType.SCORE_RANGE) {
                this.getSessionPosition();
            }
            else {
                this.getUserPosition();
            }
        }

        private open_Close_Check_Position(user: any, p: any = null, isclick: boolean = false): void {
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
            var model = { MarketId: this.$scope.marketId, isPT: this.$scope.includePT };
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

                    }
                }).finally(() => {
                    this.startTimer();
                    if (this.$scope.loginUserPosition && this.$scope.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(this.$scope.loginUserPosition.marketRunners, (m: any) => {
                            if (m.pl < pl) { pl = m.pl; }
                        });
                        //this.$scope.market.pl = pl;
                    }
                });
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
                        this.commonDataService.openScorePosition(this.$scope.marketId + '_' + user.userId, user.showSession, user.ladders, true);
                    } else {
                        user.showSession = false;
                    }
                }
            }
        }

        public openBook(event: any, user: any, p: any = null): void {
            debugger;
            if (event) { event.stopPropagation(); }
            this.open_Close_Check_Book(user, true);
            this.commonDataService.openScorePosition(this.$scope.marketId + '_' + user.userId, user.showSession, user.ladders, true);
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


            var model = { MarketId: this.$scope.marketId, isPT: this.$scope.includePT};
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
                        self.open_Close_Check_Book(this.$scope.loginUserPosition);
                    }
                }).finally(() => {
                    this.startTimer();
                    if (this.$scope.loginUserPosition && this.$scope.loginUserPosition.marketRunners) {
                        var pl = 0;
                        angular.forEach(this.$scope.loginUserPosition.marketRunners, (m: any) => {
                            if (m.pl < pl) { pl = m.pl; }
                        });
                        //this.$scope.market.pl = pl;
                    }
                });
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
                this.$timeout(() => { startdelay() }, 1000);
            }
        }
    }
    angular.module('intranet.master').controller('positionViewerCtrl', PositionViewerCtrl);
}