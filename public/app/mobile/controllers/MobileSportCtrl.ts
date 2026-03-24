module intranet.mobile {
    export interface IMobileSportsScope extends intranet.common.IScopeBase {
        sportTreeList: any[];
        isHorseRacing: boolean;
        quickLinks: any[];
        imgPath: string;
        hasCasino: boolean;
    }

    export class MobileSportsCtrl extends intranet.common.ControllerBase<IMobileSportsScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileSportsScope,
            private $stateParams: any,
            private $state: any,
            private $window: any,
            private $sce: any,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private commonDataService: common.services.CommonDataService,
            private settings: common.IBaseSettings,
            private eventService: services.EventService,
            private marketService: services.MarketService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.sportTreeList = [];
            this.$scope.isHorseRacing = false;
            this.$scope.quickLinks = [];
            this.$scope.imgPath = this.settings.ImagePath;
        }

        public loadInitialData() {
            this.loadWebsiteDetail();
            if (this.$stateParams.page == 'horse') {
                this.$scope.isHorseRacing = true;
            }
            this.loadQuickLinks();
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

        private loadQuickLinks(): void {
            var eventtypes = this.commonDataService.getEventTypes();
            eventtypes.then((value: any) => {
                this.$scope.quickLinks = value;
            });
        }

        private loadTreeData(): void {
            var model = { nodeType: null, id: null };
            if (this.$stateParams.nodetype && this.$stateParams.id) {
                model.nodeType = this.$stateParams.nodetype;
                model.id = this.$stateParams.id;
            }

            if (model.nodeType == common.enums.SportNodeType.EventType) {
                if (model.id == this.settings.LiveGamesId) {
                    this.eventService.searchGames(model.id)
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.$scope.sportTreeList = response.data;
                            }
                        });
                } else {
                    this.eventService.searchEvent(model.id)
                        .success((response: common.messaging.IResponse<any>) => {
                            if (response.success) {
                                this.$scope.sportTreeList = response.data;
                            }
                        });
                }
            }
            else if (model.nodeType == common.enums.SportNodeType.Event) {
                this.marketService.getMarketByEventId(model.id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.sportTreeList = response.data;
                        }
                    });
            } else {
                var eventtypes = this.commonDataService.getEventTypes();
                eventtypes.then((value: any) => {
                    this.$scope.sportTreeList = value;
                });
            }

        }

        private treeClick(nodetype: any, id: any, name: any, marketid: any = undefined): void {
            var url = 'mobile.base.sports';
            var params: any = { nodetype: nodetype, id: id };

            if ((nodetype == 1 && id == this.settings.HorseRacingId) || this.$scope.isHorseRacing) {
                params.page = 'horse';
            }

            if (marketid) {
                if (this.$scope.isHorseRacing) {
                    this.$state.go("mobile.base.horsemarket", { marketid: marketid });
                } else {
                    this.$state.go("mobile.base.market", { marketid: marketid });
                }
            }
            else {
                this.$state.go(url, params);
            }
        }

    }

    angular.module('intranet.mobile').controller('mobileSportsCtrl', MobileSportsCtrl);
}