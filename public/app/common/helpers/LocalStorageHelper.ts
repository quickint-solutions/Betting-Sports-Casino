namespace intranet.common.helpers {

    export class LocalStorageHelper {
        prefix: string;

        constructor(private localStorageService: any,
            private $cacheFactory: ng.ICacheFactoryService,
            private settings: IBaseSettings,
            private $base64: any
        ) {
            this.prefix = 'aale_' + this.settings.WebApp;
        }


        public set(key: string, value: any): void {
            if (this.settings.StorageMode == common.enums.StorageMode.SessionStorage) { this.setToCache(key, value); }
            else { this.setToLocal(key, value); }
        }
        private setToLocal(key: string, value: any): void {
            var encrypted = CryptoJS.TripleDES.encrypt(JSON.stringify(value), this.prefix + '@' + key);
            var enc_key = this.$base64.encode(key);
            this.localStorageService.set(enc_key, encrypted.toString());
        }
        public setToCache(key: string, value: any, cacheKeyGroup: string = this.prefix): void {
            var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
            if (!cachedObject) {
                cachedObject = this.$cacheFactory(cacheKeyGroup);
            }
            cachedObject.put(key, value);
        }



        public get(key: string): any {
            if (this.settings.StorageMode == common.enums.StorageMode.SessionStorage) { return this.getFromCache(key); }
            else { return this.getFromLocal(key); }
        }
        private getFromLocal(key: string): any {
            var enc_key = this.$base64.encode(key);
            var msg = this.localStorageService.get(enc_key);
            if (msg) {
                var dcMsg = CryptoJS.TripleDES.decrypt(msg, this.prefix + '@' + key);
                if (dcMsg)
                    try {
                        return JSON.parse(dcMsg.toString(CryptoJS.enc.Utf8));
                    }
                    catch (ex){
                        return '';
                    }
                else
                    return '';
            }
        }
        private getFromCache(key: string, cacheKeyGroup: string = this.prefix): any {
            var cachedObject = this.$cacheFactory.get(cacheKeyGroup);
            if (cachedObject) {
                return cachedObject.get(key);
            }
            return null;
        }


        public clearAll(): void {
            this.localStorageService.clearAll();
            
        }

        public setInArray(key: string, value: any): void {
            var data: any[] = this.get(key);
            if (!data) { data = []; }
            data.push(value);
            this.set(key, data);
        }

        public removeFromArray(key: string, value: any): void {
            var data = [];
            data = this.get(key);
            var index = data.indexOf(value);
            if (index > -1) {
                data.splice(index, 1);
            }
            this.set(key, data);
        }

        public getUserTokenFromCookie(): any {
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

        public setCookie(key: string, value: any): void {
            var encrypted = CryptoJS.TripleDES.encrypt(JSON.stringify(value), this.prefix + '@' + key);
            var enc_key = this.$base64.encode(key);
            this.localStorageService.cookie.set(enc_key, encrypted.toString());
        }

        public getCookie(key: string): any {
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
                //return JSON.parse(CryptoJS.TripleDES.decrypt(msg, this.prefix + '@' + key).toString(CryptoJS.enc.Utf8));
            }
        }
    }
    angular.module('intranet.common.cache').service('localStorageHelper', LocalStorageHelper);
}