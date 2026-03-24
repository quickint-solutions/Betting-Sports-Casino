var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTWCSAudioPubController extends common.ControllerBase {
                constructor($scope, $timeout, $interval, $window, settings) {
                    super($scope);
                    this.$timeout = $timeout;
                    this.$interval = $interval;
                    this.$window = $window;
                    this.settings = settings;
                    this.SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
                    this.STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
                    this.CONNECTION_QUALITY = Flashphoner.constants.CONNECTION_QUALITY;
                    this.MEDIA_DEVICE_KIND = Flashphoner.constants.MEDIA_DEVICE_KIND;
                    this.TRANSPORT_TYPE = Flashphoner.constants.TRANSPORT_TYPE;
                    this.CONNECTION_QUALITY_UPDATE_TIMEOUT_MS = 10000;
                    this.STAT_INTERVAL = 1000;
                    this.currentVolumeValue = 50;
                    this.currentGainValue = 50;
                    this.extensionId = "nlbaajplpmleofphigmgaifhoikjmbkg";
                    this.videoBytesSent = 0;
                    this.audioBytesSent = 0;
                    this.videoBytesReceived = 0;
                    this.audioBytesReceived = 0;
                    this.playConnectionQualityStat = {};
                    this.publishConnectionQualityStat = {};
                    var listenMute = this.$scope.$watch("isMute", (newval, oldval) => {
                        if (newval != oldval) {
                            this.audioStatusChanged(this.$scope.isMute);
                        }
                    });
                    this.$scope.audioStatusSelection = { id: this.$scope.isMute };
                    this.$scope.audioStatuslst = [];
                    this.$scope.audioStatuslst.push({ id: true, name: 'On' });
                    this.$scope.audioStatuslst.push({ id: false, name: 'Off' });
                    this.$scope.audioCommentaryMode = false;
                    this.$scope.audioCommentaryStatus = { id: false };
                    this.$scope.audioCommentaryStatusList = [];
                    this.$scope.audioCommentaryStatusList.push({ id: true, name: 'On' });
                    this.$scope.audioCommentaryStatusList.push({ id: false, name: 'Off' });
                    jQuery("#urlServer").val("wss://funbetexchange.com:8443");
                    jQuery("#publishStream").val("audio_cmt");
                    this.$scope.$on('$destroy', () => {
                        listenMute();
                    });
                }
                init_page() {
                    try {
                        Flashphoner.init({
                            flashMediaProviderSwfLocation: 'https://funbetexchange.com:8888/shared/examples/media-provider.swf',
                            receiverLocation: 'https://funbetexchange.com:8888/shared/examples/demo/dependencies/websocket-player/WSReceiver2.js',
                            decoderLocation: 'https://funbetexchange.com:8888/shared/examples/demo/dependencies/websocket-player/video-worker2.js',
                            screenSharingExtensionId: this.extensionId,
                            mediaProvidersReadyCallback: function (mediaProviders) { }
                        });
                    }
                    catch (e) {
                        alert("Your browser doesn't support Flash or WebRTC technology necessary for work of an example");
                        return;
                    }
                    this.localVideo = document.getElementById("localVideo");
                    var self = this;
                    Flashphoner.getMediaDevices(null, true).then(function (list) {
                        list.audio.forEach(function (device) {
                            var audio = document.getElementById("audioInput");
                            var deviceInList = false;
                            for (var i = 0; i < audio.options.length; i++) {
                                if (audio.options[i].value === device.id) {
                                    deviceInList = true;
                                    break;
                                }
                            }
                            if (!deviceInList) {
                                var option = document.createElement("option");
                                option.text = device.label || device.id;
                                option.value = device.id;
                                audio.appendChild(option);
                            }
                        });
                        if (list.audio.length === 0) {
                            self.setStatus("No Audio Device Detected.", "audio");
                        }
                        else {
                            self.setStatus("Device Found", "audio");
                        }
                    }).catch(function (error) {
                        self.setStatus("Failed to get media devices", "audio");
                    });
                    this.readyControls();
                }
                readyControls() {
                    var self = this;
                    jQuery("#audioInput").change(function () {
                        if (self.publishStream) {
                            self.publishStream.switchMic($(this).val());
                        }
                    });
                }
                connect_Btn() {
                    this.setStatus("Connecting...", "connection");
                    this.setStatus("");
                    if (this.statsIntervalID)
                        this.$interval.cancel(this.statsIntervalID);
                    this.ConnectAndPublish();
                }
                disconnect_Btn() {
                    var session = Flashphoner.getSessions()[0];
                    if (session) {
                        session.disconnect();
                        this.onDisconnected();
                    }
                }
                onDisconnected() {
                    this.setSocketUrl(false);
                    this.publishStream = null;
                    if (this.statsIntervalID)
                        this.$interval.cancel(this.statsIntervalID);
                }
                publish_Btn() {
                    this.setStatus("Publishing...");
                    var self = this;
                    if (Browser.isSafariWebRTC()) {
                        Flashphoner.playFirstVideo(this.localVideo, true).then(function () {
                            self.publish();
                        });
                        return;
                    }
                    this.publish();
                }
                ConnectAndPublish() {
                    var url = jQuery('#urlServer').val();
                    var tm = 1000;
                    var self = this;
                    console.log("Create new session with url " + url);
                    Flashphoner.createSession({ urlServer: url, timeout: tm })
                        .on(self.SESSION_STATUS.ESTABLISHED, function (session) {
                        self.publish_Btn();
                        self.setStatus(session.status(), "connection");
                    }).on(self.SESSION_STATUS.DISCONNECTED, function () {
                        self.setStatus(self.SESSION_STATUS.DISCONNECTED, "connection");
                        self.onDisconnected();
                    }).on(self.SESSION_STATUS.FAILED, function () {
                        self.setStatus(self.SESSION_STATUS.FAILED, "connection");
                        self.onDisconnected();
                    });
                }
                getConstraints() {
                    var constraints = {
                        audio: true,
                        video: false,
                    };
                    constraints.audio = {
                        deviceId: $('#audioInput').val()
                    };
                    return constraints;
                }
                publish() {
                    var streamName = jQuery('#publishStream').val();
                    var constraints = this.getConstraints();
                    var session = Flashphoner.getSessions()[0];
                    var self = this;
                    this.publishStream = session.createStream({
                        name: streamName,
                        display: self.localVideo,
                        cacheLocalResources: true,
                        constraints: constraints,
                    }).on(this.STREAM_STATUS.PUBLISHING, function (stream) {
                        if (jQuery("#muteAudioToggle").is(":checked")) {
                            self.muteAudio();
                        }
                        self.publishStream.setMicrophoneGain(self.currentGainValue);
                        self.setStatus(self.STREAM_STATUS.PUBLISHING, "");
                        self.onPublishing(stream);
                    }).on(self.STREAM_STATUS.UNPUBLISHED, function () {
                        self.setStatus(self.STREAM_STATUS.UNPUBLISHED, "");
                        self.onDisconnected();
                    }).on(self.STREAM_STATUS.FAILED, function () {
                        self.setStatus(self.STREAM_STATUS.FAILED, "");
                        self.onDisconnected();
                    });
                    this.publishStream.publish();
                }
                audioStatusChanged(selectedstatus) {
                    this.$scope.audioStatusSelection.id = selectedstatus;
                    if (selectedstatus == true) {
                        this.muteAudio();
                    }
                    else {
                        this.unmuteAudio();
                    }
                }
                audioCommentaryStatusChanged(selectedstatus) {
                    this.$scope.audioCommentaryStatus.id = selectedstatus;
                    this.$scope.audioCommentaryMode = selectedstatus;
                    if (!selectedstatus) {
                        this.disconnect_Btn();
                    }
                    else {
                        this.init_page();
                    }
                }
                muteAudio() {
                    if (this.publishStream) {
                        this.publishStream.muteAudio();
                    }
                }
                unmuteAudio() {
                    if (this.publishStream) {
                        this.publishStream.unmuteAudio();
                    }
                }
                onPublishing(stream) {
                    this.setSocketUrl();
                    if (!this.statsIntervalID) {
                        this.statsIntervalID = this.$interval(() => { this.loadStats(); }, this.STAT_INTERVAL);
                    }
                    stream.setVolume(this.currentVolumeValue);
                }
                loadStats() {
                    var self = this;
                    if (this.publishStream) {
                        this.publishStream.getStats(function (stats) {
                            if (stats && stats.outboundStream) {
                                if (stats.outboundStream.audio) {
                                    self.setStatus(stats.outboundStream.audio.bytesSent + " sent", "audio");
                                }
                            }
                        });
                    }
                }
                setSocketUrl(ispublished = true) {
                    var config = { url: '', streamName: '' };
                    if (ispublished) {
                        config.url = jQuery('#urlServer').val() + '/live';
                        config.streamName = jQuery('#publishStream').val();
                    }
                    if (this.$scope.audioConfigFun) {
                        this.$scope.audioConfigFun({ config: config });
                    }
                }
                setStatus(msg, type = 'publish') {
                    if (type == "connection") {
                        jQuery("#connectionStatus").text(msg);
                    }
                    else if (type == "audio") {
                        jQuery("#audioStatus").text(msg);
                    }
                    else {
                        jQuery("#publishStatus").text(msg);
                    }
                }
            }
            angular.module('kt.components')
                .controller('KTWCSAudioPubController', KTWCSAudioPubController);
            angular.module('kt.components')
                .directive('ktWcsAudioPub', () => {
                return {
                    restrict: 'EA',
                    replace: true,
                    scope: {
                        isMute: '=',
                        audioConfigFun: '&',
                        audioCommentaryMode: '='
                    },
                    templateUrl: 'app/common/components/wcs-audio-pub/wcs-audio-pub.html',
                    controller: 'KTWCSAudioPubController',
                    link: (scope) => {
                        scope.$on('$destroy', () => {
                        });
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=wcs-audio-pub-controller.js.map