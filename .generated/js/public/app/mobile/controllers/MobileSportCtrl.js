var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class MobileSportsCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, $state, $window, $sce, localStorageHelper, commonDataService, settings, eventService, marketService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.$window = $window;
                this.$sce = $sce;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.settings = settings;
                this.eventService = eventService;
                this.marketService = marketService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.sportTreeList = [];
                this.$scope.isHorseRacing = false;
                this.$scope.quickLinks = [];
                this.$scope.imgPath = this.settings.ImagePath;
            }
            loadInitialData() {
                this.loadWebsiteDetail();
                if (this.$stateParams.page == 'horse') {
                    this.$scope.isHorseRacing = true;
                }
                this.loadQuickLinks();
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
            loadQuickLinks() {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value) => {
                    this.$scope.quickLinks = value;
                });
            }
            loadTreeData() {
                var model = { nodeType: null, id: null };
                if (this.$stateParams.nodetype && this.$stateParams.id) {
                    model.nodeType = this.$stateParams.nodetype;
                    model.id = this.$stateParams.id;
                }
                if (model.nodeType == 1) {
                    if (model.id == this.settings.LiveGamesId) {
                        this.eventService.searchGames(model.id)
                            .success((response) => {
                            if (response.success) {
                                this.$scope.sportTreeList = response.data;
                            }
                        });
                    }
                    else {
                        this.eventService.searchEvent(model.id)
                            .success((response) => {
                            if (response.success) {
                                this.$scope.sportTreeList = response.data;
                            }
                        });
                    }
                }
                else if (model.nodeType == 4) {
                    this.marketService.getMarketByEventId(model.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
                }
                else {
                    var eventtypes = this.commonDataService.getEventTypes();
                    eventtypes.then((value) => {
                        this.$scope.sportTreeList = value;
                    });
                }
            }
            treeClick(nodetype, id, name, marketid = undefined) {
                var url = 'mobile.base.sports';
                var params = { nodetype: nodetype, id: id };
                if ((nodetype == 1 && id == this.settings.HorseRacingId) || this.$scope.isHorseRacing) {
                    params.page = 'horse';
                }
                if (marketid) {
                    if (this.$scope.isHorseRacing) {
                        this.$state.go("mobile.base.horsemarket", { marketid: marketid });
                    }
                    else {
                        this.$state.go("mobile.base.market", { marketid: marketid });
                    }
                }
                else {
                    this.$state.go(url, params);
                }
            }
        }
        mobile.MobileSportsCtrl = MobileSportsCtrl;
        angular.module('intranet.mobile').controller('mobileSportsCtrl', MobileSportsCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileSportCtrl.js.map