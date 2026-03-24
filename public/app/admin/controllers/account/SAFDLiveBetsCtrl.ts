module intranet.admin {

    export interface ISAFDLiveBetsScope extends intranet.common.IScopeBase {
       
        refreshIntervals: any[];

        isBetCountChanged: any;

        currentUser: any;
        selectedInterval: any;
        timer_position: any;

        search: any;
        gridItems: any[];

        // user filter
        adminList: any[];
        superMasterList: any[];
        masterList: any[];
        agentList: any[];
        userList: any[];

        userPTtree: any[];

        anyUserList: any[];
        promiseItem: any;
    }

    export class SAFDLiveBetsCtrl extends intranet.common.ControllerBase<ISAFDLiveBetsScope>
        implements common.init.IInit {
        constructor($scope: ISAFDLiveBetsScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private eventTypeService: services.EventTypeService,
            private eventService: services.EventService,
            private marketService: services.MarketService,
            private modalService: common.services.ModalService,
            private userService: services.UserService,
            private $filter: any,
            private $q: ng.IQService,
            private commonDataService: common.services.CommonDataService,
            private $timeout: ng.ITimeoutService,
            private fdService: services.FDService,
            private settings: common.IBaseSettings) {
            super($scope);

            var newPageLoader = this.$scope.$on('newPageLoaded', (e: any, data: any) => {
                if (e.targetScope.gridId === 'kt-matchedlivebets-grid') {
                    if (data && data.result.length > 0) {
                        data.result.forEach((item: any) => {
                            var diff = (item.price - item.avgPrice);
                            if (diff != 0) {
                                if (diff < 0) { diff = math.abs(diff); }
                                item.alert = math.round(diff, 2) >= 0.07;
                            }
                        });
                    }
                }
            });

            var wsListner = this.$rootScope.$on("ws-betsize-changed", (event, response) => {
                if (response.success) {
                    this.$scope.isBetCountChanged = true;
                }
            });

            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timer_position);
                newPageLoader();
            });
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.refreshIntervals = [];
            this.$scope.userPTtree = [];
            this.$scope.anyUserList = [];
            this.$scope.agentList = [];
            this.$scope.adminList = [];
            this.$scope.superMasterList = [];
            this.$scope.masterList = [];
            this.$scope.userList = [];

            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY")),
                todate: new Date(moment().format("DD MMM YYYY")),
                roundId: '',
                oddsfrom: '',
                oddsto: '',
                stakefrom: '',
                staketo: '',
                selectedUser: undefined,
                
            };

        }

        public loadInitialData(): void {
            this.buildUserTreeForPT();
            this.fillRefreshInterval();
            this.startTimer();
        }

     
        private buildUserTreeForPT(): void {
            var loggeduser = this.commonDataService.getLoggedInUserData();
            if (loggeduser) {
                this.$scope.userPTtree = super.getUserTypeForPT(loggeduser.userType);
                this.$scope.userPTtree = this.$scope.userPTtree.reverse();
            }
        }

        private fillRefreshInterval(): void {
            this.$scope.refreshIntervals.push({ name: '3 sec', value: 3 });
            this.$scope.refreshIntervals.push({ name: '5 sec', value: 5 });
            this.$scope.refreshIntervals.push({ name: '10 sec', value: 10 });
            this.$scope.refreshIntervals.push({ name: '15 sec', value: 15 });
            this.$scope.refreshIntervals.push({ name: '20 sec', value: 20 });
            this.$scope.refreshIntervals.push({ name: '25 sec', value: 25 });
            this.$scope.refreshIntervals.push({ name: '30 sec', value: 30 });
            this.$scope.refreshIntervals.push({ name: '60 sec', value: 60 });
            this.$scope.refreshIntervals.push({ name: 'Stop', value: 0 });
            this.$scope.selectedInterval = '10';
        }

        // level 1=WA, 2=Admin, 3=Master, 4=User
        private loadChildLevel(userlevel: any = 1, firstTime: boolean = false): void {
            if (this.$scope.adminList.length <= 0 || !firstTime) {
                var promise: ng.IHttpPromise<any>;
                if (userlevel == 1) { promise = this.userService.getAllChildMembers(-1); }
                else if (userlevel == 2) { promise = this.userService.getAllChildMembers(this.$scope.search.admin.id); }
                else if (userlevel == 3) { promise = this.userService.getAllChildMembers(this.$scope.search.superMaster.id); }
                else if (userlevel == 4) { promise = this.userService.getAllChildMembers(this.$scope.search.master.id); }
                else if (userlevel == 5) { promise = this.userService.getAllChildMembers(this.$scope.search.agent.id); }

                if (promise) {
                    promise.success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            if (userlevel == 1) {
                                this.$scope.adminList = response.data;
                                this.$scope.search.superMaster = null;
                                this.$scope.search.master = null;
                                this.$scope.search.agent = null;
                                this.$scope.search.user = null;
                            }
                            else if (userlevel == 2) {
                                this.$scope.superMasterList = response.data;
                                this.$scope.search.master = null;
                                this.$scope.search.agent = null;
                                this.$scope.search.user = null;
                            }
                            else if (userlevel == 3) {
                                this.$scope.masterList = response.data;
                                this.$scope.search.agent = null;
                                this.$scope.search.user = null;
                            }
                            else if (userlevel == 4) {
                                this.$scope.agentList = response.data;
                                this.$scope.search.user = null;
                            }
                            else if (userlevel == 5) {
                                this.$scope.userList = response.data;
                            }
                        }
                    });
                }
            }
        }


        private getMatchedBets(params: any): any {
            var searchQuery: any = {
                fromDate: common.helpers.Utility.fromDateUTC(this.$scope.search.fromdate),
                toDate: common.helpers.Utility.toDateUTC(this.$scope.search.todate),
                roundId: this.$scope.search.roundId,
                oddsfrom: this.$scope.search.oddsfrom,
                oddsto: this.$scope.search.oddsto,
                stakefrom: (this.$scope.search.stakefrom ? this.$filter('toGLC')(this.$scope.search.stakefrom) : ''),
                staketo: (this.$scope.search.staketo ? this.$filter('toGLC')(this.$scope.search.staketo) : ''),
            };

            if (params && params.orderBy == '') {
                params.orderBy = 'createdon';
                params.orderByDesc = true;
            }

            var userId = 0;
            if (this.$scope.search.selectedUser) { userId = this.$scope.search.selectedUser.id; }
            if (this.$scope.search.admin && this.$scope.search.admin.id) { userId = this.$scope.search.admin.id; }
            if (this.$scope.search.superMaster && this.$scope.search.superMaster.id) { userId = this.$scope.search.superMaster.id; }
            if (this.$scope.search.master && this.$scope.search.master.id) { userId = this.$scope.search.master.id; }
            if (this.$scope.search.agent && this.$scope.search.agent.id) { userId = this.$scope.search.agent.id; }
            if (this.$scope.search.user && this.$scope.search.user.id) { userId = this.$scope.search.user.id; }

            if (userId != 0) {
                return this.fdService.getLiveBets({ searchQuery: searchQuery, params: params, id: userId });
            }
            else {
                return this.fdService.getLiveBets({ searchQuery: searchQuery, params: params });
            }
        }



        private fetchLiveBetsData(): void {
            this.$scope.$broadcast("refreshGrid_kt-matchedlivebets-grid");
        }

        private intervalChanged(): void {
            if (this.$scope.selectedInterval != 0) { this.startTimer(); }
            else { this.$timeout.cancel(this.$scope.timer_position); }
        }

        private resetCriteria(): void {
            this.$scope.search = {
                fromdate: new Date(moment().format("DD MMM YYYY HH:mm")),
                todate: new Date(moment().format("DD MMM YYYY HH:mm")),
                roundId:'',
                oddsfrom: '',
                oddsto: '',
                stakefrom: '',
                staketo: '',
                selectedUser: undefined,
            };
            this.$scope.search.admin = null;
            this.$scope.search.superMaster = null;
            this.$scope.search.master = null;
            this.$scope.search.agent = null;
            this.$scope.search.user = null;

            this.$scope.selectedInterval = '10';
            this.fetchLiveBetsData();
        }

        private startTimer(start: boolean = true): void {
            if (!start) {
                this.$timeout.cancel(this.$scope.timer_position);
            }
            else {
                this.$timeout.cancel(this.$scope.timer_position);
                var selectedInterval = this.$scope.selectedInterval;
                var startdelay = (() => {
                    if (selectedInterval > 0) {
                        selectedInterval = selectedInterval - 1;
                        this.$scope.timer_position = this.$timeout(() => {
                            startdelay()
                        }, 1000);
                    } else {
                        if (this.$scope.isBetCountChanged) {
                            this.$scope.isBetCountChanged = false;
                            this.fetchLiveBetsData();
                        } this.startTimer();
                    }
                });
                this.$timeout(() => { startdelay() }, 1000);
            }
        }


        private deleteSelectedBets(): void {
            var betsToDelete = this.$scope.gridItems.filter((g: any) => { return g.isDelete == true; });
            if (betsToDelete.length > 0) {
                var modal = new common.helpers.CreateModal();
                modal.header = 'common.voidbets.header';
                modal.data = {
                    betIds: betsToDelete.map((b: any) => { return b.id; })
                }
                modal.bodyUrl = this.settings.ThemeName + '/admin/account/void-bets-modal.html';
                modal.controller = 'voidBetsModalCtrl';
                modal.SetModal();
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                    if (result.button == common.services.ModalResult.OK) {
                        this.fetchLiveBetsData();
                    }
                });
            }
        }

        private cancelBet(item: any): void {
            var modal = new common.helpers.CreateModal();
            modal.header = 'common.voidbets.header';
            modal.data = {
                betId: item.id,
                voidAmount: item.sizeMatched
            };
            modal.bodyUrl = this.settings.ThemeName + '/admin/account/void-bets-modal.html';
            modal.controller = 'voidBetsModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.fetchLiveBetsData();
                }
            });
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
                        this.$scope.anyUserList = response.data;
                        if (this.$scope.anyUserList && this.$scope.anyUserList.length > 0) {
                            this.$scope.anyUserList.forEach((u: any) => {
                                u.extra = super.getUserTypesObj(u.userType);
                            });
                        }
                    });
                }

            } else {
                this.$scope.anyUserList.splice(0);
            }
        }
    }
    angular.module('intranet.admin').controller('sAFDLiveBetsCtrl', SAFDLiveBetsCtrl);
}