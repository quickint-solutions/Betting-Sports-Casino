module intranet.mobile {
    export interface ISevenSportsScope extends intranet.common.IScopeBase {
        sportTreeList: any[];
        highlights: any[];
    }

    export class SevenSportsCtrl extends intranet.common.ControllerBase<ISevenSportsScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISevenSportsScope,
            private $stateParams: any,
            private commonDataService: common.services.CommonDataService,
            private eventService: services.EventService,
            private marketOddsService: services.MarketOddsService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.sportTreeList = [];
        }

        public loadInitialData() {
            this.loadHighlightsBasedOnURL();
        }

        private loadHighlightsBasedOnURL(): void {
            var model: any = { nodeType: null, id: null };
            if (this.$stateParams.nodetype && this.$stateParams.id) {
                model.nodeType = this.$stateParams.nodetype;
                model.id = this.$stateParams.id;
                model.eventTypeId = this.$stateParams.eventTypeId;
            }
            this.loadHighlightsBySportNodeType(model);
            this.loadTreeData(model);
        }

        private loadHighlightsBySportNodeType(model: any): void {
            if (model.nodeType == common.enums.SportNodeType.EventType) {
                var promise: any;
                promise = this.marketOddsService.getHighlightbyEventTypeId(model.id);
                this.commonDataService.addMobilePromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                    if (response.success) { this.$scope.highlights = response.data; }
                });
            }
        }


        private loadTreeData(model: any): void {
            if (model.nodeType == common.enums.SportNodeType.EventType) {
                var promise: any;
                promise = this.eventService.searchCometition(model.id);
                this.commonDataService.addMobilePromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
            }

            else if (model.nodeType == common.enums.SportNodeType.Competition) {
                var promise: any;
                promise = this.eventService.searchEventByCompetition(this.$stateParams.eventTypeId, model.id);
                this.commonDataService.addMobilePromise(promise);
                promise.success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.sportTreeList = common.helpers.CommonHelper.groupByDate(response.data, 'openDate');
                        }
                    });
            } else {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value: any) => {
                    this.$scope.sportTreeList = value;
                });
            }

        }

    }

    angular.module('intranet.mobile').controller('sevenSportsCtrl', SevenSportsCtrl);
}