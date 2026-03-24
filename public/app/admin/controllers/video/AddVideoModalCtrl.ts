module intranet.admin {

    export interface IAddVideoModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        video: any;
        videoSourceList: any[];
    }

    export class AddVideoModalCtrl extends intranet.common.ControllerBase<IAddVideoModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: IAddVideoModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private videoService: services.VideoService,
            private commonDataService: common.services.CommonDataService,
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
                this.saveVideo();
            };
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };

            var source: any = common.enums.VideoSource;
            this.$scope.videoSourceList = common.helpers.Utility.enumToArray<common.enums.VideoSource>(source);
            if (this.$scope.video.videoSource) { this.$scope.video.videoSource = this.$scope.video.videoSource.toString(); }
            else {
                this.$scope.video.videoSource = this.$scope.videoSourceList[0].id.toString();
            }
        }


        private saveVideo(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$scope.video.id) {
                promise = this.videoService.updateVideo(this.$scope.video);
            }
            else {
                promise = this.videoService.addVideo(this.$scope.video);
            }
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
    angular.module('intranet.admin').controller('addVideoModalCtrl', AddVideoModalCtrl);
}