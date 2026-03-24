module intranet.home {
    export interface IWcsPopupTVScope extends intranet.common.IScopeBase {
        wcs_video: any;
    }

    export class WcsPopupTVCtrl extends intranet.common.ControllerBase<IWcsPopupTVScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: IWcsPopupTVScope,
            private $stateParams: any,
            private videoService: services.VideoService) {
            super($scope);
            super.init(this);
        }

        public loadInitialData(): void {
            this.loadVideoDetails();
        }

        public loadVideoDetails(): void {
            this.videoService.getVideoByEvent(this.$stateParams.eventId)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        if (response.data && response.data.streamName) {
                            this.$scope.wcs_video = response.data;
                        }
                    }
                });
        }
    }
    angular.module('intranet.home').controller('wcsPopupTVCtrl', WcsPopupTVCtrl);
}