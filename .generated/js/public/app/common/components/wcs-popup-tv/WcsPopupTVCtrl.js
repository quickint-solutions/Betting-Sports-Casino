var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class WcsPopupTVCtrl extends intranet.common.ControllerBase {
            constructor($scope, $stateParams, videoService) {
                super($scope);
                this.$stateParams = $stateParams;
                this.videoService = videoService;
                super.init(this);
            }
            loadInitialData() {
                this.loadVideoDetails();
            }
            loadVideoDetails() {
                this.videoService.getVideoByEvent(this.$stateParams.eventId)
                    .success((response) => {
                    if (response.success) {
                        if (response.data && response.data.streamName) {
                            this.$scope.wcs_video = response.data;
                        }
                    }
                });
            }
        }
        home.WcsPopupTVCtrl = WcsPopupTVCtrl;
        angular.module('intranet.home').controller('wcsPopupTVCtrl', WcsPopupTVCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=WcsPopupTVCtrl.js.map