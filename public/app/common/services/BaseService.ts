namespace intranet.common.services {
    export interface IHttpPromiseWithCancel<T> {
        promise: ng.IHttpPromise<T>;
        cancel: () => void;
    }

    export class BaseService {

        shortTime = 20000;
        longTime = 600000;
        reportTime = 180000;

        /* @ngInject */
        constructor(protected $http: ng.IHttpService,
            protected settings: IBaseSettings,
            protected $q: ng.IQService,
            protected concurrencyService: services.ConcurrencyService) {
        }

        public get<T>(route: string, config?: any): ng.IHttpPromise<T> {
            config = this.concurrencyService.handleRequestConfig(config);
            if (!config.timeout) { config.timeout = this.shortTime; }
            return this.$http.get<T>(this.settings.ApiBaseUrl + route, config);
            // return this.concurrencyService.handleResponsePromise(promise);
        }


        public outsideGet<T>(route: string, config?: any): ng.IHttpPromise<T> {
            return this.$http({
                method: 'GET',
                url: route,
                headers: {}
            });
        }

        public outsidePost<T>(route: string, data: any, header: any): ng.IHttpPromise<T> {
            return this.$http({
                method: 'POST',
                data: data,
                url: route,
                headers: header
            });
        }

        public outsideGetRadar<T>(route: string, config?: any): ng.IHttpPromise<T> {
            return this.$http({
                method: 'GET',
                url: "https://odds.sports999.io/" + route,
                headers: {}
            });
        }

        public outsideJsonp<T>(route: string): ng.IHttpPromise<T> {
            return this.$http.jsonp(route);
        }



        public post<T>(route: string, data: any, config?: any): ng.IHttpPromise<T> {
            config = this.concurrencyService.handleRequestConfig(config);
            if (!config.timeout && !config.ignoreTimeout) { config.timeout = this.shortTime; }
            return this.$http.post<T>(this.settings.ApiBaseUrl + route, data, config);
            // return this.concurrencyService.handleResponsePromise(promise, data);
        }

        public delete<T>(route: string, data: any, config?: ng.IRequestShortcutConfig): ng.IHttpPromise<T> {
            config = this.concurrencyService.handleRequestConfig(config);
            return this.$http.delete<T>(this.settings.ApiBaseUrl + route, config);
        }

        public getWithCancel<T>(route: string): IHttpPromiseWithCancel<T> {
            var canceller = this.$q.defer();
            var cancel = () => {
                canceller.resolve();
            };

            var config = this.concurrencyService.handleRequestConfig();
            if (!config.timeout) { config.timeout = canceller.promise; }
            var promise = this.get<T>(route, config);

            return {
                promise: promise,
                cancel: cancel
            };
        }

        public postWithCancel<T>(route: string, data: any): IHttpPromiseWithCancel<T> {
            var canceller = this.$q.defer();
            var cancel = () => {
                canceller.resolve();
            };

            var config = this.concurrencyService.handleRequestConfig();
            if (!config.timeout) { config.timeout = canceller.promise; }
            var promise = this.post<T>(route, data, config);

            return {
                promise: promise,
                cancel: cancel
            };
        }
    }
    angular.module('intranet.common.services').service('baseService', BaseService);
}