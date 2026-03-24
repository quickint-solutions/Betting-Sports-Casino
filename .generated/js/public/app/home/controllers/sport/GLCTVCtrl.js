var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class GLCTVCtrl extends intranet.common.ControllerBase {
            constructor($scope, $sce, settings, videoService) {
                super($scope);
                this.$sce = $sce;
                this.settings = settings;
                this.videoService = videoService;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.videoList = [];
            }
            loadInitialData() {
                this.loadVideoDetails();
            }
            loadVideoDetails() {
                this.videoService.getAllVideosDetail()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.videoList = response.data;
                        if (this.$scope.videoList.length > 0) {
                            var hasChannel = false;
                            this.$scope.videoList.forEach((vd) => {
                                if (!hasChannel) {
                                    if (vd.video) {
                                        vd.video.forEach((v) => {
                                            if (v.streamName && !hasChannel) {
                                                hasChannel = true;
                                                vd.active = true;
                                                this.setStream(v);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
            setStream(source) {
                this.$scope.wcs_video = source;
            }
        }
        home.GLCTVCtrl = GLCTVCtrl;
        angular.module('intranet.home').controller('gLCTVCtrl', GLCTVCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=GLCTVCtrl.js.map