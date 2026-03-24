var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class SASportTreeCtrl extends intranet.common.ControllerBase {
            constructor($scope, localStorageHelper, $location, $stateParams, $state, eventTypeService, competitionService, eventService, settings) {
                super($scope);
                this.localStorageHelper = localStorageHelper;
                this.$location = $location;
                this.$stateParams = $stateParams;
                this.$state = $state;
                this.eventTypeService = eventTypeService;
                this.competitionService = competitionService;
                this.eventService = eventService;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.sportTreeList = [];
                this.$scope.breadcrumb = [];
            }
            loadInitialData() {
                this.loadSportBreadcrumb();
                this.loadTreeData();
            }
            loadSportBreadcrumb() {
                if (this.$stateParams.nodetype) {
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
            loadTreeData() {
                var model = { nodeType: null, id: null };
                if (this.$stateParams.nodetype && this.$stateParams.id) {
                    model.nodeType = this.$stateParams.nodetype;
                    model.id = this.$stateParams.id;
                }
                if (model.nodeType == 1) {
                    this.eventService.searchEvent(model.id)
                        .success((response) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
                }
                else {
                    this.eventTypeService.getEventTypes()
                        .success((response) => {
                        this.$scope.sportTreeList = response.data;
                    });
                }
            }
            treeClick(nodetype, id, name) {
                var url = 'admin.commentary.sport';
                if (nodetype == 4) {
                    this.$state.go("admin.commentary.sport.manage", { nodetype: 1, id: this.$stateParams.id, eventId: id, eventName: name });
                }
                else {
                    var data = { name: name, nodetype: nodetype, id: id, url: url };
                    this.$scope.breadcrumb.push(data);
                    this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
                    this.$state.go(url, { nodetype: nodetype, id: id });
                }
            }
        }
        admin.SASportTreeCtrl = SASportTreeCtrl;
        angular.module('intranet.admin').controller('sASportTreeCtrl', SASportTreeCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=SASportTreeCtrl.js.map