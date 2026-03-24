var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var services;
        (function (services) {
            class ConcurrencyService {
                constructor($log, settings, localStorageHelper, commonDataService, $q) {
                    this.$log = $log;
                    this.settings = settings;
                    this.localStorageHelper = localStorageHelper;
                    this.commonDataService = commonDataService;
                    this.$q = $q;
                }
                addHeader(config, key, value) {
                    if (!config) {
                        config = {};
                    }
                    if (!config.headers) {
                        config.headers = {};
                    }
                    config.headers[key] = value;
                    return config;
                }
                handleRequestConfig(config) {
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
                fetchTokenFromResponsePromise(promise) {
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
                copyConcurrencyToken(source, target) {
                    if (source && source.concurrencyToken && target) {
                        target.concurrencyToken = source.concurrencyToken;
                    }
                }
                getCSRF(token) {
                    if (token) {
                        var key = CryptoJS.enc.Utf8.parse(token.substr(0, 32));
                        var iv = CryptoJS.enc.Utf8.parse(this.settings.CSRFKey);
                        var date = moment().format('YYYY-MM-DD HH:mm:ss Z');
                        var csrf = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(date), key, {
                            keySize: 16,
                            iv: iv,
                            mode: CryptoJS.mode.ECB,
                            padding: CryptoJS.pad.Pkcs7
                        });
                        return csrf;
                    }
                }
            }
            services.ConcurrencyService = ConcurrencyService;
            angular.module('intranet.common.services').service('concurrencyService', ConcurrencyService);
        })(services = common.services || (common.services = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ConcurrencyService.js.map