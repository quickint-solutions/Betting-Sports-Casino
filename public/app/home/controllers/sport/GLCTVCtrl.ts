module intranet.home {
    export interface IGLCTVScope extends intranet.common.IScopeBase {
        videoList: any[];
        activeEvent: any;
        wcs_video: any;
    }

    export class GLCTVCtrl extends intranet.common.ControllerBase<IGLCTVScope>
        implements intranet.common.init.IInit {
        constructor($scope: IGLCTVScope,
            private $sce:any,
            private settings: intranet.common.IBaseSettings,
            private videoService: services.VideoService) {
            super($scope);
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.videoList = [];
            // this.setStream("http://5.101.139.34:1935/fun/myStream/playlist.m3u8");
        }

        public loadInitialData(): void {
            this.loadVideoDetails();
        }

        public loadVideoDetails(): void {
            this.videoService.getAllVideosDetail()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.videoList = response.data;
                        if (this.$scope.videoList.length > 0) {
                            var hasChannel = false;
                            this.$scope.videoList.forEach((vd: any) => {
                                if (!hasChannel) {
                                    if (vd.video) {
                                        vd.video.forEach((v: any) => {
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

        private setStream(source: any): void {
            this.$scope.wcs_video = source;
        }
    }
    angular.module('intranet.home').controller('gLCTVCtrl', GLCTVCtrl);
}