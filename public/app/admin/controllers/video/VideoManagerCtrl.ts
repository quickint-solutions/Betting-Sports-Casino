module intranet.admin {

    export interface IVideoManagerScope extends intranet.common.IScopeBase {
    }

    export class VideoManagerCtrl extends intranet.common.ControllerBase<IVideoManagerScope>
    {
        constructor($scope: IVideoManagerScope,
            private modalService: common.services.ModalService,
            private settings: common.IBaseSettings,
            private toasterService: common.services.ToasterService,
            private videoService: services.VideoService) {
            super($scope);
        }

        private getVideoSource(source: any): string {
            return common.enums.VideoSource[source];
        }

        private addEditVideo(item: any = null): void {
            var modal = new common.helpers.CreateModal();
            if (item) {
                modal.header = 'admin.video.edit.modal.header';
                modal.data = {
                    id: item.id,
                    url: item.url,
                    streamName: item.streamName,
                    appName: item.appName,
                    rtspUrl: item.rtspUrl,
                    videoSource: item.videoSource,
                };
            }
            else {
                modal.header = 'admin.video.add.modal.header';
            }
            modal.bodyUrl = this.settings.ThemeName + '/admin/video/add-video-modal.html';
            modal.controller = 'addVideoModalCtrl';
            modal.SetModal();
            this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result: any) => {
                if (result.button == common.services.ModalResult.OK) {
                    this.$scope.$broadcast('refreshGridStayOnPage');
                }
            });
        }

        private deleteVideo(item: any): void {
            this.modalService.showDeleteConfirmation().then((result: any) => {
                if (result == common.services.ModalResult.OK) {
                    this.videoService.deleteVideo(item.id).success((response: common.messaging.IResponse<any>) => {
                        if (response.success) {
                            this.$scope.$broadcast('refreshGrid');
                        }
                        this.toasterService.showMessages(response.messages, 5000);
                    });
                }
            });
        }

        // callback : used to load grid
        public getItems(params: any, filters: any): ng.IHttpPromise<any> {
            var model = { params: params, filters: filters };
            return this.videoService.getVideos(model);
        }
    }

    angular.module('intranet.admin').controller('videoManagerCtrl', VideoManagerCtrl);
}