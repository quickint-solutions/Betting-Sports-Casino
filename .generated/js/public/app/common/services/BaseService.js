var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class BaseService {
                constructor($http, settings, $q, concurrencyService) {
                    this.$http = $http;
                    this.settings = settings;
                    this.$q = $q;
                    this.concurrencyService = concurrencyService;
                    this.shortTime = 20000;
                    this.longTime = 600000;
                    this.reportTime = 180000;
                }
                get(route, config) {
                    config = this.concurrencyService.handleRequestConfig(config);
                    if (!config.timeout) {
                        config.timeout = this.shortTime;
                    }
                    return this.$http.get(this.settings.ApiBaseUrl + route, config);
                }
                outsideGet(route, config) {
                    return this.$http({
                        method: 'GET',
                        url: route,
                        headers: {}
                    });
                }
                outsidePost(route, data, header) {
                    return this.$http({
                        method: 'POST',
                        data: data,
                        url: route,
                        headers: header
                    });
                }
                outsideGetRadar(route, config) {
                    return this.$http({
                        method: 'GET',
                        url: "https://odds.sports999.io/" + route,
                        headers: {}
                    });
                }
                outsideJsonp(route) {
                    return this.$http.jsonp(route);
                }
                post(route, data, config) {
                    config = this.concurrencyService.handleRequestConfig(config);
                    if (!config.timeout && !config.ignoreTimeout) {
                        config.timeout = this.shortTime;
                    }
                    return this.$http.post(this.settings.ApiBaseUrl + route, data, config);
                }
                delete(route, data, config) {
                    config = this.concurrencyService.handleRequestConfig(config);
                    return this.$http.delete(this.settings.ApiBaseUrl + route, config);
                }
                getWithCancel(route) {
                    var canceller = this.$q.defer();
                    var cancel = () => {
                        canceller.resolve();
                    };
                    var config = this.concurrencyService.handleRequestConfig();
                    if (!config.timeout) {
                        config.timeout = canceller.promise;
                    }
                    var promise = this.get(route, config);
                    return {
                        promise: promise,
                        cancel: cancel
                    };
                }
                postWithCancel(route, data) {
                    var canceller = this.$q.defer();
                    var cancel = () => {
                        canceller.resolve();
                    };
                    var config = this.concurrencyService.handleRequestConfig();
                    if (!config.timeout) {
                        config.timeout = canceller.promise;
                    }
                    var promise = this.post(route, data, config);
                    return {
                        promise: promise,
                        cancel: cancel
                    };
                }
            }
            services.BaseService = BaseService;
            angular.module('intranet.common.services').service('baseService', BaseService);
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BaseService.js.map