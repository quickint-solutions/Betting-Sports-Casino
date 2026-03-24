var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTVideoPlayerController extends common.ControllerBase {
                constructor($scope, localStorageHelper, videoService, settings, $filter, commonDataService, $sce) {
                    super($scope);
                    this.localStorageHelper = localStorageHelper;
                    this.videoService = videoService;
                    this.settings = settings;
                    this.$filter = $filter;
                    this.commonDataService = commonDataService;
                    this.$sce = $sce;
                    this.$scope.$watch('wcsConfig', () => {
                        this.checkBalance();
                    });
                }
                checkBalance() {
                    this.$scope.urlFound = false;
                    if (this.$scope.wcsConfig.videoSource == common.enums.VideoSource.NanoIf) {
                        this.$scope.nanoURL = this.$sce.trustAsResourceUrl(this.$scope.wcsConfig.url);
                    }
                    if (this.$scope.wcsConfig.videoSource == common.enums.VideoSource.DmdIf) {
                        this.$scope.nanoURL = this.$sce.trustAsResourceUrl(this.$scope.wcsConfig.url + '?id=' + this.$scope.wcsConfig.bfEventId);
                    }
                    var currentUserType = 0;
                    var result = this.localStorageHelper.get(this.settings.UserData);
                    if (result) {
                        if (result.user) {
                            currentUserType = result.user.userType;
                        }
                        this.$scope.userIP = result.ipAddress;
                    }
                    if (currentUserType == common.enums.UserType.Player) {
                        if (result.user.notes && result.user.notes.toLowerCase() == 'demo') {
                            this.$scope.wcsConfig.videoSource = 0;
                            this.$scope.wcsConfig.errorMessage = " Video is not available in demo account<br/> Contact support to get real account.";
                        }
                        else {
                            this.commonDataService.getSupportDetails()
                                .then((data) => {
                                if (data && data.supportDetails) {
                                    var detail = JSON.parse(data.supportDetails);
                                    if (detail && detail.videoSaverIsOn == true) {
                                        var userBalance = this.localStorageHelper.get('balance_' + this.settings.WebApp);
                                        if (userBalance < detail.videoMinBalance) {
                                            this.$scope.wcsConfig.videoSource = 0;
                                            this.$scope.wcsConfig.errorMessage = " Balance is too low, <br />To watch video,<br />Minimum " + this.$filter('toRate')(detail.videoMinBalance) + " required.";
                                        }
                                    }
                                }
                            }).finally(() => { this.videoSource2k(); });
                        }
                    }
                    else {
                        this.videoSource2k();
                    }
                }
                videoSource2k() {
                    if (this.$scope.wcsConfig.videoSource == common.enums.VideoSource.Dollar2000) {
                        this.videoService.get2kTV(this.$scope.wcsConfig.url, this.$scope.wcsConfig.streamName, this.$scope.userIP)
                            .success((response) => {
                            this.$scope.wcsConfig.url = response.link;
                        }).finally(() => { this.$scope.urlFound = true; });
                    }
                }
            }
            angular.module('kt.components')
                .controller('KTVideoPlayerController', KTVideoPlayerController);
            angular.module('kt.components')
                .directive('ktVideoPlayer', () => {
                return {
                    restrict: 'EA',
                    replace: true,
                    scope: {
                        autoplay: '@?',
                        wcsConfig: '=',
                        pauseMe: '@?',
                        allowf: '@?',
                        playMe: '@?'
                    },
                    templateUrl: 'app/common/components/video-player/video-player.html',
                    controller: 'KTVideoPlayerController',
                    link: (scope) => {
                        scope.$on('$destroy', () => {
                        });
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=video-player-controller.js.map