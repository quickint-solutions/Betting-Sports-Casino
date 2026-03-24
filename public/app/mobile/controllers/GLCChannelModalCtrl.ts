module intranet.mobile {

    export interface IGLCChannelModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        videoList: any;
    }

    export class GLCChannelModalCtrl extends intranet.common.ControllerBase<IGLCChannelModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IGLCChannelModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private videoService: services.VideoService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
         
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData() {
            this.loadVideoDetails();
        }

        public loadVideoDetails(): void {
            this.videoService.getAllVideosDetail()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.videoList = response.data;
                    }
                });
        }

        private setChannel(source:any): void {
            this.$uibModalInstance.close({
                data: source, button: common.services.ModalResult.OK
            });
        }
    }
    angular.module('intranet.mobile').controller('gLCChannelModalCtrl', GLCChannelModalCtrl);
}