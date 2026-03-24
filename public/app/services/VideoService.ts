module intranet.services {

    export class VideoService {
        constructor(private baseService: common.services.BaseService) {
        }

        public getVideos(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('video', data);
        }

        public getAllVideos(): ng.IHttpPromise<any> {
            return this.baseService.get('video/getallvideos');
        }

        public addVideo(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('video/addvideo', data);
        }

        public deleteVideo(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('video/deletevideo/' + id);
        }

        public updateVideo(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('video/updatevideo', data);
        }

        public linkVideo(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('video/linkvideo', data);
        }

        public getAllVideosDetail(): ng.IHttpPromise<any> {
            return this.baseService.get('video/getallvideosdetail');
        }

        public getVideoByEvent(eventid: any): ng.IHttpPromise<any> {
            return this.baseService.get('video/getvideobyevent/' + eventid);
        }
        public get2kTV(url: any, channelId: any, ip: any): ng.IHttpPromise<any> {
            var furl = url + "?chid=" + channelId + "&ip=" + ip;
            return this.baseService.outsideGet(furl, { ignoreLoadingBar: true });
        }
    }

    angular.module('intranet.services').service('videoService', VideoService);
}