var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SAPositionTreeCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, $state, $filter, $sce, $window, localStorageHelper, settings, positionService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.$filter = $filter;
                this.$sce = $sce;
                this.$window = $window;
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                this.positionService = positionService;
                var refreshPinnedMarket = this.$scope.$on("market-pin-changed-from-position", (event, data) => {
                    this.reflectPinChanges(data);
                    if (this.$stateParams.nodetype == 4) {
                        this.$scope.sportTreeList.forEach((m) => { if (m.id == data.id) {
                            m.pin = data.pin;
                        } });
                    }
                });
                this.$scope.$on('$destroy', () => {
                    refreshPinnedMarket();
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.sportTreeList = [];
                this.$scope.breadcrumb = [];
                this.$scope.pinnedMarkets = [];
                this.$scope.showAllEvents = this.localStorageHelper.get('showall_sport');
            }
            loadInitialData() {
                this.loadPinnedMarkets();
                this.loadSportBreadcrumb();
                this.loadTreeData();
            }
            loadSportBreadcrumb() {
                if (this.$stateParams.nodetype && !this.$state.params['marketid']) {
                    var tree = this.localStorageHelper.get(this.settings.SportTreeHeader);
                    if (tree) {
                        this.$scope.breadcrumb = tree;
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
            }
            openFullPositionView(event, marketId) {
                if (event) {
                    event.stopPropagation();
                }
                var url = this.$state.href('admin.fullposition', { marketid: marketId });
                this.$window.open(this.$sce.trustAsUrl(url));
            }
            loadPinnedMarkets() {
                var pinned = this.localStorageHelper.get(this.settings.BookMarketPin);
                if (pinned) {
                    this.$scope.pinnedMarkets = pinned;
                }
            }
            isMarketPinned(marketid) {
                return this.$scope.pinnedMarkets.some((m) => { return m == marketid; });
            }
            reflectPinChanges(market) {
                if (market.pin) {
                    this.$scope.pinnedMarkets.push(market.id);
                }
                else {
                    var index = this.$scope.pinnedMarkets.indexOf(market.id);
                    if (index > -1) {
                        this.$scope.pinnedMarkets.splice(index, 1);
                    }
                }
            }
            pinMe(market) {
                market.pin = !market.pin;
                if (market.pin) {
                    this.localStorageHelper.setInArray(this.settings.BookMarketPin, market.id);
                    this.$scope.pinnedMarkets.push(market.id);
                }
                else {
                    this.removePin(market.id);
                }
                this.informToPosition(market);
            }
            removePin(marketid) {
                this.localStorageHelper.removeFromArray(this.settings.BookMarketPin, marketid);
                var index = this.$scope.pinnedMarkets.indexOf(marketid);
                if (index > -1) {
                    this.$scope.pinnedMarkets.splice(index, 1);
                }
            }
            informToPosition(market) {
                this.$scope.$emit('market-pin-changed-from-tree', { id: market.id, pin: market.pin });
            }
            filterTreeData() {
                if (this.$scope.showAllEvents) {
                    return this.$scope.sportTreeList;
                }
                else {
                    return this.$scope.sportTreeList.filter((s) => { return s.pl != 0; });
                }
            }
            loadTreeData(showAll = false) {
                var model = { nodeType: null, id: null };
                if (this.$stateParams.nodetype && this.$stateParams.id) {
                    model.nodeType = this.$stateParams.nodetype;
                    model.id = this.$stateParams.id;
                }
                if (model.nodeType == 1) {
                    this.positionService.getEventPositionbyId(model.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
                }
                else if (model.nodeType == 4) {
                    this.positionService.getMarketPositionbyId(model.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
                }
                else {
                    this.positionService.getEventTypePosition()
                        .success((response) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
                }
            }
            treeClick(sport) {
                this.localStorageHelper.set('showall_sport', this.$scope.showAllEvents);
                var url = 'admin.position.sport';
                var nodetype = sport.sportNodeType;
                var id = sport.id;
                var name = sport.name;
                var opendate = null;
                if (sport.sportNodeType == 4) {
                    opendate = this.$filter('date')(sport.openDate, 'dd-MM-yyyy hh:mm a');
                }
                var data = { name: name, nodetype: nodetype, id: id, url: url, date: opendate };
                this.$scope.breadcrumb.push(data);
                this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
                this.$state.go(url, { nodetype: nodetype, id: id });
            }
        }
        admin.SAPositionTreeCtrl = SAPositionTreeCtrl;
        angular.module('intranet.admin').controller('sAPositionTreeCtrl', SAPositionTreeCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SAPositionTreeCtrl.js.map