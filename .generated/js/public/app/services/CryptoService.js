var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class CryptoService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            addCryptoToken(data) {
                return this.baseService.post('crypto/addcryptotoken', data, { timeout: this.baseService.reportTime });
            }
            updateCryptoToken(data) {
                return this.baseService.post('crypto/updatecryptotoken', data, { timeout: this.baseService.reportTime });
            }
            getCryptoTokenList() {
                return this.baseService.get('crypto/getcryptotokenlist', { timeout: this.baseService.reportTime });
            }
            getCryptoToken(data) {
                return this.baseService.post('crypto/getcryptotoken', data, { timeout: this.baseService.reportTime });
            }
            getWallet(chain) {
                return this.baseService.get('crypto/getwallet/' + chain, { timeout: this.baseService.reportTime });
            }
            getAllWallets(data) {
                return this.baseService.post('crypto/getwallets', data, { timeout: this.baseService.reportTime });
            }
            removeWallet(id) {
                return this.baseService.get('crypto/removewallet/' + id, { timeout: this.baseService.reportTime });
            }
            registerWithdrawal(data) {
                return this.baseService.post('crypto/registerwithdrawal', data, { timeout: this.baseService.reportTime });
            }
            getWithdrawal(data) {
                return this.baseService.post('crypto/getwithdrawal', data, { timeout: this.baseService.reportTime });
            }
            getWithdrawalList() {
                return this.baseService.get('crypto/getwithdrawallist', { timeout: this.baseService.reportTime });
            }
            updateWithdrawal(id, status) {
                return this.baseService.get('crypto/updatewithdrawal/' + id + '/' + status, { timeout: this.baseService.reportTime });
            }
            getPrice(token) {
                var url = "https://wallet.oambit.com/v1/get_price/" + token;
                return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
            }
            getToken_Balance(channel, token, address) {
                var url = "https://wallet.oambit.com/v1/" + channel + "/get_token_balance";
                var data = { coin: token, address: address };
                return this.baseService.outsidePost(url, data, { ignoreLoadingBar: true });
            }
            get_Balance(channel, address) {
                var url = "https://wallet.oambit.com/v1/" + channel + "/get_address_balance";
                return this.baseService.outsidePost(url, { address: address }, { ignoreLoadingBar: true });
            }
            getTokenBalance(withdrawalId) {
                return this.baseService.post('crypto/gettokenbalance/' + withdrawalId, { timeout: this.baseService.reportTime });
            }
            processWithdrawal(withdrawalId) {
                return this.baseService.post('crypto/processwithdrawal/' + withdrawalId, { timeout: this.baseService.reportTime });
            }
        }
        services.CryptoService = CryptoService;
        angular.module('intranet.services').service('cryptoService', CryptoService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=CryptoService.js.map