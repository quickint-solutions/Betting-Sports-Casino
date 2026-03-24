module intranet.home {
    export interface ISportTreeScope extends intranet.common.IScopeBase {
        sportTreeList: any[];
        breadcrumb: any[];
        isRacing: boolean;
        selectedHorse: any;
        hasCasino: boolean;

        liveGamesId: any;
        virtualGamesId: any;
    }

    export class SportTreeCtrl extends intranet.common.ControllerBase<ISportTreeScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISportTreeScope,
            private $stateParams: any,
            private $state: any,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private commonDataService: common.services.CommonDataService,
            private settings: common.IBaseSettings,
            private competitionService: services.CompetitionService,
            private marketOddsService: services.MarketOddsService,
            private eventService: services.EventService,
            private marketService: services.MarketService) {
            super($scope);

            var brListerner = this.$rootScope.$on("sporttree-br-changed", (event, data) => {
                this.setBreadCrumb(data.eventTypeId);
            });

            var treeListerner = this.$rootScope.$on("on-sporttree-click-outside", (event, data) => {
                this.treeClick(data.nodetype, data.id, data.name);
            });

            this.$scope.$on('$destroy', () => {
                brListerner();
                treeListerner();
            });

            super.init(this);
        }

        public initScopeValues() {
            this.$scope.sportTreeList = [];
            this.$scope.breadcrumb = [];
            this.$scope.isRacing = false;
            this.$scope.selectedHorse = 0;

            this.$scope.liveGamesId = this.settings.LiveGamesId;
            this.$scope.virtualGamesId = this.settings.VirtualGameId;
        }

        public loadInitialData() {
            this.loadWebsiteDetail();
            if (this.$state.current.url.indexOf('racing') > -1 || this.$state.current.url.indexOf('upcoming-race') > -1) {
                this.$scope.isRacing = true;
            }
            this.loadSportBreadcrumb();
            this.loadTreeData();
        }

        private loadWebsiteDetail(): void {
            this.commonDataService.getSupportDetails()
                .then((data: any) => {
                    if (data) {
                        this.$scope.hasCasino = data.hasCasino;
                    }
                });
        }

        private loadTreeData(): void {
            var model = { nodeType: null, id: null, eventTypeId: null };
            if (this.$stateParams.nodetype && this.$stateParams.id) {
                model.nodeType = this.$stateParams.nodetype;
                model.id = this.$stateParams.id;
                model.eventTypeId = this.$stateParams.eventTypeId;
            }
            if (this.$scope.isRacing) {
                if (model.nodeType == common.enums.SportNodeType.EventType) {
                    this.marketOddsService.getRaceMarketList(model.id)
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.$scope.sportTreeList = response.data;
                            }
                        });
                }
            }
            else {
                if (model.nodeType == common.enums.SportNodeType.EventType) {
                    if (model.id == this.settings.LiveGamesId || model.id == this.settings.VirtualGameId) {
                        this.eventService.searchGames(model.id)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    this.$scope.sportTreeList = response.data;
                                }
                            });
                    } else {
                        this.eventService.searchCometition(model.id)
                            .success((response: common.messaging.IResponse<any>) => {
                                if (response.success) {
                                    this.$scope.sportTreeList = response.data;
                                }
                            });
                    }
                }
                else if (model.nodeType == common.enums.SportNodeType.Competition) {
                    this.eventService.searchEventByCompetition(model.eventTypeId, model.id)
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.$scope.sportTreeList = response.data;
                            }
                        });
                }
                //else if (model.nodeType == common.enums.SportNodeType.Event) {
                //    this.marketService.getMarketByEventId(model.id)
                //        .success((response: common.messaging.IResponse<any>) => {
                //            if (response.success) {
                //                this.$scope.sportTreeList = response.data;
                //            }
                //        });
                //}
                else {
                    this.$scope.breadcrumb.splice(0);
                    this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
                    var eventtypes = this.commonDataService.getEventTypes();
                    eventtypes.then((value: any) => {
                        if (value && value.length > 0) { value = value.filter((a: any) => { return a.displayOrder >= 0; }); }
                        this.$scope.sportTreeList = value;
                    });
                }
            }
        }

        private loadSportBreadcrumb(): void {
            if (this.settings.ThemeName == 'lotus') {
                var tree = this.localStorageHelper.get(this.settings.SportTreeHeader);
                if (tree) {
                    this.$scope.breadcrumb = tree;
                }
            }
            else {
                if (this.$stateParams.nodetype && !this.$state.params['marketid']) {
                    var tree = this.localStorageHelper.get(this.settings.SportTreeHeader);
                    if (tree) {
                        this.$scope.breadcrumb = tree;
                    }
                }
            }
        }

        private breadcrumbClick(data: any): void {
            if (data.nodetype) {
                if (data.nodetype != this.$stateParams.nodetype) {
                    var index = common.helpers.Utility.IndexOfObject(this.$scope.breadcrumb, 'nodetype', data.nodetype);
                    if (index > -1) {
                        this.$scope.breadcrumb.splice(index + 1);
                        this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
                        this.$state.go(data.url, { nodetype: data.nodetype, id: data.id });
                    }
                }
            }
            else {
                this.$state.go("base.home");
            }
        }

        private treeClick(nodetype: any, id: any, name: any, marketid: any = undefined): void {
            var url = 'base.home.sport.market';
            var eventtypeid = (nodetype == common.enums.SportNodeType.EventType ? id : this.$stateParams.eventTypeId);

            if (((id == this.settings.HorseRacingId || id == this.settings.GreyhoundId) && nodetype == common.enums.SportNodeType.EventType) || this.$scope.isRacing) {
                //url = 'base.home.sport.upcomingrace';
                if (this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus') {
                    url = 'base.home.sport.upcomingrace';
                }
                else {
                    url = 'base.home.sport.racingmarket';
                }
            }

            if (id == this.settings.LiveGamesId && nodetype == common.enums.SportNodeType.EventType) {
                url = 'base.home.sport.livegames';
            }
            else if (id == this.settings.VirtualGameId && nodetype == common.enums.SportNodeType.EventType) {
                url = 'base.home.sport.virtualgames';
            }

            if (eventtypeid == this.settings.BinaryId) {
                url = 'base.home.sport.binarymarket';
            }

            if (marketid) {
                if (this.$scope.isRacing) {
                    this.$state.go("base.home.sport.upcomingrace", { nodetype: nodetype, id: id, marketid: marketid, eventTypeId: eventtypeid });
                    //if (this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus') {
                    //    this.$state.go("base.home.sport.upcomingrace", { nodetype: nodetype, id: id, marketid: marketid, eventTypeId: eventtypeid });
                    //}
                    //else {
                    //    this.$state.go("base.home.sport.fullracemarket", { nodetype: nodetype, id: id, marketid: marketid, eventTypeId: eventtypeid });
                    //}
                }
                if (eventtypeid == this.settings.BinaryId) {
                    this.$state.go("base.home.sport.binarymarket", { nodetype: nodetype, id: id, eventId: marketid, eventTypeId: eventtypeid });
                }
                else if (nodetype == common.enums.SportNodeType.Competition) {
                    this.$state.go("base.home.sport.fullmarket", { nodetype: nodetype, id: id, eventId: marketid, eventTypeId: eventtypeid });
                }
            }
            else {
                var data = { name: name, nodetype: nodetype, id: id, url: url, eventTypeId: eventtypeid };

                var index = common.helpers.Utility.IndexOfObject(this.$scope.breadcrumb, 'nodetype', data.nodetype);
                if (index > -1) {
                    this.$scope.breadcrumb.splice(index);
                }
                this.$scope.breadcrumb.push(data);
                this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
                this.$state.go(url, { nodetype: nodetype, id: id, eventTypeId: eventtypeid });
            }
        }


        // breadcrumb changed from outside
        private setBreadCrumb(eventtypeid: any): void {
            this.commonDataService.getEventTypes()
                .then((data: any) => {
                    if (data && data.length > 0) {
                        var rr = data.filter((d: any) => { return d.id == eventtypeid; }) || [];
                        if (rr.length > 0) {
                            var rdata = { name: rr[0].name, nodetype: 1, id: eventtypeid, eventTypeId: eventtypeid, url: 'base.home.sport.market' };
                            this.$scope.breadcrumb.splice(0);
                            this.$scope.breadcrumb.push(rdata);
                            this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
                        }
                    }
                });
        }

        private openCasino(gameId) {
            this.commonDataService.setGameId(gameId);
            this.$state.go('base.livegames');
        }
    }

    angular.module('intranet.home').controller('sportTreeCtrl', SportTreeCtrl);
}