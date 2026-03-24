var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class HorseHighlightCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, marketOddsService, $timeout, settings, localStorageHelper, commonDataService, $q) {
                super($scope);
                this.$stateParams = $stateParams;
                this.marketOddsService = marketOddsService;
                this.$timeout = $timeout;
                this.settings = settings;
                this.localStorageHelper = localStorageHelper;
                this.commonDataService = commonDataService;
                this.$q = $q;
                this.$scope.$on('$destroy', () => {
                    this.$timeout.cancel(this.$scope.timer_horsehighlight);
                });
                super.init(this);
            }
            initScopeValues() {
                this.$scope.currentTab = 0;
                this.$scope.showTab = true;
            }
            loadInitialData() {
                this.loadHighlightsBasedOnURL();
                this.setBannerPath();
            }
            loadHighlightsBasedOnURL(day = 0) {
                var model = { nodeType: null, id: null, day: 0 };
                if (this.$stateParams.nodetype && this.$stateParams.id) {
                    model.nodeType = this.$stateParams.nodetype;
                    model.id = this.$stateParams.id;
                    model.day = day;
                    this.$scope.currentTab = day;
                    if (model.nodeType == 4) {
                        this.$scope.showTab = false;
                    }
                }
                this.loadHighlightsBySportNodeType(model);
            }
            loadHighlightsBySportNodeType(model) {
                if (this.$scope.timer_horsehighlight) {
                    this.$timeout.cancel(this.$scope.timer_horsehighlight);
                }
                var defer = this.$q.defer();
                if (model.nodeType == 1) {
                    this.marketOddsService.getHorseHighlightbyEventTypeId(model.id, model.day)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.highlights = response.data;
                        }
                    }).finally(() => { defer.resolve(); });
                }
                else if (model.nodeType == 4) {
                    this.marketOddsService.getHorseHighlightbyEventId(model.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.highlights = response.data;
                        }
                    }).finally(() => { defer.resolve(); });
                }
                defer.promise.finally(() => {
                    if (this.$scope.highlights.length > 0) {
                        this.$scope.selectedCountry = this.$scope.highlights[0].name;
                    }
                    if (!this.$scope.$$destroyed) {
                        this.$scope.timer_horsehighlight = this.$timeout(() => {
                            this.loadHighlightsBySportNodeType(model);
                        }, 60000);
                    }
                });
            }
            setBannerPath() {
                var setDefault = (() => {
                    if (this.settings.WebApp == 'top365') {
                        this.$scope.bannerPath = this.settings.ImagePath + 'top-cover/highlight.jpg';
                    }
                    else {
                        this.$scope.bannerPath = this.settings.ImagePath + 'images/highlight.jpg';
                    }
                });
                var breadcumb = this.localStorageHelper.get(this.settings.SportTreeHeader);
                if (this.$stateParams.nodetype && breadcumb && breadcumb.length > 0) {
                    this.commonDataService.getEventTypes().then((value) => {
                        if (value) {
                            var eventtype = value.filter((a) => { return a.id == breadcumb[0].id; });
                            if (eventtype.length > 0) {
                                if (eventtype[0].coverImg) {
                                    this.$scope.bannerPath = this.settings.ImagePath + eventtype[0].coverImg;
                                }
                                else {
                                    setDefault();
                                }
                            }
                            else {
                                setDefault();
                            }
                        }
                        else {
                            setDefault();
                        }
                    });
                }
                else {
                    setDefault();
                }
            }
        }
        home.HorseHighlightCtrl = HorseHighlightCtrl;
        angular.module('intranet.home').controller('horseHighlightCtrl', HorseHighlightCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=HorseHighlightCtrl.js.map