module intranet.home {

    export interface IVirtualGamesScope extends intranet.common.IScopeBase {
        gameList: any[];
    }

    export class VirtualGamesCtrl extends intranet.common.ControllerBase<IVirtualGamesScope>
        implements intranet.common.init.IInit {
        constructor($scope: IVirtualGamesScope,
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

    angular.module('intranet.home').controller('virtualGamesCtrl', VirtualGamesCtrl);
}