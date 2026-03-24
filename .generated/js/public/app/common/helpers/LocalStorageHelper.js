var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class LocalStorageHelper {
                constructor(localStorageService, $cacheFactory, settings, $base64) {
                    this.localStorageService = localStorageService;
                    this.$cacheFactory = $cacheFactory;
                    this.settings = settings;
                    this.$base64 = $base64;
                    this.prefix = 'aale_' + this.settings.WebApp;
                }
                set(key, value) {
                    if (this.settings.StorageMode == common.enums.StorageMode.SessionStorage) {
                        this.setToCache(key, value);
                    }
                    else {
                        this.setToLocal(key, value);
                    }
                }
                setToLocal(key, value) {
                    var encrypted = CryptoJS.TripleDES.encrypt(JSON.stringify(value), this.prefix + '@' + key);
                    var enc_key = this.$base64.encode(key);
                    this.localStorageService.set(enc_key, encrypted.toString());
                }
                setToCache(key, value, cacheKeyGroup = this.prefix) {
                    var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
                    if (!cachedObject) {
                        cachedObject = this.$cacheFactory(cacheKeyGroup);
                    }
                    cachedObject.put(key, value);
                }
                get(key) {
                    if (this.settings.StorageMode == common.enums.StorageMode.SessionStorage) {
                        return this.getFromCache(key);
                    }
                    else {
                        return this.getFromLocal(key);
                    }
                }
                getFromLocal(key) {
                    var enc_key = this.$base64.encode(key);
                    var msg = this.localStorageService.get(enc_key);
                    if (msg) {
                        var dcMsg = CryptoJS.TripleDES.decrypt(msg, this.prefix + '@' + key);
                        if (dcMsg)
                            try {
                                return JSON.parse(dcMsg.toString(CryptoJS.enc.Utf8));
                            }
                            catch (ex) {
                                return '';
                            }
                        else
                            return '';
                    }
                }
                getFromCache(key, cacheKeyGroup = this.prefix) {
                    var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
                    if (cachedObject) {
                        return cachedObject.get(key);
                    }
                    return null;
                }
                clearAll() {
                    this.localStorageService.clearAll();
                }
                setInArray(key, value) {
                    var data = this.get(key);
                    if (!data) {
                        data = [];
                    }
                    data.push(value);
                    this.set(key, data);
                }
                removeFromArray(key, value) {
                    var data = [];
                    data = this.get(key);
                    var index = data.indexOf(value);
                    if (index > -1) {
                        data.splice(index, 1);
                    }
                    this.set(key, data);
                }
                getUserTokenFromCookie() {
                    var enc_key = this.$base64.encode("user.token");
                    var existing = this.localStorageService.cookie.get(enc_key);
                    if (!existing) {
                        var date = new Date().toLocaleDateString();
                        var encrypted = CryptoJS.TripleDES.encrypt(date, this.prefix);
                        existing = encrypted.toString();
                        this.localStorageService.cookie.set(enc_key, encrypted.toString());
                    }
                    return existing;
                }
                setCookie(key, value) {
                    var encrypted = CryptoJS.TripleDES.encrypt(JSON.stringify(value), this.prefix + '@' + key);
                    var enc_key = this.$base64.encode(key);
                    this.localStorageService.cookie.set(enc_key, encrypted.toString());
                }
                getCookie(key) {
                    var enc_key = this.$base64.encode(key);
                    var msg = this.localStorageService.cookie.get(enc_key);
                    if (msg) {
                        var dcMsg = CryptoJS.TripleDES.decrypt(msg, this.prefix + '@' + key);
                        if (dcMsg)
                            try {
                                return JSON.parse(dcMsg.toString(CryptoJS.enc.Utf8));
                            }
                            catch (ex) {
                                return '';
                            }
                        else
                            return '';
                    }
                }
            }
            helpers.LocalStorageHelper = LocalStorageHelper;
            angular.module('intranet.common.cache').service('localStorageHelper', LocalStorageHelper);
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LocalStorageHelper.js.map