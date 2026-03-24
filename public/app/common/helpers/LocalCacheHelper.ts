namespace intranet.common.helpers {
    export class LocalCacheHelper {
        private cacheKey: string;

        /* @ngInject */
        constructor(private $cacheFactory: ng.ICacheFactoryService,
            private settings: common.IBaseSettings) {
            this.cacheKey = 'aale_' + this.settings.WebApp;
        }

        public get(key: string, cacheKeyGroup: string = this.cacheKey): any {
            var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
            if (cachedObject) {
                return cachedObject.get(key);
            }
            return null;
        }

        public put(key: string, value: any, cacheKeyGroup: string = this.cacheKey): void {
            var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
            if (!cachedObject) {
                cachedObject = this.$cacheFactory(cacheKeyGroup);
            }
            cachedObject.put(key, value);
        }

        public remove(key: string, cacheKeyGroup: string = this.cacheKey): void {
            var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
            if (cachedObject) {
                cachedObject.remove(key);
            }
        }

        public removeAll(cacheKeyGroup: string = this.cacheKey): void {
            var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
            if (cachedObject) {
                cachedObject.removeAll();
            }
        }

        public destroy(cacheKeyGroup: string = this.cacheKey): void {
            var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
            if (cachedObject) {
                cachedObject.destroy();
            }
        }
    }
    angular.module('intranet.common.cache').service('localCacheHelper', LocalCacheHelper);
}