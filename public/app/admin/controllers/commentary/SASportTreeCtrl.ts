module intranet.admin {

    export interface ISASportTreeScope extends intranet.common.IScopeBase {
        sportTreeList: any[];
        breadcrumb: any[];
    }

    export class SASportTreeCtrl extends intranet.common.ControllerBase<ISASportTreeScope>
        implements common.init.IInit {
        constructor($scope: ISASportTreeScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private $location: any,
            private $stateParams: any,
            private $state: any,
            private eventTypeService: services.EventTypeService,
            private competitionService: services.CompetitionService,
            private eventService: services.EventService,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.sportTreeList = [];
            this.$scope.breadcrumb = [];
        }

        public loadInitialData(): void {
            this.loadSportBreadcrumb();
            this.loadTreeData();
        }

        private loadSportBreadcrumb(): void {
            if (this.$stateParams.nodetype) {
                var tree = this.localStorageHelper.get(this.settings.SportTreeHeader);
                if (tree) {
                    this.$scope.breadcrumb = tree;
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
        }

        private loadTreeData(): void {
            var model = { nodeType: null, id: null };
            if (this.$stateParams.nodetype && this.$stateParams.id) {
                model.nodeType = this.$stateParams.nodetype;
                model.id = this.$stateParams.id;
            }

            if (model.nodeType == common.enums.SportNodeType.EventType) {
                this.eventService.searchEvent(model.id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
            }
             else {
                this.eventTypeService.getEventTypes()
                    .success((response: common.messaging.IResponse<any>) => {
                        this.$scope.sportTreeList = response.data;
                    });
            }

        }

        private treeClick(nodetype: any, id: any, name: any): void {
            var url = 'admin.commentary.sport';

            if (nodetype == common.enums.SportNodeType.Event) {
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
    angular.module('intranet.admin').controller('sASportTreeCtrl', SASportTreeCtrl);
}