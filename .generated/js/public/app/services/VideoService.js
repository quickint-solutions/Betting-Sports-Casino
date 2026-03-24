var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class VideoService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getVideos(data) {
                return this.baseService.post('video', data);
            }
            getAllVideos() {
                return this.baseService.get('video/getallvideos');
            }
            addVideo(data) {
                return this.baseService.post('video/addvideo', data);
            }
            deleteVideo(id) {
                return this.baseService.get('video/deletevideo/' + id);
            }
            updateVideo(data) {
                return this.baseService.post('video/updatevideo', data);
            }
            linkVideo(data) {
                return this.baseService.post('video/linkvideo', data);
            }
            getAllVideosDetail() {
                return this.baseService.get('video/getallvideosdetail');
            }
            getVideoByEvent(eventid) {
                return this.baseService.get('video/getvideobyevent/' + eventid);
            }
            get2kTV(url, channelId, ip) {
                var furl = url + "?chid=" + channelId + "&ip=" + ip;
                return this.baseService.outsideGet(furl, { ignoreLoadingBar: true });
            }
        }
        services.VideoService = VideoService;
        angular.module('intranet.services').service('videoService', VideoService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=VideoService.js.map