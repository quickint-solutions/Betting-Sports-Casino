var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class SportTreeCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, $state, localStorageHelper, commonDataService, settings, competitionService, marketOddsService, eventService, marketService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.competitionService = competitionService;
                this.marketOddsService = marketOddsService;
                this.eventService = eventService;
                this.marketService = marketService;
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
            initScopeValues() {
                this.$scope.sportTreeList = [];
                this.$scope.breadcrumb = [];
                this.$scope.isRacing = false;
                this.$scope.selectedHorse = 0;
                this.$scope.liveGamesId = this.settings.LiveGamesId;
                this.$scope.virtualGamesId = this.settings.VirtualGameId;
            }
            loadInitialData() {
                this.loadWebsiteDetail();
                if (this.$state.current.url.indexOf('racing') > -1 || this.$state.current.url.indexOf('upcoming-race') > -1) {
                    this.$scope.isRacing = true;
                }
                this.loadSportBreadcrumb();
                this.loadTreeData();
            }
            loadWebsiteDetail() {
                this.commonDataService.getSupportDetails()
                    .then((data) => {
                    if (data) {
                        this.$scope.hasCasino = data.hasCasino;
                    }
                });
            }
            loadTreeData() {
                var model = { nodeType: null, id: null, eventTypeId: null };
                if (this.$stateParams.nodetype && this.$stateParams.id) {
                    model.nodeType = this.$stateParams.nodetype;
                    model.id = this.$stateParams.id;
                    model.eventTypeId = this.$stateParams.eventTypeId;
                }
                if (this.$scope.isRacing) {
                    if (model.nodeType == 1) {
                        this.marketOddsService.getRaceMarketList(model.id)
                            .success((response) => {
                            if (response.success) {
                                this.$scope.sportTreeList = response.data;
                            }
                        });
                    }
                }
                else {
                    if (model.nodeType == 1) {
                        if (model.id == this.settings.LiveGamesId || model.id == this.settings.VirtualGameId) {
                            this.eventService.searchGames(model.id)
                                .success((response) => {
                                if (response.success) {
                                    this.$scope.sportTreeList = response.data;
                                }
                            });
                        }
                        else {
                            this.eventService.searchCometition(model.id)
                                .success((response) => {
                                if (response.success) {
                                    this.$scope.sportTreeList = response.data;
                                }
                            });
                        }
                    }
                    else if (model.nodeType == 2) {
                        this.eventService.searchEventByCompetition(model.eventTypeId, model.id)
                            .success((response) => {
                            if (response.success) {
                                this.$scope.sportTreeList = response.data;
                            }
                        });
                    }
                    else {
                        this.$scope.breadcrumb.splice(0);
                        this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
                        var eventtypes = this.commonDataService.getEventTypes();
                        eventtypes.then((value) => {
                            if (value && value.length > 0) {
                                value = value.filter((a) => { return a.displayOrder >= 0; });
                            }
                            this.$scope.sportTreeList = value;
                        });
                    }
                }
            }
            loadSportBreadcrumb() {
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
            breadcrumbClick(data) {
                if (data.nodetype) {
                    if (data.nodetype != this.$stateParams.nodetype) {
                        var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.breadcrumb, 'nodetype', data.nodetype);
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
            treeClick(nodetype, id, name, marketid = undefined) {
                var url = 'base.home.sport.market';
                var eventtypeid = (nodetype == 1 ? id : this.$stateParams.eventTypeId);
                if (((id == this.settings.HorseRacingId || id == this.settings.GreyhoundId) && nodetype == 1) || this.$scope.isRacing) {
                    if (this.settings.ThemeName == 'seven' || this.settings.ThemeName == 'lotus') {
                        url = 'base.home.sport.upcomingrace';
                    }
                    else {
                        url = 'base.home.sport.racingmarket';
                    }
                }
                if (id == this.settings.LiveGamesId && nodetype == 1) {
                    url = 'base.home.sport.livegames';
                }
                else if (id == this.settings.VirtualGameId && nodetype == 1) {
                    url = 'base.home.sport.virtualgames';
                }
                if (eventtypeid == this.settings.BinaryId) {
                    url = 'base.home.sport.binarymarket';
                }
                if (marketid) {
                    if (this.$scope.isRacing) {
                        this.$state.go("base.home.sport.upcomingrace", { nodetype: nodetype, id: id, marketid: marketid, eventTypeId: eventtypeid });
                    }
                    if (eventtypeid == this.settings.BinaryId) {
                        this.$state.go("base.home.sport.binarymarket", { nodetype: nodetype, id: id, eventId: marketid, eventTypeId: eventtypeid });
                    }
                    else if (nodetype == 2) {
                        this.$state.go("base.home.sport.fullmarket", { nodetype: nodetype, id: id, eventId: marketid, eventTypeId: eventtypeid });
                    }
                }
                else {
                    var data = { name: name, nodetype: nodetype, id: id, url: url, eventTypeId: eventtypeid };
                    var index = intranet.common.helpers.Utility.IndexOfObject(this.$scope.breadcrumb, 'nodetype', data.nodetype);
                    if (index > -1) {
                        this.$scope.breadcrumb.splice(index);
                    }
                    this.$scope.breadcrumb.push(data);
                    this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
                    this.$state.go(url, { nodetype: nodetype, id: id, eventTypeId: eventtypeid });
                }
            }
            setBreadCrumb(eventtypeid) {
                this.commonDataService.getEventTypes()
                    .then((data) => {
                    if (data && data.length > 0) {
                        var rr = data.filter((d) => { return d.id == eventtypeid; }) || [];
                        if (rr.length > 0) {
                            var rdata = { name: rr[0].name, nodetype: 1, id: eventtypeid, eventTypeId: eventtypeid, url: 'base.home.sport.market' };
                            this.$scope.breadcrumb.splice(0);
                            this.$scope.breadcrumb.push(rdata);
                            this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
                        }
                    }
                });
            }
            openCasino(gameId) {
                this.commonDataService.setGameId(gameId);
                this.$state.go('base.livegames');
            }
        }
        home.SportTreeCtrl = SportTreeCtrl;
        angular.module('intranet.home').controller('sportTreeCtrl', SportTreeCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SportTreeCtrl.js.map