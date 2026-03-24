var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTAntPlayerController extends common.ControllerBase {
                constructor($scope, $timeout, settings) {
                    super($scope);
                    this.$timeout = $timeout;
                    this.settings = settings;
                    this.pc_config = null;
                    this.sdpConstraints = { OfferToReceiveAudio: true, OfferToReceiveVideo: true };
                    this.mediaConstraints = { video: false, audio: false };
                    this.playOrder = ["webrtc", "hls"];
                    selfScope = this;
                    this.$scope.playButton = this.settings.ImagePath + 'images/play.png';
                    this.websocketURL = "wss://fairtube.live:5443/WebRTCAppEE/websocket";
                    this.$scope.autoPlay = true;
                    var streamsFolder = "streams";
                    this.$scope.streamId = "play1";
                    if (this.$scope.streamId.startsWith(streamsFolder)) {
                        var lastIndexOfDot = this.$scope.streamId.lastIndexOf(".");
                        var streamPath = this.$scope.streamId.substring(streamsFolder.length + 1, lastIndexOfDot);
                        var extension = this.$scope.streamId.substring(lastIndexOfDot + 1);
                        this.initializeHLSPlayer(streamPath, extension, null);
                    }
                    else {
                        if (this.playOrder[0] == "webrtc") {
                            this.initializeWebRTCPlayer(this.$scope.streamId, null, this.webrtcNoStreamCallback);
                        }
                        else if (this.playOrder[0] == "hls") {
                            this.tryToHLSPlay(this.$scope.streamId, null, this.hlsNoStreamCallback);
                        }
                        else {
                            alert("Unsupported play order requested. Supported formats are webrtc and hls. Use something like playOrder=webrtc,hls");
                        }
                    }
                }
                playPause(play = true) {
                    if (play) {
                        this.startPlaying();
                        $('.play-pause').addClass('pause').removeClass('play').prop('disabled', true);
                        $('#play').css('width', '0');
                    }
                    else {
                        this.$scope.retry = 0;
                        this.stopPlaying();
                        $('.play-pause').addClass('play').removeClass('pause').prop('disabled', true);
                    }
                }
                onStopped() {
                    $('#play').css('width', '20%');
                    $(".play-pause").addClass('play').removeClass('pause').prop('disabled', false);
                    $(".fullscreen").prop('disabled', true);
                }
                startPlaying() {
                    this.webRTCAdaptor.play(this.$scope.streamId, null);
                }
                stopPlaying() {
                    this.webRTCAdaptor.stop(this.$scope.streamId);
                }
                setStatus(status = '') {
                    var statusField = $(".status");
                    statusField.removeClass("text-success").removeClass("text-muted").removeClass("text-danger");
                    if (status.length > 0) {
                        statusField.text(status);
                        statusField.addClass("text-muted");
                    }
                    else {
                        statusField.text("");
                    }
                }
                checkAutoplay() {
                    if (this.$scope.autoPlay) {
                        this.$timeout(() => { this.playPause(true); }, 200);
                    }
                }
                Intitalize() {
                    this.webRTCAdaptor = new WebRTCAdaptor({
                        websocket_url: this.websocketURL,
                        mediaConstraints: this.mediaConstraints,
                        peerconnection_config: this.pc_config,
                        sdp_constraints: this.sdpConstraints,
                        remoteVideoId: "remoteVideo",
                        isPlayMode: true,
                        debug: true,
                        candidateTypes: ["tcp", "udp"],
                        callback: function (info, obj) {
                            if (info == "initialized") {
                                console.log("initialized");
                                selfScope.setStatus("Connecting...");
                                selfScope.webRTCAdaptor.getStreamInfo(selfScope.$scope.streamId);
                            }
                            else if (info == "streamInformation") {
                                console.log("stream information");
                                selfScope.checkAutoplay();
                            }
                            else if (info == "play_started") {
                                var video = document.getElementById("remoteVideo");
                                selfScope.setStatus("Playing...");
                                var promise = video.play();
                                if (promise !== undefined) {
                                    promise.then(() => {
                                        console.log("play started");
                                        selfScope.setStatus();
                                    }).catch(error => {
                                        selfScope.setStatus("Play again");
                                        selfScope.onStopped();
                                        selfScope.stopPlaying();
                                    });
                                }
                            }
                            else if (info == "play_finished") {
                                console.log("play finished");
                                selfScope.onStopped();
                            }
                            else if (info == "closed") {
                                selfScope.setStatus("Closed");
                                selfScope.onStopped();
                                if (typeof obj != "undefined") {
                                    console.log("Connecton closed: " + JSON.stringify(obj));
                                }
                            }
                            else if (info == "ice_connection_state_changed") {
                                console.log("iceConnectionState Changed: ", JSON.stringify(obj));
                            }
                            else if (info == "updated_stats") {
                                console.log("Average incoming kbits/sec: " + obj.averageIncomingBitrate
                                    + " Current incoming kbits/sec: " + obj.currentIncomingBitrate
                                    + " packetLost: " + obj.packetsLost
                                    + " fractionLost: " + obj.fractionLost
                                    + " audio level: " + obj.audioLevel);
                            }
                            else if (info == "data_received") {
                                console.log("Data received: " + obj.event.data + " type: " + obj.event.type + " for stream: " + obj.streamId);
                                $("#dataMessagesTextarea").append("Received: " + obj.event.data + "\r\n");
                                selfScope.setStatus();
                            }
                            else {
                                console.log(info + " notification received");
                            }
                        },
                        callbackError: function (error) {
                            selfScope.setStatus("Error, Try again");
                            selfScope.onStopped();
                            console.log("error callback: " + JSON.stringify(error));
                        }
                    });
                }
                webrtcNoStreamCallback() {
                    setTimeout(function () {
                        if (selfScope.playOrder.indexOf("hls") > -1) {
                            selfScope.tryToHLSPlay(selfScope.$scope.streamId, null, selfScope.hlsNoStreamCallback);
                        }
                        else {
                            selfScope.webRTCAdaptor.getStreamInfo(selfScope.$scope.streamId);
                        }
                    }, 3000);
                }
                hlsNoStreamCallback() {
                    setTimeout(function () {
                        if (selfScope.playOrder.indexOf("webrtc") > -1) {
                            if (selfScope.webRTCAdaptor == null) {
                                selfScope.initializeWebRTCPlayer(selfScope.$scope.streamId, null, selfScope.webrtcNoStreamCallback);
                            }
                            else {
                                selfScope.webRTCAdaptor.getStreamInfo(selfScope.$scope.streamId);
                            }
                        }
                        else {
                            selfScope.tryToHLSPlay(selfScope.$scope.streamId, null, selfScope.hlsNoStreamCallback);
                        }
                    }, 3000);
                }
                playWebRTCVideo() {
                    document.getElementById("web_video").style.display = "block";
                    var video = document.getElementById("remoteVideo");
                    video.play().then(function (value) {
                        console.log("play started");
                        selfScope.setStatus();
                    }).catch(function (error) {
                        selfScope.setStatus("Play again");
                        selfScope.onStopped();
                        selfScope.stopPlaying();
                        console.log("User interaction needed to start playing");
                    });
                }
                initializeHLSPlayer(name, extension, token) {
                    this.hideWebRTCElements();
                    this.startHLSPlayer(name, extension, token);
                }
                startHLSPlayer(name, extension, token) {
                    var type;
                    var liveStream = false;
                    if (extension == "mp4") {
                        type = "video/mp4";
                        liveStream = false;
                    }
                    else if (extension == "m3u8") {
                        type = "application/x-mpegURL";
                        liveStream = true;
                    }
                    else {
                        console.log("Unknown extension: " + extension);
                        return;
                    }
                    var preview = name;
                    if (name.endsWith("_adaptive")) {
                        preview = name.substring(0, name.indexOf("_adaptive"));
                    }
                    var player = videojs('video-player', {
                        poster: "previews/" + preview + ".png"
                    });
                    player.src({
                        src: "https://fairtube.live:5443/WebRTCAppEE/streams/" + name + "." + extension + "?token=" + token,
                        type: type,
                    });
                    player.poster("previews/" + preview + ".png");
                    if (this.$scope.autoPlay) {
                        player.ready(function () {
                            player.play();
                        });
                    }
                    document.getElementById("video_container").style.display = "block";
                }
                hideHLSElements() {
                    document.getElementById("video_container").style.display = "none";
                }
                hideWebRTCElements() {
                    document.getElementById("web_video").style.display = "none";
                }
                initializeWebRTCPlayer(name, token, noStreamCallback) {
                    this.hideHLSElements();
                    document.getElementById("web_video").style.display = "block";
                    var pc_config = null;
                    var sdpConstraints = {
                        OfferToReceiveAudio: true,
                        OfferToReceiveVideo: true
                    };
                    var mediaConstraints = {
                        video: false,
                        audio: false
                    };
                    this.webRTCAdaptor = new WebRTCAdaptor({
                        websocket_url: this.websocketURL,
                        mediaConstraints: mediaConstraints,
                        peerconnection_config: pc_config,
                        sdp_constraints: sdpConstraints,
                        remoteVideoId: "remoteVideo",
                        isPlayMode: true,
                        debug: true,
                        callback: function (info, description) {
                            if (info == "initialized") {
                                console.log("initialized");
                                selfScope.webRTCAdaptor.getStreamInfo(name);
                                selfScope.setStatus("Connecting...");
                            }
                            else if (info == "streamInformation") {
                                console.log("stream information");
                                if (selfScope.$scope.autoPlay) {
                                    selfScope.$timeout(() => { selfScope.playPause(true); }, 200);
                                }
                            }
                            else if (info == "play_started") {
                                console.log("play started");
                                selfScope.playWebRTCVideo();
                            }
                            else if (info == "play_finished") {
                                console.log("play finished");
                                selfScope.onStopped();
                                setTimeout(function () {
                                    selfScope.webRTCAdaptor.getStreamInfo(name);
                                }, 3000);
                            }
                            else if (info == "closed") {
                                selfScope.setStatus("Closed");
                                selfScope.onStopped();
                                if (typeof description != "undefined") {
                                    console.log("Connecton closed: " + JSON.stringify(description));
                                }
                            }
                        },
                        callbackError: function (error) {
                            selfScope.onStopped();
                            selfScope.setStatus(JSON.stringify(error));
                            console.log("error callback: " + JSON.stringify(error));
                            if (error == "no_stream_exist") {
                                if (typeof noStreamCallback != "undefined") {
                                }
                            }
                            if (error == "notSetRemoteDescription") {
                                selfScope.tryToHLSPlay(name, token, selfScope.hlsNoStreamCallback);
                            }
                        }
                    });
                }
                tryToHLSPlay(name, token, noStreamCallback) {
                    fetch("https://fairtube.live:5443/WebRTCAppEE/streams/" + name + "_adaptive.m3u8", { method: 'HEAD' })
                        .then(function (response) {
                        if (response.status == 200) {
                            selfScope.initializeHLSPlayer(name + "_adaptive", "m3u8", token);
                        }
                        else {
                            fetch("https://fairtube.live:5443/WebRTCAppEE/streams/" + name + ".m3u8", { method: 'HEAD' })
                                .then(function (response) {
                                if (response.status == 200) {
                                    selfScope.initializeHLSPlayer(name, "m3u8", token);
                                }
                                else {
                                    fetch("https://fairtube.live:5443/WebRTCAppEE/streams/" + name + ".mp4", { method: 'HEAD' })
                                        .then(function (response) {
                                        if (response.status == 200) {
                                            selfScope.initializeHLSPlayer(name, "mp4", token);
                                        }
                                        else {
                                            console.log("No stream found");
                                            if (typeof noStreamCallback != "undefined") {
                                                noStreamCallback();
                                            }
                                        }
                                    }).catch(function (err) {
                                        console.log("Error: " + err);
                                    });
                                }
                            }).catch(function (err) {
                                console.log("Error: " + err);
                            });
                        }
                    }).catch(function (err) {
                        console.log("Error: " + err);
                    });
                }
            }
            angular.module('kt.components')
                .controller('KTAntPlayerController', KTAntPlayerController);
            angular.module('kt.components')
                .directive('ktAntPlayer', () => {
                return {
                    restrict: 'EA',
                    replace: true,
                    scope: {},
                    templateUrl: 'app/common/components/ant-player/ant-player.html',
                    controller: 'KTAntPlayerController',
                    link: (scope) => {
                        scope.$on('$destroy', () => {
                        });
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ant-player-controller.js.map