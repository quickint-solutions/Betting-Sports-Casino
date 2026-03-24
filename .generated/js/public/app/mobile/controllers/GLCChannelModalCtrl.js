var intranet;
(function (intranet) {
    var mobile;
    (function (mobile) {
        class GLCChannelModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, videoService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.videoService = videoService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.messages = [];
                this.$scope.modalOptions = this.modalOptions;
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.loadVideoDetails();
            }
            loadVideoDetails() {
                this.videoService.getAllVideosDetail()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.videoList = response.data;
                    }
                });
            }
            setChannel(source) {
                this.$uibModalInstance.close({
                    data: source, button: intranet.common.services.ModalResult.OK
                });
            }
        }
        mobile.GLCChannelModalCtrl = GLCChannelModalCtrl;
        angular.module('intranet.mobile').controller('gLCChannelModalCtrl', GLCChannelModalCtrl);
    })(mobile = intranet.mobile || (intranet.mobile = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=GLCChannelModalCtrl.js.map