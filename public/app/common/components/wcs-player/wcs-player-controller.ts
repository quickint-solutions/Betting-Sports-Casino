namespace intranet.common.directives {

    export interface IKTWCSPlayerScope extends common.IScopeBase {
        autoplay: any;
        resolution: any;
        mseCutByIFrameOnly: any;

        playButton: any;
        wcsConfig: any;
        pauseMe: any;
        playMe: any;
        retry: any;
        timer_retry: any;

        allowf: any;
        // 0=none, 1=web, 2=hls
        videoPlayer: number;
    }

    class KTWCSPlayerController extends ControllerBase<IKTWCSPlayerScope>
    {
        SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
        STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
        PRELOADER_URL = "https://fairtube.site:8888/client2/examples/demo/dependencies/media/preloader.mp4";
        remoteVideo;

        remoteVideoHLS;
        HLSPlayer;

        resolution_for_wsplayer;
        stream;
        currentVolumeValue = 50;
        mediaProvider: any;
        mseCutByIFrameOnly: any;
        streamName: string;
        url: string;

        constructor($scope: IKTWCSPlayerScope,
            private $timeout: any,
            private $window: any,
            private isMobile: any,
            private settings: common.IBaseSettings) {
            super($scope);

            this.$scope.videoPlayer = 0;

            this.$scope.playButton = this.settings.ImagePath + 'images/play.png';

            this.SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
            this.STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
            this.remoteVideo;
            this.resolution_for_wsplayer;
            this.stream;
            this.currentVolumeValue = 50;
            this.$scope.retry = 5;

            this.mediaProvider = "WSPlayer,WebRTC,Flash,MSE";
            this.$scope.allowf = 'true';

            var wcfconfig = this.$scope.$watch('wcsConfig', (newval, oldval) => {
                if (newval != oldval) {
                    if (this.stream) { this.playPause(false); }
                    if (newval) {
                        this.decidePlayer();
                    }
                }
            });

            var pauser = this.$scope.$watch('pauseMe', (newval, oldval) => {
                if (newval != oldval) {
                    if (this.$scope.pauseMe == 'true') {
                        this.playPause(false);
                    }
                }
            });

            var playnow = this.$scope.$watch('playMe', (newval, oldval) => {
                if (newval != oldval) {
                    if (this.$scope.playMe == 'true') {
                        this.playPause(true);
                    }
                }
            });

            this.$scope.$on('$destroy', () => {
                console.log('wcs destroyed');
                this.$timeout.cancel(this.$scope.timer_retry);
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

            if (this.isMobile.apple.device) {
                this.$scope.videoPlayer = 2;
                this.init_hls_video();
            }
            else {
                this.$scope.videoPlayer = 1;
                this.init_web_video();
            }
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

            var streamName = this.$scope.wcsConfig.streamName;
            streamName = encodeURIComponent(streamName);
            var url = this.$scope.wcsConfig.url.replace("wss", "https");
            url = url.replace("8443", "8445");
            var videoSrc = url + '/' + streamName + '/' + streamName + '.m3u8';
            this.HLSPlayer.src({
                src: videoSrc,
                type: "application/vnd.apple.mpegurl",

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




        public init_web_video() {
            this.streamName = this.$scope.wcsConfig.streamName;
            this.url = this.$scope.wcsConfig.url;

            //init api
            try {
                Flashphoner.init({
                    flashMediaProviderSwfLocation: 'https://fairtube.site:8888/client2/media-provider.swf',
                    receiverLocation: 'https://fairtube.site:8888/client2/examples/demo/dependencies/websocket-player/WSReceiver2.js',
                    decoderLocation: 'https://fairtube.site:8888/client2/examples/demo/dependencies/websocket-player/video-worker2.js',
                    preferredMediaProvider: this.mediaProvider,
                    // constraints: { audio: false, video: true }
                });
            } catch (e) {
                $("#notifyFlash").text("Your browser doesn't support Flash or WebRTC technology necessary for work of an example");
                return;
            }
            if (Flashphoner.getMediaProviders()[0] == "WSPlayer") {
                this.resolution_for_wsplayer = { playWidth: 640, playHeight: 480 };
            }

            //video display
            this.remoteVideo = document.getElementById("remoteVideo");

            if (Flashphoner.getMediaProviders()[0] == "Flash") {
                $("#fullScreen").hide();
            }

            if (this.$scope.autoplay) {
                if (!this.isMobile.apple.device)
                    this.$timeout(() => { this.playPause(true); }, 1000);
            }
            else
                this.onStopped();
        }

        public fullScreen() {
            if (this.$scope.allowf != 'false') {
                this.stream.fullScreen();
            }
        }

        public playPause(play: boolean = true): void {
            if (play) {
                this.start();
                $('.play-pause').addClass('pause').removeClass('play').prop('disabled', true);
                $('#play').css('width', '0');
            } else {
                this.closeSession();
                $('.play-pause').addClass('play').removeClass('pause').prop('disabled', true);
            }
        }

        public closeSession(): void {
            if (this.$scope.videoPlayer == 1) {
                this.$scope.retry = 0;
                if (this.stream) {
                    this.stream.stop();
                }
                if (Flashphoner.getSessions().length > 0) {
                    var session = Flashphoner.getSessions()[0];
                    if (session) {
                        session.disconnect();
                    }
                }
            } else {
                if (this.HLSPlayer != null) {
                    console.log("Stop VideoJS player");
                    this.HLSPlayer.pause();
                    this.HLSPlayer.dispose();
                }
            }
        }

        public onStopped() {
            $('#play').css('width', '20%');
            $(".play-pause").addClass('play').removeClass('pause').prop('disabled', false);
            $(".fullscreen").prop('disabled', true);
        }


        public start() {
            var self = this;
            if (Flashphoner.getMediaProviders()[0] === "WSPlayer") {
                Flashphoner.playFirstSound();
            }
            else if (Browser.isSafariWebRTC() || Flashphoner.getMediaProviders()[0] === "MSE") {
                Flashphoner.playFirstVideo(this.remoteVideo, false, this.PRELOADER_URL).then(function () {
                    self.startSession();
                }).catch(function () {
                    self.onStopped();
                });
                return;
            }
            this.startSession();
        }

        private startSession(): void {
            var url = this.url;
            //check if we already have session
            if (Flashphoner.getSessions().length > 0) {
                var session = Flashphoner.getSessions()[0];
                if (session.getServerUrl() == url) {
                    this.playStream(session);
                    return;
                } else {
                    //remove session DISCONNECTED and FAILED callbacks
                    session.on(this.SESSION_STATUS.DISCONNECTED, function () { });
                    session.on(this.SESSION_STATUS.FAILED, function () { });
                    session.disconnect();
                }
            }
            //create session
            var self = this;
            Flashphoner.createSession({ urlServer: url })
                .on(this.SESSION_STATUS.ESTABLISHED, function (session) {
                    self.setStatus(session.status(), "Session");
                    //session connected, start playback
                    self.playStream(session);
                    //self.$scope.retry = 5;
                })
                .on(self.SESSION_STATUS.DISCONNECTED, function () {
                    self.setStatus(self.SESSION_STATUS.DISCONNECTED, "Session");
                    self.onStopped();
                })
                .on(self.SESSION_STATUS.FAILED, function (event) {
                    self.setStatus(self.SESSION_STATUS.FAILED, "Session");
                    self.onStopped();
                    //console.log('retry ' + self.$scope.retry);
                    //self.retryToConnect(self);
                });
        }

        private downScaleToFitSize(videoWidth, videoHeight, dstWidth, dstHeight) {
            var newWidth, newHeight;
            var videoRatio = videoWidth / videoHeight;
            var dstRatio = dstWidth / dstHeight;
            if (dstRatio > videoRatio) {
                newHeight = dstHeight;
                newWidth = Math.floor(videoRatio * dstHeight);
            } else {
                newWidth = dstWidth;
                newHeight = Math.floor(dstWidth / videoRatio);
            }
            return {
                w: newWidth,
                h: newHeight
            };
        }

        private resizeVideo(video, width: any = undefined, height: any = undefined) {
            if (!video.parentNode) {
                return;
            }
            if (video instanceof HTMLCanvasElement) {
                video.videoWidth = video.width;
                video.videoHeight = video.height;
            }
            var display = video.parentNode;
            var parentSize = {
                w: display.parentNode.clientWidth,
                h: display.parentNode.clientHeight
            };
            var newSize;
            if (width && height) {
                newSize = this.downScaleToFitSize(width, height, parentSize.w, parentSize.h);
            } else {
                newSize = this.downScaleToFitSize(video.videoWidth, video.videoHeight, parentSize.w, parentSize.h);
            }
            display.style.width = newSize.w + "px";
            display.style.height = newSize.h + "px";

            //vertical align
            var margin = 0;
            if (parentSize.h - newSize.h > 1) {
                margin = Math.floor((parentSize.h - newSize.h) / 2);
            }
            display.style.margin = margin + "px auto";
        }

        public playStream(session) {
            var streamName = this.streamName;
            var options: any = {
                name: streamName,
                display: this.remoteVideo,
                flashShowFullScreenButton: true
            };
            if (Flashphoner.getMediaProviders()[0] === "MSE" && this.$scope.mseCutByIFrameOnly) {
                options.mediaConnectionConstraints = {
                    cutByIFrameOnly: this.$scope.mseCutByIFrameOnly
                }
            }
            if (this.resolution_for_wsplayer) {
                options.playWidth = this.resolution_for_wsplayer.playWidth;
                options.playHeight = this.resolution_for_wsplayer.playHeight;
            } else if (this.$scope.resolution) {
                options.playWidth = this.$scope.resolution.split("x")[0];
                options.playHeight = this.$scope.resolution.split("x")[1];
            }
            var self = this;
            this.stream = session.createStream(options)
                .on(self.STREAM_STATUS.PENDING, function (stream) {
                    var video: any = document.getElementById(stream.id());
                    self.setStatus(stream.status(), "Stream");
                    var videoTagList = document.getElementsByTagName('video');
                    if (videoTagList && videoTagList.length > 1) {
                        videoTagList[0].remove();
                    }
                })
                .on(self.STREAM_STATUS.PLAYING, function (stream) {
                    self.setStatus(stream.status(), "Stream");
                })
                .on(self.STREAM_STATUS.STOPPED, function () {
                    self.setStatus(self.STREAM_STATUS.STOPPED, "Stream");
                    self.onStopped();
                })
                .on(self.STREAM_STATUS.FAILED, function (stream) {
                    self.setStatus(self.STREAM_STATUS.FAILED, "Stream");
                    self.onStopped();
                    //console.log('retry ' + self.$scope.retry);
                    //self.retryToConnect(self);
                })
                .on(self.STREAM_STATUS.NOT_ENOUGH_BANDWIDTH, function (stream) {
                    console.log("Not enough bandwidth, consider using lower video resolution or bitrate. Bandwidth " + (Math.round(stream.getNetworkBandwidth() / 1000)) + " bitrate " + (Math.round(stream.getRemoteBitrate() / 1000)));
                });

            var onResize = (() => {
                self.resizeVideo(event.target);
            });
            angular.element(this.$window).on('resize', onResize);
            function cleanUp() {
                angular.element(this.$window).off('resize', onResize);
            }
            this.$scope.$on('$destroy', () => {
                session.disconnect();
                cleanUp();
            });

            this.$timeout(() => {
                self.stream.play();
            }, 1000);

        }

        //show connection or remote stream status
        public setStatus(status: any, prefix: any = '') {
            console.log(prefix + " " + status);
            var statusField = $(".status");
            statusField.removeClass("text-success").removeClass("text-muted").removeClass("text-danger");
            if (status == "PLAYING" || status == "ESTABLISHED" || status == "STOPPED") {
                //don't display status word because we have this indication on UI
                statusField.text("");
            } else if (status == "DISCONNECTED") {
                statusField.text(status);
                statusField.addClass("text-muted");
            } else if (status == "FAILED") {
                statusField.text(status);
                statusField.addClass("text-muted");
            }
        }

        private retryToConnect(self: any): void {
            if (self.$scope.retry > 0) {
                this.$timeout(() => {
                    console.log('retry no. ' + self.$scope.retry);
                    if (self.stream && (self.stream.status() != self.STREAM_STATUS.PLAYING)) {
                        self.playPause();
                        self.$scope.retry = self.$scope.retry - 1;
                    }
                }, 3000);
            }
        }

    }

    angular.module('kt.components')
        .controller('KTWCSPlayerController', KTWCSPlayerController);

    angular.module('kt.components')
        .directive('ktWcsPlayer', () => {
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
                templateUrl: 'app/common/components/wcs-player/wcs-player.html',
                controller: 'KTWCSPlayerController',
                link: (scope: any) => {
                    scope.$on('$destroy', () => {

                    });
                }
            };
        });
}