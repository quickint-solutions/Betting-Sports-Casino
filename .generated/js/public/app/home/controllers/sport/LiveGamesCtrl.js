var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class LiveGamesCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, settings, eventService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.settings = settings;
                this.eventService = eventService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.gameList = [];
                this.$scope.webImagePath = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/';
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
                            if (g.sourceId)
                                g.cls = g.sourceId;
                        });
                    }
                });
            }
        }
        home.LiveGamesCtrl = LiveGamesCtrl;
        angular.module('intranet.home').controller('liveGamesCtrl', LiveGamesCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LiveGamesCtrl.js.map