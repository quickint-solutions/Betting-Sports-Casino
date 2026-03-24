namespace intranet.common.directives {

    export interface IKTVideoPlayerScope extends common.IScopeBase {
        autoplay: any;
        wcsConfig: any;
        pauseMe: any;
        playMe: any;
        allowf: any;

        nanoURL: any;
        userIP: any;
        urlFound: boolean;
    }

    class KTVideoPlayerController extends ControllerBase<IKTVideoPlayerScope>{
        constructor($scope: IKTVideoPlayerScope,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private videoService: intranet.services.VideoService,
            private settings: common.IBaseSettings,
            private $filter: any,
            private commonDataService: common.services.CommonDataService,
            private $sce: any) {
            super($scope);

            this.$scope.$watch('wcsConfig', () => {
                this.checkBalance();
            });

            //this.checkBalance();
        }

        private checkBalance() {
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
                if (result.user) { currentUserType = result.user.userType; }
                this.$scope.userIP = result.ipAddress
            }
            if (currentUserType == common.enums.UserType.Player) {

                if (result.user.notes && result.user.notes.toLowerCase() == 'demo') {
                    this.$scope.wcsConfig.videoSource = 0;
                    this.$scope.wcsConfig.errorMessage = " Video is not available in demo account<br/> Contact support to get real account.";
                }
                else {
                    this.commonDataService.getSupportDetails()
                        .then((data: any) => {
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
            } else {
                this.videoSource2k();
            }
        }

        private videoSource2k() {
            if (this.$scope.wcsConfig.videoSource == common.enums.VideoSource.Dollar2000) {
                this.videoService.get2kTV(this.$scope.wcsConfig.url, this.$scope.wcsConfig.streamName, this.$scope.userIP)
                    .success((response: any) => {
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
                    //resolution: '@?',
                    wcsConfig: '=',
                    //mseCutByIFrameOnly: '@?',
                    pauseMe: '@?',
                    allowf: '@?',
                    playMe: '@?'
                },
                templateUrl: 'app/common/components/video-player/video-player.html',
                controller: 'KTVideoPlayerController',
                link: (scope: any) => {
                    scope.$on('$destroy', () => {

                    });
                }
            };
        });
}