namespace intranet.common.directives {

    export interface IKTAntPlayerScope extends common.IScopeBase {
        playButton: any;
        streamId: any;
        retry: any;
        autoPlay: boolean;

    }

    class KTAntPlayerController extends ControllerBase<IKTAntPlayerScope>
    {
        pc_config = null;
        sdpConstraints = { OfferToReceiveAudio: true, OfferToReceiveVideo: true };
        mediaConstraints = { video: false, audio: false };
        webRTCAdaptor;
        websocketURL;
        playOrder: any[] = ["webrtc", "hls"];


        constructor($scope: IKTAntPlayerScope,
            private $timeout: ng.ITimeoutService,
            private settings: common.IBaseSettings) {
            super($scope);

            selfScope = this;

            this.$scope.playButton = this.settings.ImagePath + 'images/play.png';
            this.websocketURL = "wss://fairtube.live:5443/WebRTCAppEE/websocket";
            this.$scope.autoPlay = true;
            var streamsFolder = "streams";
            this.$scope.streamId = "play1";

            if (this.$scope.streamId.startsWith(streamsFolder)) {
                /*
                * If name starts with streams, it's hls or mp4 file to be played
                */
                var lastIndexOfDot = this.$scope.streamId.lastIndexOf(".")
                var streamPath = this.$scope.streamId.substring(streamsFolder.length + 1, lastIndexOfDot);
                var extension = this.$scope.streamId.substring(lastIndexOfDot + 1);
                this.initializeHLSPlayer(streamPath, extension, null);
            }
            else {
                /*
                 * Check that which one is in the first order
                */
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

            //this.Intitalize();


        }

        public playPause(play: boolean = true): void {
            if (play) {
                this.startPlaying();
                $('.play-pause').addClass('pause').removeClass('play').prop('disabled', true);
                $('#play').css('width', '0');
            } else {
                this.$scope.retry = 0;
                this.stopPlaying();
                $('.play-pause').addClass('play').removeClass('pause').prop('disabled', true);
            }
        }

        public onStopped() {
            $('#play').css('width', '20%');
            $(".play-pause").addClass('play').removeClass('pause').prop('disabled', false);
            $(".fullscreen").prop('disabled', true);
        }

        private startPlaying() {
            this.webRTCAdaptor.play(this.$scope.streamId, null);
        }

        private stopPlaying() {
            this.webRTCAdaptor.stop(this.$scope.streamId);
        }

        public setStatus(status: any = '') {
            var statusField = $(".status");
            statusField.removeClass("text-success").removeClass("text-muted").removeClass("text-danger");
            if (status.length > 0) {
                statusField.text(status);
                statusField.addClass("text-muted");
            } else {
                statusField.text("");
            }
        }

        private checkAutoplay(): void {
            //if (window.performance) {
            //    if (window.performance.navigation.type != window.performance.navigation.TYPE_RELOAD) {
            //        if (this.$scope.autoPlay) {
            //            this.$timeout(() => { this.playPause(true); }, 200);
            //        }
            //    }
            //}
            if (this.$scope.autoPlay) {
                this.$timeout(() => { this.playPause(true); }, 200);
            }
        }

        private Intitalize(): void {

            this.webRTCAdaptor = new WebRTCAdaptor({
                websocket_url: this.websocketURL,
                mediaConstraints: this.mediaConstraints,
                peerconnection_config: this.pc_config,
                sdp_constraints: this.sdpConstraints,
                remoteVideoId: "remoteVideo",
                isPlayMode: true,
                debug: true,
                //bandwidth: 128,
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
                        //joined the stream
                        var video: any = document.getElementById("remoteVideo");
                        selfScope.setStatus("Playing...");
                        var promise = video.play();
                        if (promise !== undefined) {
                            promise.then(() => {
                                console.log("play started");
                                selfScope.setStatus();
                            }).catch(error => {
                                // Autoplay was prevented.
                                selfScope.setStatus("Play again");
                                selfScope.onStopped();
                                selfScope.stopPlaying();
                            });
                        }

                    } else if (info == "play_finished") {
                        //leaved the stream
                        console.log("play finished");
                        selfScope.onStopped();
                    } else if (info == "closed") {
                        selfScope.setStatus("Closed");
                        //console.log("Connection closed");
                        selfScope.onStopped();
                        if (typeof obj != "undefined") {
                            console.log("Connecton closed: " + JSON.stringify(obj));
                        }
                    } else if (info == "ice_connection_state_changed") {

                        console.log("iceConnectionState Changed: ", JSON.stringify(obj));
                    }
                    else if (info == "updated_stats") {
                        //obj is the PeerStats which has fields
                        //averageIncomingBitrate - kbits/sec
                        //currentIncomingBitrate - kbits/sec
                        //packetsLost - total number of packet lost
                        //fractionLost - fraction of packet lost
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
                        //selfScope.setStatus();
                    }
                },
                callbackError: function (error) {
                    selfScope.setStatus("Error, Try again");
                    selfScope.onStopped();
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    console.log("error callback: " + JSON.stringify(error));
                }
            });
        }



        private webrtcNoStreamCallback() {
            /**
         * If HLS is in the play order then try to play HLS, if not wait for WebRTC stream
         * In some cases user may want to remove HLS from the order and force to play WebRTC only
         * in these cases player only waits for WebRTC streams
         */
            setTimeout(function () {
                if (selfScope.playOrder.indexOf("hls") > -1) {
                    selfScope.tryToHLSPlay(selfScope.$scope.streamId, null, selfScope.hlsNoStreamCallback);
                }
                else {
                    selfScope.webRTCAdaptor.getStreamInfo(selfScope.$scope.streamId);
                }
            }, 3000);
        }

        private hlsNoStreamCallback() {
            //document.getElementById("video_info").innerHTML = "Stream will start playing automatically<br/>when it is live";
            setTimeout(function () {
                if (selfScope.playOrder.indexOf("webrtc") > -1) {
                    // It means there is no HLS stream, so try to play WebRTC stream
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

        private playWebRTCVideo() {
            document.getElementById("web_video").style.display = "block";
            var video: any = document.getElementById("remoteVideo");
            video.play().then(function (value) {
                //autoplay started
                console.log("play started");
                selfScope.setStatus();
            }).catch(function (error) {
                selfScope.setStatus("Play again");
                selfScope.onStopped();
                selfScope.stopPlaying();
                console.log("User interaction needed to start playing");
            });

        }

        private initializeHLSPlayer(name, extension, token) {
            this.hideWebRTCElements();
            this.startHLSPlayer(name, extension, token)
        }

        private startHLSPlayer(name, extension, token) {
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
            //document.getElementById("video_info").hidden = true;
        }

        private hideHLSElements() {
            document.getElementById("video_container").style.display = "none";
        }

        private hideWebRTCElements() {
            document.getElementById("web_video").style.display = "none";
            //document.getElementById("play_button").style.display = "none";
        }

        private initializeWebRTCPlayer(name, token, noStreamCallback) {

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


            //webRTCAdaptor is a global variable
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
                        //selfScope.webRTCAdaptor.play(name, token);
                    }
                    else if (info == "play_started") {
                        //joined the stream
                        console.log("play started");
                        //document.getElementById("video_info").style.display = "none";
                        selfScope.playWebRTCVideo();
                    } else if (info == "play_finished") {
                        //leaved the stream
                        console.log("play finished");
                        selfScope.onStopped();
                        //check that publish may start again
                        setTimeout(function () {
                            selfScope.webRTCAdaptor.getStreamInfo(name);
                        }, 3000);
                    }
                    else if (info == "closed") {
                        selfScope.setStatus("Closed");
                        selfScope.onStopped();
                        //console.log("Connection closed");
                        if (typeof description != "undefined") {
                            console.log("Connecton closed: " + JSON.stringify(description));
                        }
                    }

                },
                callbackError: function (error) {
                    //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
                    selfScope.onStopped();
                    selfScope.setStatus(JSON.stringify(error));
                    console.log("error callback: " + JSON.stringify(error));
                    if (error == "no_stream_exist") {
                        if (typeof noStreamCallback != "undefined") {
                            //noStreamCallback();
                        }
                    }
                    if (error == "notSetRemoteDescription") {
                        /*
                        * If getting codec incompatible or remote description error, it will redirect HLS player.
                        */
                        selfScope.tryToHLSPlay(name, token, selfScope.hlsNoStreamCallback);
                    }
                }
            });
        }

        private tryToHLSPlay(name, token, noStreamCallback) {
            fetch("https://fairtube.live:5443/WebRTCAppEE/streams/" + name + "_adaptive.m3u8", { method: 'HEAD' })
                .then(function (response) {
                    if (response.status == 200) {
                        // adaptive m3u8 exists,play it
                        selfScope.initializeHLSPlayer(name + "_adaptive", "m3u8", token);

                    }
                    else {
                        //adaptive m3u8 not exists, try m3u8 exists.
                        fetch("https://fairtube.live:5443/WebRTCAppEE/streams/" + name + ".m3u8", { method: 'HEAD' })
                            .then(function (response) {
                                if (response.status == 200) {
                                    //m3u8 exists, play it
                                    selfScope.initializeHLSPlayer(name, "m3u8", token);

                                }
                                else {
                                    //no m3u8 exists, try vod file
                                    fetch("https://fairtube.live:5443/WebRTCAppEE/streams/" + name + ".mp4", { method: 'HEAD' })
                                        .then(function (response) {
                                            if (response.status == 200) {
                                                //mp4 exists, play it
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
                scope: {

                },
                templateUrl: 'app/common/components/ant-player/ant-player.html',
                controller: 'KTAntPlayerController',
                link: (scope: any) => {
                    scope.$on('$destroy', () => {

                    });
                }
            };
        });
}