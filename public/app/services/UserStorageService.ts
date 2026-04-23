namespace intranet.services {

    export class UserStorageService {
        private prefix: string;

        /* @ngInject */
        constructor(
            private localStorageService: any,
            private settings: common.IBaseSettings,
            private $base64: any
        ) {
            this.prefix = 'aale_' + this.settings.WebApp;
        }

        public getAllLoginData(): any {
            var result: any = {};
            var encodedKeys: string[] = this.localStorageService.keys() || [];

            for (var i = 0; i < encodedKeys.length; i++) {
                var encKey = encodedKeys[i];
                try {
                    var originalKey = this.$base64.decode(encKey);
                    var encValue = this.localStorageService.get(encKey);
                    if (!encValue) { continue; }

                    var dcMsg = CryptoJS.TripleDES.decrypt(
                        encValue,
                        this.prefix + '@' + originalKey
                    );
                    if (!dcMsg) { continue; }

                    var plain = dcMsg.toString(CryptoJS.enc.Utf8);
                    try { result[originalKey] = JSON.parse(plain); }
                    catch (e) { result[originalKey] = plain; }
                } catch (ex) {
                    continue;
                }
            }
            return result;
        }
    }

    angular.module('intranet.services').service('userStorageService', UserStorageService);
}
