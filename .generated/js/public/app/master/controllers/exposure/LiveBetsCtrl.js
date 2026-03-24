var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class LiveBetsCtrl extends intranet.common.ControllerBase {
            constructor($scope, commonDataService, eventTypeService, marketService, userService, $timeout, $rootScope, $filter, betService, settings) {
                super($scope);
                this.commonDataService = commonDataService;
                this.eventTypeService = eventTypeService;
                this.marketService = marketService;
                this.userService = userService;
                this.$timeout = $timeout;
                this.$rootScope = $rootScope;
                this.$filter = $filter;
                this.betService = betService;
                this.settings = settings;
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
            initScopeValues() {
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
            loadInitialData() {
                this.getLoggedInUser();
                this.getMarketTypes();
                this.getEventTypes();
                this.startTimer();
            }
            getLoggedInUser() {
                var result = this.commonDataService.getLoggedInUserData();
                if (result) {
                    this.$scope.currentUser = result;
                    if (this.$scope.currentUser.userType <= intranet.common.enums.UserType.Admin) {
                        this.$scope.isAdmin = true;
                    }
                }
            }
            getEventTypes() {
                this.eventTypeService.getEventTypes()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.eventTypeList = response.data;
                        this.$scope.eventTypeList.splice(0, 0, { id: '', name: 'All' });
                    }
                });
            }
            getMarketTypes() {
                this.marketService.getAllMarketTypeMapping()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.marketTypeList = [];
                        angular.forEach(response.data, (d) => {
                            this.$scope.marketTypeList.push({ id: d.marketTypeCode, displayName: d.displayName });
                        });
                        this.$scope.marketTypeList.splice(0, 0, { id: '', displayName: 'All' });
                    }
                });
            }
            getAllBets(params) {
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
            playAudio() {
                var audio = new Audio('audio/short_1.mp3');
                audio.play();
            }
            fetchLiveBetsData() {
                var refreshCMD = "refreshGrid";
                refreshCMD = refreshCMD + "_kt-alllivebets-grid";
                this.$scope.$broadcast(refreshCMD);
            }
            resetCriteria() {
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
            startTimer(start = true) {
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
                                startdelay();
                            }, 1000);
                        }
                        else {
                            if (this.$scope.isBetCountChanged) {
                                this.$scope.isBetCountChanged = false;
                                this.fetchLiveBetsData();
                                this.playAudio();
                                this.$rootScope.$emit('master-balance-changed');
                            }
                            this.startTimer();
                        }
                    });
                    this.$timeout(() => { startdelay(); }, 1000);
                }
            }
            searchUser(search) {
                if (search && search.length >= 3) {
                    if (this.$scope.promiseItem && this.$scope.promiseItem.cancel) {
                        this.$scope.promiseItem.cancel();
                    }
                    this.$scope.promiseItem = this.userService.findMembers(search);
                    if (this.$scope.promiseItem) {
                        var promise = this.$scope.promiseItem.promise ? this.$scope.promiseItem.promise : this.$scope.promiseItem;
                        promise.success((response) => {
                            this.$scope.userList = response.data;
                            if (this.$scope.userList && this.$scope.userList.length > 0) {
                                this.$scope.userList.forEach((u) => {
                                    u.extra = super.getUserTypesObj(u.userType);
                                });
                            }
                        });
                    }
                }
                else {
                    this.$scope.userList.splice(0);
                }
            }
        }
        master.LiveBetsCtrl = LiveBetsCtrl;
        angular.module('intranet.master').controller('liveBetsCtrl', LiveBetsCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LiveBetsCtrl.js.map