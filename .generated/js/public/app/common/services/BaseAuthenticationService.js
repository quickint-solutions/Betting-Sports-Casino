var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class BaseAuthenticationService {
                constructor($q, settings, $http, $location, isMobile, WSSocketService, $state, $timeout, concurrencyService, commonDataService, toasterService, $base64) {
                    this.$q = $q;
                    this.settings = settings;
                    this.$http = $http;
                    this.$location = $location;
                    this.isMobile = isMobile;
                    this.WSSocketService = WSSocketService;
                    this.$state = $state;
                    this.$timeout = $timeout;
                    this.concurrencyService = concurrencyService;
                    this.commonDataService = commonDataService;
                    this.toasterService = toasterService;
                    this.$base64 = $base64;
                }
                authenticate(username, password, UID, model) {
                    var prefix = 'Basic ';
                    if (model.mode == 1) {
                        prefix = 'Basic2 ';
                        username = model.mobile + '' + username;
                    }
                    var base64 = this.$base64.encode(username + ':' + password);
                    var config = {};
                    config = this.concurrencyService.addHeader(config, 'Authorization', prefix + base64);
                    config = this.concurrencyService.addHeader(config, this.settings.CSRFKey, UID);
                    var promise = this.$http.post(this.settings.ApiBaseUrl + "authenticate/login", model, config);
                    return this.concurrencyService.fetchTokenFromResponsePromise(promise);
                }
                authenticateWallet(t1, t2, t3, UID, model) {
                    var base64 = this.$base64.encode(t1 + ':' + t2 + ':' + t3);
                    var config = {};
                    config = this.concurrencyService.addHeader(config, 'Authorization', 'wallet ' + base64);
                    config = this.concurrencyService.addHeader(config, this.settings.CSRFKey, UID);
                    var promise = this.$http.post(this.settings.ApiBaseUrl + "authenticate/login", model, config);
                    return this.concurrencyService.fetchTokenFromResponsePromise(promise);
                }
            }
            services.BaseAuthenticationService = BaseAuthenticationService;
            angular.module('intranet.common.services').service('baseAuthenticationService', BaseAuthenticationService);
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BaseAuthenticationService.js.map