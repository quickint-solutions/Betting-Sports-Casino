module intranet.master {

    export interface INetExposureScope extends intranet.common.IScopeBase {
        events: any[];
        eventTypes: any[];
        filterOptions: { onlyPT: any, eventType: any };

        timer_exposure: any;
        selectedInterval: any;

        isExposureView: boolean;
        exposureTreeMarket: any;

        userpositionTemplate: any;
        userpositionChildTemplate: any;

        sessionpositionTemplate: any;
        sessionpositionChildTemplate: any;

        openedPosition: any[];
        openedBook: any[];

        loginUserPosition: any;
        positions: any;

        canShowDetail: boolean;

    }

    export class NetExposureCtrl extends intranet.common.ControllerBase<INetExposureScope>
        implements common.init.IInit {
        constructor($scope: INetExposureScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings,
            private $timeout: ng.ITimeoutService,
            private $stateParams: any,
            private commonDataService: common.services.CommonDataService,
            private $window: any,
            private $q: any,
            private $state: any,
            protected $rootScope: any,
            private $sce: any,
            private positionService: services.PositionService) {
            super($scope);


            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timer_exposure);
            });

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.events = [];
            this.$scope.eventTypes = [];
            this.$scope.positions = [];
            this.$scope.openedPosition = [];
            this.$scope.openedBook = [];

            this.$scope.filterOptions = { onlyPT: this.commonDataService.getExposurePTOption(), eventType: '-1' }
            this.commonDataService.setExposurePTOption(this.$scope.filterOptions.onlyPT);


            this.$scope.isExposureView = true;

            this.$scope.userpositionTemplate = this.settings.ThemeName + '/template/exposure-user-position.html';
            this.$scope.userpositionChildTemplate = this.settings.ThemeName + '/template/exposure-user-position-child.html';

            this.$scope.sessionpositionTemplate = this.settings.ThemeName + '/template/exposure-session-position.html';
            this.$scope.sessionpositionChildTemplate = this.settings.ThemeName + '/template/exposure-session-position-child.html';

            this.$scope.canShowDetail = true;

            if (this.$stateParams.usertype) {
                this.$scope.canShowDetail = this.$stateParams.usertype != common.enums.UserType.Player;
            }
            else {
                var loggeduser = this.commonDataService.getLoggedInUserData();
                if (loggeduser) { this.$scope.canShowDetail = loggeduser.userType != common.enums.UserType.Player; }
            }

        }

        public loadInitialData(): void {
            this.loadEventTypes();
            this.getMarkets(true);
        }

        private loadEventTypes(): any {
            var defer = this.$q.defer();
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                angular.copy(value, this.$scope.eventTypes);
                //this.$scope.eventTypes = value;
                this.$scope.eventTypes.splice(0, 0, { id: '-1', name: 'All' });
                defer.resolve();
            });
            return defer.promise;
        }

        private refreshMarkets(): void {
            this.commonDataService.setExposurePTOption(this.$scope.filterOptions.onlyPT);

            if (this.$scope.isExposureView)
                this.getMarkets();
            else {
                if (this.$scope.exposureTreeMarket.bettingType == common.enums.BettingType.ODDS ||
                    this.$scope.exposureTreeMarket.bettingType == common.enums.BettingType.BM) {
                    this.getUserPosition();
                }
                else if (this.$scope.exposureTreeMarket.bettingType == common.enums.BettingType.SESSION) {
                    this.getSessionPosition();
                }
            }
        }

        private startTimer(): void {
            this.$timeout.cancel(this.$scope.timer_exposure);
            this.$scope.selectedInterval = 7;
            var startdelay = (() => {
                if (this.$scope.selectedInterval > 0) {
                    this.$scope.selectedInterval = this.$scope.selectedInterval - 1;
                    this.$scope.timer_exposure = this.$timeout(() => {
                        startdelay()
                    }, 1000);
                } else {
                    if (this.$scope.isExposureView)
                        this.getMarkets();
                    else {
                        if (this.$scope.exposureTreeMarket.bettingType == common.enums.BettingType.ODDS
                            || this.$scope.exposureTreeMarket.bettingType == common.enums.BettingType.BM) {
                            this.getUserPosition();
                        }
                        else if (this.$scope.exposureTreeMarket.bettingType == common.enums.BettingType.SESSION) {
                            this.getSessionPosition();
                        }
                    }
                }
            });
            this.$scope.timer_exposure = this.$timeout(() => { startdelay() }, 1000);
        }

        private getMarkets(firstTime: boolean = false): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$stateParams.memberid) {
                promise = this.positionService.getMarketByEventTypeById(this.$scope.filterOptions.eventType, this.$stateParams.memberid, this.$scope.filterOptions.onlyPT);
            }
            else {
                promise = this.positionService.getMarketByEventTypeById(this.$scope.filterOptions.eventType, -1, this.$scope.filterOptions.onlyPT);
            }
            if (firstTime) this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    if (response.data) {
                        angular.forEach(response.data, (d: any) => {
                            d.isRace = false;
                            if (d.eventTypeId == this.settings.LiveGamesId) { d.isLiveGame = true; }
                            if (d.eventTypeId == this.settings.HorseRacingId || d.eventTypeId == this.settings.GreyhoundId) { d.isRace = true; }
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

        private openFullPositionView(event: any, marketId: any): void {
            if (event) { event.stopPropagation(); }
            //  if (this.settings.ThemeName == 'lotus') {
            if (this.$stateParams.memberid) {
                this.$state.go('master.lotusmember.exposuredetail', { memberid: this.$stateParams.memberid, marketid: marketId });
            } else {
                this.$state.go('master.exposuredetail', { marketid: marketId });
            }
            //}
            //else {
            //    var url = this.$state.href('master.exposuredetail', { marketid: marketId });
            //    this.$window.open(this.$sce.trustAsUrl(url));
            //}
        }

        private openLiveGameFullPositionView(event: any, eventid: any): void {
            if (event) { event.stopPropagation(); }
            //  if (this.settings.ThemeName == 'lotus') {
            if (this.$stateParams.memberid) {
                this.$state.go('master.lotusmember.livegameexposuredetail', { memberid: this.$stateParams.memberid, eventid: eventid });
            } else {
                this.$state.go('master.livegameexposuredetail', { eventid: eventid });
            }
            //}
            //else {
            //    var url = this.$state.href('master.livegameexposuredetail', { eventid: eventid });
            //    this.$window.open(this.$sce.trustAsUrl(url));
            //}
        }

        private openBetList(event: any, marketId: any, marketname: any = '', memberid: any = undefined): void {
            if (event) { event.stopPropagation(); }
            //if (this.settings.ThemeName == 'lotus') {
            if (memberid) {
                this.$state.go('master.betsbymarket', { marketId: marketId, marketname: marketname, memberid: memberid });
            }
            else {
                this.$state.go('master.betsbymarket', { marketId: marketId, marketname: marketname });
            }
            //}
            //else {
            //    var url = this.$state.href('master.betsbymarket', { marketId: marketId });
            //    this.$window.open(this.$sce.trustAsUrl(url));
            //}
        }


        private openExposureTree(event: any, market: any, openLadder: boolean = false): void {
            if (event) { event.stopPropagation(); }
            this.$scope.isExposureView = !this.$scope.isExposureView;
            if (!this.$scope.isExposureView) {
                this.$scope.exposureTreeMarket = market;
                if (this.$scope.exposureTreeMarket.bettingType == common.enums.BettingType.ODDS ||
                    this.$scope.exposureTreeMarket.bettingType == common.enums.BettingType.BM) {
                    this.getUserPosition();
                }
                if (this.$scope.exposureTreeMarket.bettingType == common.enums.BettingType.SESSION) {
                    if (openLadder) this.$scope.exposureTreeMarket.position.showSession = true;
                    this.getSessionPosition(true);
                    if (openLadder) {
                        this.$timeout(() => {
                            this.openBook(null, this.$scope.exposureTreeMarket.position);
                        }, 1000);
                    }
                }
            }
        }

        private closeExposureTree(): void {
            this.$scope.isExposureView = true;
            this.getMarkets(true);
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

            var model = { MarketId: this.$scope.exposureTreeMarket.id, IsPt: this.$scope.filterOptions.onlyPT };
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
                        if (this.$stateParams.memberid && response.data.userId != this.$stateParams.memberid) {
                            this.$scope.positions.forEach((p: any) => {
                                findMember(p, this.$stateParams.memberid);
                            });
                        }
                    }
                }).finally(() => { this.startTimer(); });
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

            if (firstTime) {
                this.$scope.loginUserPosition = this.$scope.exposureTreeMarket.position;
                this.$scope.positions = this.$scope.loginUserPosition.downline;
            }
            else {
                var model = { MarketId: this.$scope.exposureTreeMarket.id, IsPt: this.$scope.filterOptions.onlyPT };
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
                            } else {
                                self.open_Close_Check_Book(this.$scope.loginUserPosition);
                            }
                        }
                    }).finally(() => { this.startTimer(); });
            }
        }

    }
    angular.module('intranet.master').controller('netExposureCtrl', NetExposureCtrl);
}