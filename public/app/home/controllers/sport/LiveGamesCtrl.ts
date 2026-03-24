module intranet.home {

    export interface ILiveGamesScope extends intranet.common.IScopeBase {
        gameList: any[];
        webImagePath: any;
    }

    export class LiveGamesCtrl extends intranet.common.ControllerBase<ILiveGamesScope>
        implements intranet.common.init.IInit {
        constructor($scope: ILiveGamesScope,
            private $stateParams: any,
            private settings: common.IBaseSettings,
            private eventService: services.EventService) {
            super($scope);

            super.init(this);
        }


        public initScopeValues() {
            this.$scope.gameList = [];
            this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
        }

        public loadInitialData() {
            this.searchEvent();
        }

        private searchEvent(): void {
            this.eventService.searchGames(this.settings.LiveGamesId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.gameList = response.data;
                        this.$scope.gameList.forEach((g: any) => {
                            g.imagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/' + g.name.replaceAll(' ', '-').replace('(', '').replace(')', '') + '.jpg';
                            if (g.sourceId) g.cls = g.sourceId;

                        });
                    }
                });
        }

    }

    angular.module('intranet.home').controller('liveGamesCtrl', LiveGamesCtrl);
}