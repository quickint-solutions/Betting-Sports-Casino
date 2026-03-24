var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class VideoManagerCtrl extends intranet.common.ControllerBase {
            constructor($scope, modalService, settings, toasterService, videoService) {
                super($scope);
                this.modalService = modalService;
                this.settings = settings;
                this.toasterService = toasterService;
                this.videoService = videoService;
            }
            getVideoSource(source) {
                return intranet.common.enums.VideoSource[source];
            }
            addEditVideo(item = null) {
                var modal = new intranet.common.helpers.CreateModal();
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
                this.modalService.showWithOptions(modal.options, modal.modalDefaults).then((result) => {
                    if (result.button == intranet.common.services.ModalResult.OK) {
                        this.$scope.$broadcast('refreshGridStayOnPage');
                    }
                });
            }
            deleteVideo(item) {
                this.modalService.showDeleteConfirmation().then((result) => {
                    if (result == intranet.common.services.ModalResult.OK) {
                        this.videoService.deleteVideo(item.id).success((response) => {
                            if (response.success) {
                                this.$scope.$broadcast('refreshGrid');
                            }
                            this.toasterService.showMessages(response.messages, 5000);
                        });
                    }
                });
            }
            getItems(params, filters) {
                var model = { params: params, filters: filters };
                return this.videoService.getVideos(model);
            }
        }
        admin.VideoManagerCtrl = VideoManagerCtrl;
        angular.module('intranet.admin').controller('videoManagerCtrl', VideoManagerCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=VideoManagerCtrl.js.map