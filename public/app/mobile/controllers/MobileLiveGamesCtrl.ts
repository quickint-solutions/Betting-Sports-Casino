module intranet.mobile {

    export interface IMobileLiveGamesScope extends intranet.common.IScopeBase {
        gameList: any[];
    }

    export class MobileLiveGamesCtrl extends intranet.common.ControllerBase<IMobileLiveGamesScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMobileLiveGamesScope,
            private $stateParams: any,
            private settings: common.IBaseSettings,
            private eventService: services.EventService) {
            super($scope);

            super.init(this);
        }


        public initScopeValues() {
            this.$scope.gameList = [];
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

                        });
                    }
                });
        }

    }

    angular.module('intranet.mobile').controller('mobileLiveGamesCtrl', MobileLiveGamesCtrl);
}