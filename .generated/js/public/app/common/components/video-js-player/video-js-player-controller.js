var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTVideoJsController extends common.ControllerBase {
                constructor($scope, $timeout, $window, isMobile, settings) {
                    super($scope);
                    this.$timeout = $timeout;
                    this.$window = $window;
                    this.isMobile = isMobile;
                    this.settings = settings;
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
                            }
                        }
                    });
                    var playnow = this.$scope.$watch('playMe', (newval, oldval) => {
                        if (newval != oldval) {
                            if (this.$scope.playMe == 'true') {
                            }
                        }
                    });
                    this.$scope.$on('$destroy', () => {
                        console.log('wcs destroyed');
                        pauser();
                        playnow();
                        wcfconfig();
                        this.closeSession();
                    });
                    this.decidePlayer();
                }
                releaseVideo() {
                }
                decidePlayer() {
                    this.init_hls_video();
                }
                init_hls_video() {
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
                }
                playHLS(self) {
                    this.HLSPlayer.ready(function () {
                        self.HLSPlayer.play();
                    });
                }
                closeSession() {
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
                    link: (scope) => {
                        scope.$on('$destroy', () => {
                        });
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=video-js-player-controller.js.map