var intranet;
(function (intranet) {
    var admin;
    (function (admin) {
        class LinkVideoModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, commonDataService, videoService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.commonDataService = commonDataService;
                this.videoService = videoService;
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
                    this.saveVideoLink();
                };
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.loadVideos();
            }
            loadVideos() {
                this.videoService.getAllVideos()
                    .success((response) => {
                    if (response.success) {
                        this.$scope.videoList = response.data;
                        this.$scope.videoList.splice(0, 0, { id: 0, streamName: '-- Select Video Url --' });
                        if (this.$scope.video.id) {
                            this.$scope.video.id = this.$scope.video.id.toString();
                        }
                        else {
                            this.$scope.video.id = '0';
                        }
                    }
                });
            }
            saveVideoLink() {
                var promise;
                if (this.$scope.video.id == '0') {
                    this.$scope.video.id = null;
                    this.$scope.video.streamName = 'not';
                }
                else {
                    var selected = this.$scope.videoList.filter((a) => { return a.id == this.$scope.video.id; });
                    if (selected.length > 0) {
                        this.$scope.video.streamName = selected[0].streamName;
                    }
                }
                promise = this.videoService.linkVideo(this.$scope.video);
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
        admin.LinkVideoModalCtrl = LinkVideoModalCtrl;
        angular.module('intranet.admin').controller('linkVideoModalCtrl', LinkVideoModalCtrl);
    })(admin = intranet.admin || (intranet.admin = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LinkVideoModalCtrl.js.map