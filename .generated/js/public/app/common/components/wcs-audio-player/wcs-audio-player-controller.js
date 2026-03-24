var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTWCSAudioPlayerController extends common.ControllerBase {
                constructor($scope, $timeout, isMobile, $window, settings) {
                    super($scope);
                    this.$timeout = $timeout;
                    this.isMobile = isMobile;
                    this.$window = $window;
                    this.settings = settings;
                    this.SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
                    this.STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
                    this.SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
                    this.STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
                    this.remoteVideo;
                    this.resolution_for_wsplayer;
                    this.stream;
                    this.$scope.retry = 5;
                    this.$scope.isPlaying = false;
                    this.$scope.hoverActive = false;
                    this.mediaProvider = "WSPlayer,WebRTC,Flash,MSE";
                    var wcfconfig = this.$scope.$watch('wcsConfig', (newval, oldval) => {
                        if (JSON.stringify(newval) != JSON.stringify(oldval)) {
                            if (this.stream) {
                                this.playPause(false);
                            }
                            if (newval) {
                                this.init_page();
                            }
                        }
                    });
                    this.$scope.$on('$destroy', () => {
                        console.log('wcs destroyed');
                        this.$timeout.cancel(this.$scope.timer_retry);
                        wcfconfig();
                    });
                    this.init_page();
                }
                releaseVideo() {
                }
                init_page() {
                    this.streamName = this.$scope.wcsConfig.streamName;
                    this.url = this.$scope.wcsConfig.url;
                    try {
                        Flashphoner.init({
                            flashMediaProviderSwfLocation: 'https://funbetexchange.com:8888/shared/examples/media-provider.swf',
                            receiverLocation: 'https://funbetexchange.com:8888/shared/examples/demo/dependencies/websocket-player/WSReceiver2.js',
                            decoderLocation: 'https://funbetexchange.com:8888/shared/examples/demo/dependencies/websocket-player/video-worker2.js',
                            preferredMediaProvider: this.mediaProvider,
                        });
                    }
                    catch (e) {
                        $("#notifyFlash").text("Your browser doesn't support Flash or WebRTC technology necessary for work of an example");
                        return;
                    }
                    if (Flashphoner.getMediaProviders()[0] == "WSPlayer") {
                        this.resolution_for_wsplayer = { playWidth: 352, playHeight: 240 };
                    }
                    this.remoteVideo = document.getElementById("remoteVideo");
                    if (this.$scope.autoplay) {
                        if (!Browser.isiOS() && !Browser.isSafari() && !Browser.isSafariWebRTC())
                            this.$timeout(() => { this.playPause(true); }, 1000);
                    }
                    else
                        this.onStopped();
                }
                playPause(play = true) {
                    if (play) {
                        this.start();
                    }
                    else {
                        this.$scope.retry = 0;
                        if (this.stream) {
                            this.stream.stop();
                        }
                    }
                }
                onStopped() {
                    this.$scope.isPlaying = false;
                }
                start() {
                    this.$scope.isPlaying = true;
                    if (Flashphoner.getMediaProviders()[0] === "WSPlayer") {
                        Flashphoner.playFirstSound();
                    }
                    else if (Browser.isSafariWebRTC() || Flashphoner.getMediaProviders()[0] === "MSE") {
                        Flashphoner.playFirstVideo(this.remoteVideo);
                    }
                    var url = this.url;
                    if (Flashphoner.getSessions().length > 0) {
                        var session = Flashphoner.getSessions()[0];
                        if (session.getServerUrl() == url) {
                            this.playStream(session);
                            return;
                        }
                        else {
                            session.on(this.SESSION_STATUS.DISCONNECTED, function () { });
                            session.on(this.SESSION_STATUS.FAILED, function () { });
                            session.disconnect();
                        }
                    }
                    var self = this;
                    Flashphoner.createSession({ urlServer: url })
                        .on(this.SESSION_STATUS.ESTABLISHED, function (session) {
                        self.setStatus(session.status());
                        self.playStream(session);
                        self.$scope.retry = 5;
                    })
                        .on(self.SESSION_STATUS.DISCONNECTED, function () {
                        self.setStatus(self.SESSION_STATUS.DISCONNECTED);
                        self.onStopped();
                    })
                        .on(self.SESSION_STATUS.FAILED, function (event) {
                        self.setStatus(self.SESSION_STATUS.FAILED);
                        self.onStopped();
                        console.log('retry ' + self.$scope.retry);
                        self.retryToConnect(self);
                    });
                }
                downScaleToFitSize(videoWidth, videoHeight, dstWidth, dstHeight) {
                    var newWidth, newHeight;
                    var videoRatio = videoWidth / videoHeight;
                    var dstRatio = dstWidth / dstHeight;
                    if (dstRatio > videoRatio) {
                        newHeight = dstHeight;
                        newWidth = Math.floor(videoRatio * dstHeight);
                    }
                    else {
                        newWidth = dstWidth;
                        newHeight = Math.floor(dstWidth / videoRatio);
                    }
                    return {
                        w: newWidth,
                        h: newHeight
                    };
                }
                playStream(session) {
                    var streamName = this.streamName;
                    var options = {
                        name: streamName,
                        constraints: { audio: true, video: false },
                        display: this.remoteVideo
                    };
                    if (Flashphoner.getMediaProviders()[0] === "MSE" && this.$scope.mseCutByIFrameOnly) {
                        options.mediaConnectionConstraints = {
                            cutByIFrameOnly: this.$scope.mseCutByIFrameOnly
                        };
                    }
                    if (this.resolution_for_wsplayer) {
                        options.playWidth = this.resolution_for_wsplayer.playWidth;
                        options.playHeight = this.resolution_for_wsplayer.playHeight;
                    }
                    var self = this;
                    this.stream = session.createStream(options)
                        .on(self.STREAM_STATUS.PENDING, function (stream) {
                        var video = document.getElementById(stream.id());
                        self.setStatus(stream.status());
                        var videoTagList = document.getElementsByTagName('video');
                        if (videoTagList && videoTagList.length > 1) {
                            videoTagList[0].remove();
                        }
                    })
                        .on(self.STREAM_STATUS.PLAYING, function (stream) {
                        self.setStatus(stream.status());
                    })
                        .on(self.STREAM_STATUS.STOPPED, function () {
                        self.setStatus(self.STREAM_STATUS.STOPPED);
                        self.onStopped();
                    })
                        .on(self.STREAM_STATUS.FAILED, function (stream) {
                        self.setStatus(self.STREAM_STATUS.FAILED, stream);
                        self.onStopped();
                    })
                        .on(self.STREAM_STATUS.NOT_ENOUGH_BANDWIDTH, function (stream) {
                        console.log("Not enough bandwidth, consider using lower video resolution or bitrate. Bandwidth " + (Math.round(stream.getNetworkBandwidth() / 1000)) + " bitrate " + (Math.round(stream.getRemoteBitrate() / 1000)));
                    });
                    this.$scope.$on('$destroy', () => {
                        session.disconnect();
                    });
                    this.$timeout(() => {
                        self.stream.play();
                    }, 1000);
                }
                setStatus(status, stream = '') {
                    console.log(status);
                }
                retryToConnect(self) {
                    if (self.$scope.retry > 0) {
                        self.$scope.retry = self.$scope.retry - 1;
                        this.$timeout(() => { self.playPause(); }, 2000);
                    }
                }
                showMuteIcon(isEnter) {
                    if (!this.isMobile.any) {
                        if (isEnter) {
                            this.$scope.hoverActive = true;
                        }
                        else {
                            this.$scope.hoverActive = false;
                        }
                    }
                }
            }
            angular.module('kt.components')
                .controller('KTWCSAudioPlayerController', KTWCSAudioPlayerController);
            angular.module('kt.components')
                .directive('ktWcsAudioPlayer', () => {
                return {
                    restrict: 'EA',
                    replace: true,
                    scope: {
                        autoplay: '@?',
                        wcsConfig: '=',
                        mseCutByIFrameOnly: '@?',
                    },
                    templateUrl: 'app/common/components/wcs-audio-player/wcs-audio-player.html',
                    controller: 'KTWCSAudioPlayerController',
                    link: (scope) => {
                        scope.$on('$destroy', () => {
                        });
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=wcs-audio-player-controller.js.map