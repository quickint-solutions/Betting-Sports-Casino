module intranet.livegamedemo {
    export interface IVideoFrameScope extends intranet.common.IScopeBase {
        wcs_video: any;
    }

    export class VideoFrameCtrl extends intranet.common.ControllerBase<IVideoFrameScope>
        implements intranet.common.init.IInitScopeValues {
        constructor($scope: IVideoFrameScope,
            private $sce: any,
            private isMobile: any,
            private $location: any,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: intranet.common.IBaseSettings) {
            super($scope);


            super.init(this);
        }

        public initScopeValues(): void {
            if (this.$location.$$search.url && this.$location.$$search.streamname) {
                this.$scope.wcs_video = {
                    url: this.$location.$$search.url,
                    streamName: this.$location.$$search.streamname,
                    videoSource: this.$location.$$search.videoSource
                };
            }
        }

    }
    angular.module('intranet.livegamedemo').controller('videoFrameCtrl', VideoFrameCtrl);
}