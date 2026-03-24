
namespace intranet.common.services {

    export class BaseAuthenticationService {
        constructor(
            private $q: ng.IQService,
            private settings: common.IBaseSettings,
            protected $http: ng.IHttpService,
            private $location: any,
            private isMobile: any,
            private WSSocketService: any,
            private $state: ng.ui.IStateService,
            private $timeout: ng.ITimeoutService,
            protected concurrencyService: services.ConcurrencyService,
            private commonDataService: common.services.CommonDataService,
            private toasterService: intranet.common.services.ToasterService,
            private $base64: any) {
        }

        public authenticate(username: string, password: string, UID: any, model: any): ng.IHttpPromise<any> {
            var prefix = 'Basic ';
            if (model.mode == 1) { prefix = 'Basic2 '; username = model.mobile + '' + username; }

            var base64 = this.$base64.encode(username + ':' + password);
            var config: any = {};
            config = this.concurrencyService.addHeader(config, 'Authorization', prefix + base64);
            config = this.concurrencyService.addHeader(config, this.settings.CSRFKey, UID);
            var promise = this.$http.post(this.settings.ApiBaseUrl + "authenticate/login", model, config);
            return this.concurrencyService.fetchTokenFromResponsePromise(promise);
        }

        public authenticateWallet(t1: string, t2: string, t3: any, UID: any, model: any): ng.IHttpPromise<any> {
            var base64 = this.$base64.encode(t1 + ':' + t2 + ':' + t3);
            var config: any = {};
            config = this.concurrencyService.addHeader(config, 'Authorization', 'wallet ' + base64);
            config = this.concurrencyService.addHeader(config, this.settings.CSRFKey, UID);
            var promise = this.$http.post(this.settings.ApiBaseUrl + "authenticate/login", model, config);
            return this.concurrencyService.fetchTokenFromResponsePromise(promise);
        }
    }

    angular.module('intranet.common.services').service('baseAuthenticationService', BaseAuthenticationService);
}