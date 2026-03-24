module intranet.admin {

    export interface ILinkVideoModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        video: any;
        videoList: any[];
    }

    export class LinkVideoModalCtrl extends intranet.common.ControllerBase<ILinkVideoModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: ILinkVideoModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private commonDataService: common.services.CommonDataService,
            private videoService: services.VideoService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.video = {};
            if (this.modalOptions.data) {
                this.$scope.video = this.modalOptions.data;
            }

            this.$scope.modalOptions.ok = result => {
                this.saveVideoLink();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.loadVideos();
        }

        private loadVideos(): void {
            this.videoService.getAllVideos()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success) {
                        this.$scope.videoList = response.data;
                        this.$scope.videoList.splice(0, 0, { id: 0, streamName: '-- Select Video Url --' });

                        if (this.$scope.video.id) {
                            this.$scope.video.id = this.$scope.video.id.toString();
                        } else {
                            this.$scope.video.id = '0';
                        }
                    }
                });
        }

        private saveVideoLink(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.video.id == '0') { this.$scope.video.id = null; this.$scope.video.streamName = 'not'; }
            else {
                var selected = this.$scope.videoList.filter((a: any) => { return a.id == this.$scope.video.id; });
                if (selected.length > 0) { this.$scope.video.streamName = selected[0].streamName; }
            }
            promise = this.videoService.linkVideo(this.$scope.video);
            this.commonDataService.addPromise(promise);
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.toasterService.showMessages(response.messages, 3000);
                    this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.OK });
                } else {
                    this.$scope.messages = response.messages;
                }
            });
        }
    }
    angular.module('intranet.admin').controller('linkVideoModalCtrl', LinkVideoModalCtrl);
}