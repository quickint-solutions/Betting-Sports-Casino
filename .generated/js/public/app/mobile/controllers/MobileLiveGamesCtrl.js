var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class MobileLiveGamesCtrl extends intranet.common.ControllerBase {
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
        mobile.MobileLiveGamesCtrl = MobileLiveGamesCtrl;
        angular.module('intranet.mobile').controller('mobileLiveGamesCtrl', MobileLiveGamesCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=MobileLiveGamesCtrl.js.map