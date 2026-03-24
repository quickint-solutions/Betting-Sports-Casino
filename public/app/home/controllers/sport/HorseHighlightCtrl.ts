module intranet.home {

    export interface IHorseHighlightScope extends intranet.common.IScopeBase {
        highlights: any[];
        timer_horsehighlight: any;
        currentTab: number;
        showTab: boolean;
        bannerPath: string;

        selectedCountry: any;
    }

    export class HorseHighlightCtrl extends intranet.common.ControllerBase<IHorseHighlightScope>
        implements intranet.common.init.IInit {
        constructor($scope: IHorseHighlightScope,
            private $stateParams: any,
            private marketOddsService: services.MarketOddsService,
            private $timeout: ng.ITimeoutService,
            private settings: common.IBaseSettings,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private commonDataService: common.services.CommonDataService,
            private $q: ng.IQService) {
            super($scope);

            this.$scope.$on('$destroy', () => {
                this.$timeout.cancel(this.$scope.timer_horsehighlight);
            });
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.currentTab = 0;
            this.$scope.showTab = true;
        }

        public loadInitialData() {
            this.loadHighlightsBasedOnURL();
            this.setBannerPath();
        }

        // decide node type from state param and load market list
        private loadHighlightsBasedOnURL(day: number = 0): void {
            var model = { nodeType: null, id: null, day: 0 };
            if (this.$stateParams.nodetype && this.$stateParams.id) {
                model.nodeType = this.$stateParams.nodetype;
                model.id = this.$stateParams.id;
                model.day = day;
                this.$scope.currentTab = day;
                if (model.nodeType == common.enums.SportNodeType.Event) {
                    this.$scope.showTab = false;
                }
            }
            this.loadHighlightsBySportNodeType(model);
        }

        // load market list based on sport node type and user clicked event type
        private loadHighlightsBySportNodeType(model: any): void {
            if (this.$scope.timer_horsehighlight) { this.$timeout.cancel(this.$scope.timer_horsehighlight); }
            var defer = this.$q.defer();

            if (model.nodeType == common.enums.SportNodeType.EventType) {
                this.marketOddsService.getHorseHighlightbyEventTypeId(model.id, model.day)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) { this.$scope.highlights = response.data; }
                    }).finally(() => { defer.resolve(); });
            }

            else if (model.nodeType == common.enums.SportNodeType.Event) {
                this.marketOddsService.getHorseHighlightbyEventId(model.id)
                    .success((response: common.messaging.IResponse<any>) => {
                        if (response.success) { this.$scope.highlights = response.data; }
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

        private setBannerPath(): void {

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
                this.commonDataService.getEventTypes().then((value: any) => {
                    if (value) {
                        var eventtype = value.filter((a: any) => { return a.id == breadcumb[0].id; });
                        if (eventtype.length > 0) {
                            if (eventtype[0].coverImg) {
                                this.$scope.bannerPath = this.settings.ImagePath + eventtype[0].coverImg;
                            } else { setDefault(); }
                        } else { setDefault(); }
                    } else { setDefault(); }
                });
            } else {
                setDefault();
            }
        }

    }
    angular.module('intranet.home').controller('horseHighlightCtrl', HorseHighlightCtrl);
}