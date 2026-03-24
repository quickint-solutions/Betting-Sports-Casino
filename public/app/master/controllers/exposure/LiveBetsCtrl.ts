module intranet.master {

    export interface ILiveBetsScope extends intranet.common.IScopeBase {
        isAdmin: boolean;
        currentUser: any;

        isBetCountChanged: any;
        timer_position: any;
        selectedInterval: any;

        search: any;

        // for filter
        eventTypeList: any[];
        marketTypeList: any[];

        liveGamesId: any;

        userList: any[];
        promiseItem: any;
    }

    export class LiveBetsCtrl extends intranet.common.ControllerBase<ILiveBetsScope>
        implements common.init.IInit {
        constructor($scope: ILiveBetsScope,
            private commonDataService: common.services.CommonDataService,
            private eventTypeService: services.EventTypeService,
            private marketService: services.MarketService,
            private userService: services.UserService,
            private $timeout: ng.ITimeoutService,
            protected $rootScope: any,
            private $filter: any,
            private betService: services.BetService,
            private settings: common.IBaseSettings) {
            super($scope);



            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    this.$scope.isBetCountChanged = true;
                }
            });

            this.$scope.$on('$destroy', () => {
                wsListner();
                this.$timeout.cancel(this.$scope.timer_position);
            });
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.userList = [];
            this.$scope.isAdmin = false;
            this.$scope.selectedInterval = 10;

            this.$scope.search = {
                status: '-1',
                inplay: false,
                betside: '-1',
                stakefrom: '',
                staketo: '',
                eventType: { id: '', name: 'All' },
                marketType: { id: '', displayName: 'All' },
            };

            this.$scope.liveGamesId = this.settings.LiveGamesId;
        }

        public loadInitialData(): void {
            this.getLoggedInUser();
            this.getMarketTypes();
            this.getEventTypes();
            this.startTimer();
        }

        private getLoggedInUser(): void {
            var result = this.commonDataService.getLoggedInUserData();
            if (result) {
                this.$scope.currentUser = result;
                if (this.$scope.currentUser.userType <= common.enums.UserType.Admin) {
                    this.$scope.isAdmin = true;
                }
            }
        }

        private getEventTypes(): void {
            this.eventTypeService.getEventTypes()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.eventTypeList = response.data;
                        this.$scope.eventTypeList.splice(0, 0, { id: '', name: 'All' });
                    }
                });
        }

        private getMarketTypes(): void {
            this.marketService.getAllMarketTypeMapping()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.marketTypeList = [];
                        angular.forEach(response.data, (d: any) => {
                            this.$scope.marketTypeList.push({ id: d.marketTypeCode, displayName: d.displayName });
                        });
                        this.$scope.marketTypeList.splice(0, 0, { id: '', displayName: 'All' });
                    }
                });
        }



        private getAllBets(params: any): any {
            var searchQuery = {
                side: this.$scope.search.betside,
                inplay: this.$scope.search.inplay,

                eventTypeId: this.$scope.search.eventType && this.$scope.search.eventType.id ? this.$scope.search.eventType.id : '',
                marketTypeCode: this.$scope.search.marketType && this.$scope.search.marketType.id ? this.$scope.search.marketType.id : '',
                eventName: this.$scope.search.eventName,

                stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),
            };
            if (this.$scope.search.selectedUser) {
                return this.betService.getLiveBets({ searchQuery: searchQuery, params: params, id: this.$scope.search.selectedUser.id });
            }
            else {
                return this.betService.getLiveBets({ searchQuery: searchQuery, params: params });
            }
        }

        private playAudio(): void {
            var audio = new Audio('audio/short_1.mp3');
            audio.play();
        }

        private fetchLiveBetsData(): void {
            var refreshCMD = "refreshGrid";
            refreshCMD = refreshCMD + "_kt-alllivebets-grid";
            this.$scope.$broadcast(refreshCMD);
        }

        private resetCriteria(): void {
            this.$scope.search.status = '-1';
            this.$scope.search.inplay = false;
            this.$scope.search.betside = '-1';
            this.$scope.search.stakefrom = '';
            this.$scope.search.staketo = '';
            this.$scope.search.eventType = { id: '', name: 'All' };
            this.$scope.search.marketType = { id: '', displayName: 'All' };
            this.$scope.search.eventName = '';
            this.$scope.search.selectedUser = undefined;
            this.fetchLiveBetsData();
        }

        private startTimer(start: boolean = true): void {
            if (!start) {
                this.$timeout.cancel(this.$scope.timer_position);
            }
            else {
                this.$timeout.cancel(this.$scope.timer_position);
                this.$scope.selectedInterval = 3;
                var startdelay = (() => {
                    if (this.$scope.selectedInterval > 0) {
                        this.$scope.selectedInterval = this.$scope.selectedInterval - 1;
                        this.$scope.timer_position = this.$timeout(() => {
                            startdelay()
                        }, 1000);
                    } else {
                        if (this.$scope.isBetCountChanged) {
                            this.$scope.isBetCountChanged = false;
                            this.fetchLiveBetsData();
                            this.playAudio();
                            this.$rootScope.$emit('master-balance-changed');
                        } this.startTimer();
                    }
                });
                this.$timeout(() => { startdelay() }, 1000);
            }
        }

        private searchUser(search: any): void {
            if (search && search.length >= 3) {
                // reject previous fetching of data when already started
                if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                    this.$scope.promiseItem.cancel();
                }
                this.$scope.promiseItem = this.userService.findMembers(search);
                if (this.$scope.promiseItem) {
                    // make the distinction between a normal post request and a postWithCancel request
                    var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                    // on success
                    promise.success((response: common.messaging.IResponse<any>) => {
                        // update items
                        this.$scope.userList = response.data;
                        if (this.$scope.userList && this.$scope.userList.length > 0) {
                            this.$scope.userList.forEach((u: any) => {
                                u.extra = super.getUserTypesObj(u.userType);
                            });
                        }
                    });
                }

            } else {
                this.$scope.userList.splice(0);
            }
        }
    }
    angular.module('intranet.master').controller('liveBetsCtrl', LiveBetsCtrl);
}