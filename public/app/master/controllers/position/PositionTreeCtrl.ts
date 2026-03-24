module intranet.master {
    export interface IPositionTreeScope extends intranet.common.IScopeBase {
        sportTreeList: any[];
        breadcrumb: any[];
        showAllEvents: boolean;

        pinnedMarkets: any[];
    }

    export class PositionTreeCtrl extends intranet.common.ControllerBase<IPositionTreeScope>
        implements intranet.common.init.IInit {
        constructor($scope: IPositionTreeScope,
            private $stateParams: any,
            private $state: any,
            private $filter: any,
            private $sce: any,
            private $window: any,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: common.IBaseSettings,
            private positionService: services.PositionService) {
            super($scope);

            var refreshPinnedMarket = this.$scope.$on("market-pin-changed-from-position", (event, data) => {
                this.reflectPinChanges(data);
                if (this.$stateParams.nodetype == common.enums.SportNodeType.Event) {
                    this.$scope.sportTreeList.forEach((m: any) => { if (m.id == data.id) { m.pin = data.pin; } });
                }
            });

            this.$scope.$on('$destroy', () => {
                refreshPinnedMarket();
            });

            super.init(this);
        }

        public initScopeValues() {
            this.$scope.sportTreeList = [];
            this.$scope.breadcrumb = [];
            this.$scope.pinnedMarkets = [];
            this.$scope.showAllEvents = this.localStorageHelper.get('showall_sport');
        }

        public loadInitialData() {
            this.loadPinnedMarkets();
            this.loadSportBreadcrumb();
            this.loadTreeData();
        }


        private loadSportBreadcrumb(): void {
            if (this.$stateParams.nodetype && !this.$state.params['marketid']) {
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

        private openFullPositionView(event: any, eventid: any, marketid: any): void {
            if (event) { event.stopPropagation(); }
            var url = this.$state.href('master.fullposition', { eventid: eventid, marketid: marketid });
            this.$window.open(this.$sce.trustAsUrl(url));
        }

        private loadPinnedMarkets(): void {
            var pinned = this.localStorageHelper.get(this.settings.BookMarketPin);
            if (pinned) {
                this.$scope.pinnedMarkets = pinned;
            }
        }

        private isMarketPinned(marketid: any): any {
            return this.$scope.pinnedMarkets.some((m: any) => { return m == marketid; });
        }

        private reflectPinChanges(market: any): void {
            if (market.pin) {
                this.$scope.pinnedMarkets.push(market.id);
            }
            else {
                var index = this.$scope.pinnedMarkets.indexOf(market.id);
                if (index > -1) { this.$scope.pinnedMarkets.splice(index, 1); }
            }
        }

        private pinMe(market: any): void {
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

        private removePin(marketid: any): void {
            this.localStorageHelper.removeFromArray(this.settings.BookMarketPin, marketid);
            var index = this.$scope.pinnedMarkets.indexOf(marketid);
            if (index > -1) { this.$scope.pinnedMarkets.splice(index, 1); }
        }

        private informToPosition(market: any): void {
            this.$scope.$emit('market-pin-changed-from-tree', { id: market.id, pin: market.pin });
        }

        private filterTreeData() {
            if (this.$scope.showAllEvents) {
                return this.$scope.sportTreeList;
            } else {
                return this.$scope.sportTreeList.filter((s: any) => { return s.pl != 0; });
            }

        }

        private loadTreeData(showAll: boolean = false): void {
            var model = { nodeType: null, id: null };
            if (this.$stateParams.nodetype && this.$stateParams.id) {
                model.nodeType = this.$stateParams.nodetype;
                model.id = this.$stateParams.id;
            }

            if (model.nodeType == common.enums.SportNodeType.EventType) {
                this.positionService.getEventPositionbyId(model.id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
            }
            else if (model.nodeType == common.enums.SportNodeType.Event) {
                this.positionService.getMarketPositionbyId(model.id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
            } else {
                this.positionService.getEventTypePosition()
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
            }

        }

        private treeClick(sport: any): void {

            this.localStorageHelper.set('showall_sport', this.$scope.showAllEvents);

            var url = 'master.position.sport';
            var nodetype = sport.sportNodeType;
            var id = sport.id;
            var name = sport.name;

            var opendate = null;
            if (sport.sportNodeType == common.enums.SportNodeType.Event) {
                opendate = this.$filter('date')(sport.openDate, 'dd-MM-yyyy hh:mm a');
            }

            var data = { name: name, nodetype: nodetype, id: id, url: url, date: opendate };
            this.$scope.breadcrumb.push(data);
            this.localStorageHelper.set(this.settings.SportTreeHeader, this.$scope.breadcrumb);
            this.$state.go(url, { nodetype: nodetype, id: id });
        }
    }

    angular.module('intranet.master').controller('positionTreeCtrl', PositionTreeCtrl);
}