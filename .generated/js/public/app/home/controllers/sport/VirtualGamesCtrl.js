var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class VirtualGamesCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, settings, eventService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.settings = settings;
                this.eventService = eventService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.gameList = [];
            }
            loadInitialData() {
                this.searchEvent();
            }
            searchEvent() {
                this.eventService.searchGames(this.settings.LiveGamesId)
                    .success((response) => {
                    if (response.success) {
                        this.$scope.gameList = response.data;
                        this.$scope.gameList.forEach((g) => {
                            g.imagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/' + g.name.replaceAll(' ', '-').replace('(', '').replace(')', '') + '.jpg';
                        });
                    }
                });
            }
        }
        home.VirtualGamesCtrl = VirtualGamesCtrl;
        angular.module('intranet.home').controller('virtualGamesCtrl', VirtualGamesCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=VirtualGamesCtrl.js.map