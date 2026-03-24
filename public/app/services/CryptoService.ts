module intranet.services {

    export class CryptoService {
        constructor(private baseService: common.services.BaseService) {
        }

        public addCryptoToken(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('crypto/addcryptotoken', data, { timeout: this.baseService.reportTime });
        }

        public updateCryptoToken(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('crypto/updatecryptotoken', data, { timeout: this.baseService.reportTime });
        }

        public getCryptoTokenList(): ng.IHttpPromise<any> {
            return this.baseService.get('crypto/getcryptotokenlist', { timeout: this.baseService.reportTime });
        }

        public getCryptoToken(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('crypto/getcryptotoken', data, { timeout: this.baseService.reportTime });
        }

        public getWallet(chain: any): ng.IHttpPromise<any> {
            return this.baseService.get('crypto/getwallet/' + chain, { timeout: this.baseService.reportTime });
        }

        public getAllWallets(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('crypto/getwallets', data, { timeout: this.baseService.reportTime });
        }
        public removeWallet(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('crypto/removewallet/' + id, { timeout: this.baseService.reportTime });
        }

        public registerWithdrawal(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('crypto/registerwithdrawal', data, { timeout: this.baseService.reportTime });
        }

        public getWithdrawal(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('crypto/getwithdrawal', data, { timeout: this.baseService.reportTime });
        }
        public getWithdrawalList(): ng.IHttpPromise<any> {
            return this.baseService.get('crypto/getwithdrawallist', { timeout: this.baseService.reportTime });
        }
        public updateWithdrawal(id: any, status: any): ng.IHttpPromise<any> {
            return this.baseService.get('crypto/updatewithdrawal/' + id + '/' + status, { timeout: this.baseService.reportTime });
        }

        public getPrice(token: any): ng.IHttpPromise<any> {
            var url = "https://wallet.oambit.com/v1/get_price/" + token;
            return this.baseService.outsideGet(url, { ignoreLoadingBar: true });
        }

        public getToken_Balance(channel: any, token: any, address: any): ng.IHttpPromise<any> {
            var url = "https://wallet.oambit.com/v1/" + channel + "/get_token_balance";
            var data = { coin: token, address: address }
            return this.baseService.outsidePost(url, data, { ignoreLoadingBar: true });
        }

        public get_Balance(channel: any, address: any): ng.IHttpPromise<any> {
            var url = "https://wallet.oambit.com/v1/" + channel + "/get_address_balance";
            return this.baseService.outsidePost(url, { address: address }, { ignoreLoadingBar: true });
        }

        public getTokenBalance(withdrawalId: any): ng.IHttpPromise<any> {
            return this.baseService.post('crypto/gettokenbalance/' + withdrawalId, { timeout: this.baseService.reportTime });
        }
        public processWithdrawal(withdrawalId: any): ng.IHttpPromise<any> {
            return this.baseService.post('crypto/processwithdrawal/' + withdrawalId, { timeout: this.baseService.reportTime });
        }
    }

    angular.module('intranet.services').service('cryptoService', CryptoService);
}