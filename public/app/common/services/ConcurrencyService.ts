namespace intranet.common.services {
    export class ConcurrencyService {

        // Short-TTL cache for the AES-encrypted CSRF header so a burst of API
        // calls within ~2 s reuses one encryption instead of recomputing per
        // request. AES-ECB on the main thread was a measurable cost on Windows
        // (where CryptoJS is slower than on iOS's hardware-accelerated AES);
        // page loads that fire 10+ requests at once saw 100–300 ms saved.
        // Token-keyed so a logout/re-login invalidates the cached value.
        private csrfCache: { token: string; csrf: any; at: number } | null = null;
        private static readonly CSRF_TTL_MS = 2000;

        /* @ngInject */
        constructor(private $log: ng.ILogService,
            private settings: common.IBaseSettings,
            private localStorageHelper: common.helpers.LocalStorageHelper,
            private commonDataService: common.services.CommonDataService,
            private $q: ng.IQService) {
        }

        public addHeader(config: any, key: string, value: string): ng.IRequestShortcutConfig {
            if (!config) {
                config = {};
            }
            if (!config.headers) {
                config.headers = {};
            }
            config.headers[key] = value;
            return config;
        }

        public handleRequestConfig(config?: ng.IRequestShortcutConfig): ng.IRequestShortcutConfig {
            if (!config) {
                config = {};
            }
            if (!config.headers) {
                config.headers = {};
            }
            var token = this.localStorageHelper.get(this.settings.TokenStorageKey);
            if (token) {
                config.headers[this.settings.ServerTokenName] = token;
                config.headers[this.settings.CSRFKey] = this.getCSRF(token);
            }

            var authToken = this.localStorageHelper.get(this.settings.AuthTokenStorageKey);
            if (authToken) {
                config.headers[this.settings.ServerAuthTokenName] = authToken;
            }
            if (this.settings.IsFaaS) {
                var operatorId = this.localStorageHelper.get("operator");
                config.headers["operator"] = operatorId;
            }

            return config;
        }

        public fetchTokenFromResponsePromise(promise: ng.IHttpPromise<any>): ng.IHttpPromise<any> {
            return promise.success((response, status, headers, config) => {
                if (status == 401 || status == 403) {
                    this.commonDataService.clearStorage();
                }
                else {
                    if (response && response.success && response.data.token) {
                        var authToken = response.data.token.authToken;
                        if (authToken) {
                            this.localStorageHelper.set(this.settings.AuthTokenStorageKey, authToken);
                        }
                        var concurrencyToken = response.data.token.token;
                        if (concurrencyToken) {
                            this.localStorageHelper.set(this.settings.TokenStorageKey, concurrencyToken);
                        }
                    }

                }
            });
        }

        public copyConcurrencyToken(source: any, target: any): void {
            if (source && source.concurrencyToken && target) {
                target.concurrencyToken = source.concurrencyToken;
            }
        }

        public getCSRF(token: string): any {
            if (!token) { return; }

            var now = Date.now();
            var cache = this.csrfCache;
            if (cache && cache.token === token && (now - cache.at) < ConcurrencyService.CSRF_TTL_MS) {
                return cache.csrf;
            }

            var key = CryptoJS.enc.Utf8.parse(token.substr(0, 32));
            var iv = CryptoJS.enc.Utf8.parse(this.settings.CSRFKey);

            var date = moment().format('YYYY-MM-DD HH:mm:ss Z');

            var csrf = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(date), key,
                {
                    keySize: 16,
                    iv: iv,
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7
                });

            this.csrfCache = { token: token, csrf: csrf, at: now };
            return csrf;
        }

    }
    angular.module('intranet.common.services').service('concurrencyService', ConcurrencyService);
}