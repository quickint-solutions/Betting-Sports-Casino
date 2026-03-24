var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class SevenSportsCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, commonDataService, eventService, marketOddsService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.commonDataService = commonDataService;
                this.eventService = eventService;
                this.marketOddsService = marketOddsService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.sportTreeList = [];
            }
            loadInitialData() {
                this.loadHighlightsBasedOnURL();
            }
            loadHighlightsBasedOnURL() {
                var model = { nodeType: null, id: null };
                if (this.$stateParams.nodetype && this.$stateParams.id) {
                    model.nodeType = this.$stateParams.nodetype;
                    model.id = this.$stateParams.id;
                    model.eventTypeId = this.$stateParams.eventTypeId;
                }
                this.loadHighlightsBySportNodeType(model);
                this.loadTreeData(model);
            }
            loadHighlightsBySportNodeType(model) {
                if (model.nodeType == 1) {
                    var promise;
                    promise = this.marketOddsService.getHighlightbyEventTypeId(model.id);
                    this.commonDataService.addMobilePromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.highlights = response.data;
                        }
                    });
                }
            }
            loadTreeData(model) {
                if (model.nodeType == 1) {
                    var promise;
                    promise = this.eventService.searchCometition(model.id);
                    this.commonDataService.addMobilePromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
                }
                else if (model.nodeType == 2) {
                    var promise;
                    promise = this.eventService.searchEventByCompetition(this.$stateParams.eventTypeId, model.id);
                    this.commonDataService.addMobilePromise(promise);
                    promise.success((response) => {
                        if (response.success) {
                            this.$scope.sportTreeList = intranet.common.helpers.CommonHelper.groupByDate(response.data, 'openDate');
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
        }
        mobile.SevenSportsCtrl = SevenSportsCtrl;
        angular.module('intranet.mobile').controller('sevenSportsCtrl', SevenSportsCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SevenSportCtrl.js.map