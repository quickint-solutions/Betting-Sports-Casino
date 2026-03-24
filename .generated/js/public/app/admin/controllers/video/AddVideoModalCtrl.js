var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class AddVideoModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, videoService, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.videoService = videoService;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
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
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
                var source = intranet.common.enums.VideoSource;
                this.$scope.videoSourceList = intranet.common.helpers.Utility.enumToArray(source);
                if (this.$scope.video.videoSource) {
                    this.$scope.video.videoSource = this.$scope.video.videoSource.toString();
                }
                else {
                    this.$scope.video.videoSource = this.$scope.videoSourceList[0].id.toString();
                }
            }
            saveVideo() {
                var promise;
                if (this.$scope.video.id) {
                    promise = this.videoService.updateVideo(this.$scope.video);
                }
                else {
                    promise = this.videoService.addVideo(this.$scope.video);
                }
                this.commonDataService.addPromise(promise);
                promise.success((response) => {
                    if (response.success) {
                        this.toasterService.showMessages(response.messages, 3000);
                        this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.OK });
                    }
                    else {
                        this.$scope.messages = response.messages;
                    }
                });
            }
        }
        admin.AddVideoModalCtrl = AddVideoModalCtrl;
        angular.module('intranet.admin').controller('addVideoModalCtrl', AddVideoModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=AddVideoModalCtrl.js.map