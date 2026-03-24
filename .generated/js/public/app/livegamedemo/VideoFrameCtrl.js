var intranet;
(function (intranet) {
    var livegamedemo;
    (function (livegamedemo) {
        class VideoFrameCtrl extends intranet.common.ControllerBase {
            constructor($scope, $sce, isMobile, $location, localStorageHelper, settings) {
                super($scope);
                this.$sce = $sce;
                this.isMobile = isMobile;
                this.$location = $location;
                this.localStorageHelper = localStorageHelper;
                this.settings = settings;
                super.init(this);
            }
            initScopeValues() {
                if (this.$location.$$search.url && this.$location.$$search.streamname) {
                    this.$scope.wcs_video = {
                        url: this.$location.$$search.url,
                        streamName: this.$location.$$search.streamname,
                        videoSource: this.$location.$$search.videoSource
                    };
                }
            }
        }
        livegamedemo.VideoFrameCtrl = VideoFrameCtrl;
        angular.module('intranet.livegamedemo').controller('videoFrameCtrl', VideoFrameCtrl);
    })(livegamedemo = intranet.livegamedemo || (intranet.livegamedemo = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=VideoFrameCtrl.js.map