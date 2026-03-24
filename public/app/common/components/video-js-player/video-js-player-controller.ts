namespace intranet.common.directives {

    export interface IKTVideoJsPlayerScope extends common.IScopeBase {
        autoplay: any;
        wcsConfig: any;
        pauseMe: any;
        playMe: any;
    }

    class KTVideoJsController extends ControllerBase<IKTVideoJsPlayerScope>
    {
        remoteVideoHLS;
        HLSPlayer;

        constructor($scope: IKTVideoJsPlayerScope,
            private $timeout: any,
            private $window: any,
            private isMobile: any,
            private settings: common.IBaseSettings) {
            super($scope);

          
            var wcfconfig = this.$scope.$watch('wcsConfig', (newval, oldval) => {
                if (newval != oldval) {
                    if (newval) {
                        this.decidePlayer();
                    }
                }
            });

            var pauser = this.$scope.$watch('pauseMe', (newval, oldval) => {
                if (newval != oldval) {
                    if (this.$scope.pauseMe == 'true') {
                       // this.playPause(false);
                    }
                }
            });

            var playnow = this.$scope.$watch('playMe', (newval, oldval) => {
                if (newval != oldval) {
                    if (this.$scope.playMe == 'true') {
                       // this.playPause(true);
                    }
                }
            });

            this.$scope.$on('$destroy', () => {
                console.log('wcs destroyed');
                pauser();
                playnow();
                wcfconfig();
                this.closeSession();
                //this.releaseVideo();
            });

            this.decidePlayer();
        }

        private releaseVideo() {
            //Flashphoner.releaseLocalMedia(this.remoteVideo, 'WebRTC');
        }

        private decidePlayer(): void {
            this.init_hls_video();
        }

        public init_hls_video(): void {
            var self = this;
            this.remoteVideoHLS = document.getElementById('remoteVideoHLS');
            this.remoteVideoHLS.className = "video-js vjs-default-skin vjs-big-play-centered";
            this.HLSPlayer = videojs(this.remoteVideoHLS, {
                'muted': true,
                'preload': 'auto',
            });
            this.HLSPlayer.bigPlayButton.on('click', () => {
                self.playHLS(self);
            });

            var videoSrc = this.$scope.wcsConfig.url;
            this.HLSPlayer.src({
                src: videoSrc,
                type: "application/x-mpegURL",

            });

            console.log("Play with VideoJs");
            if (this.$scope.autoplay) {
                this.playHLS(self);
            }

            //this.HLSPlayer.bigPlayButton.on('click', this.playHLS(self));
        }

        private playHLS(self: any): void {
            this.HLSPlayer.ready(function () {
                self.HLSPlayer.play();
            });
        }


        public closeSession(): void {
            if (this.HLSPlayer != null) {
                console.log("Stop VideoJS player");
                this.HLSPlayer.pause();
                this.HLSPlayer.dispose();
            }
        }
    }

    angular.module('kt.components')
        .controller('KTVideoJsController', KTVideoJsController);

    angular.module('kt.components')
        .directive('ktVideoJsPlayer', () => {
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
                templateUrl: 'app/common/components/video-js-player/video-js-player.html',
                controller: 'KTVideoJsController',
                link: (scope: any) => {
                    scope.$on('$destroy', () => {

                    });
                }
            };
        });
}