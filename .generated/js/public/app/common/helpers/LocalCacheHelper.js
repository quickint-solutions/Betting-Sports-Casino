var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class LocalCacheHelper {
                constructor($cacheFactory, settings) {
                    this.$cacheFactory = $cacheFactory;
                    this.settings = settings;
                    this.cacheKey = 'aale_' + this.settings.WebApp;
                }
                get(key, cacheKeyGroup = this.cacheKey) {
                    var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
                    if (cachedObject) {
                        return cachedObject.get(key);
                    }
                    return null;
                }
                put(key, value, cacheKeyGroup = this.cacheKey) {
                    var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
                    if (!cachedObject) {
                        cachedObject = this.$cacheFactory(cacheKeyGroup);
                    }
                    cachedObject.put(key, value);
                }
                remove(key, cacheKeyGroup = this.cacheKey) {
                    var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
                    if (cachedObject) {
                        cachedObject.remove(key);
                    }
                }
                removeAll(cacheKeyGroup = this.cacheKey) {
                    var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
                    if (cachedObject) {
                        cachedObject.removeAll();
                    }
                }
                destroy(cacheKeyGroup = this.cacheKey) {
                    var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
                    if (cachedObject) {
                        cachedObject.destroy();
                    }
                }
            }
            helpers.LocalCacheHelper = LocalCacheHelper;
            angular.module('intranet.common.cache').service('localCacheHelper', LocalCacheHelper);
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LocalCacheHelper.js.map