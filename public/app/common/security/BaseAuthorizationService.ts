namespace intranet.common.security {
    export abstract class BaseAuthorizationService {
        constructor(private localStorageHelper: common.helpers.LocalStorageHelper,
            private settings: intranet.common.IBaseSettings,
            private websiteService: intranet.services.WebsiteService,
            private $q: ng.IQService) {
        }

        protected abstract getClaims(): ng.IHttpPromise<any>;

        public storeClaims(lstClaims: any[]) {
            var claimsString: string;
            if (lstClaims) {
                claimsString = lstClaims.join('//');

                this.localStorageHelper.set(this.settings.ClaimsStorageKey, { claims: claimsString });
            }
            return claimsString;
        }


        private getPaymentClaims(lstClaims: any, hasOBD: boolean = false): ng.IPromise<any> {
            var deferred = this.$q.defer();

            if (hasOBD) {
                lstClaims.push('ui.client.payment.offlinepayment');
            }

            this.websiteService.getPGInfo()
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        if (response.data.isEnabledFairEx == true) {
                            lstClaims.push('ui.client.payment.fairex');
                        }
                        if (response.data.isEnabledArropay == true) {
                            lstClaims.push('ui.client.payment.arropay');
                        }
                        if (response.data.isEnabledNeteller == true) {
                            lstClaims.push('ui.client.payment.neteller');
                        }
                        if (response.data.isEnabledSkrill == true) {
                            lstClaims.push('ui.client.payment.skrill');
                        }
                        if (response.data.isEnabledCrypto == true) {
                            lstClaims.push('ui.client.payment.crypto');
                        }
                        if (response.data.isEnabledGameOkCrypto == true) {
                            lstClaims.push('ui.client.payment.onramp');
                        }
                        if (response.data.isEnabledPaymor == true) {
                            lstClaims.push('ui.client.payment.paymor');
                        }
                        if (response.data.isEnabledYuvaPay == true) {
                            lstClaims.push('ui.client.payment.yuvapay');
                        }
                    }
                }).finally(() => { deferred.resolve(lstClaims); });

            return deferred.promise;
        }

        public loadClaims(lstClaims: any[], usertype: any = '', hasOBD: boolean = false): ng.IPromise<any> {
            var deferred = this.$q.defer();

            //var claims = this.localStorageHelper.get(this.settings.ClaimsStorageKey);
            //if (claims) {
            //    deferred.resolve(claims);
            //} else {
            if (usertype == common.enums.UserType.SuperAdmin
                || usertype == common.enums.UserType.Manager
                || usertype == common.enums.UserType.Agent
                || usertype == common.enums.UserType.Player) {
                this.getPaymentClaims(lstClaims, hasOBD)
                    .then(response => {
                        const claimsStored = this.storeClaims(response);
                        deferred.resolve(claimsStored);
                    });
            } else {
                const claimsStored = this.storeClaims(lstClaims);
                deferred.resolve(claimsStored);
            }
            // }

            return deferred.promise;
        }

        public hasClaim(claim: string): ng.IHttpPromise<any> {
            var deferred = this.$q.defer();

            var claims = this.localStorageHelper.get(this.settings.ClaimsStorageKey);
            if (claims) {
                var arrClaims = claims.claims.split('//');
                var searchedClaim = arrClaims.indexOf(claim);
                if (searchedClaim >= 0) {
                    //has claim - return a true promise
                    deferred.resolve(true);
                } else {
                    //no claim
                    deferred.reject(403);
                }
            } else {
                deferred.reject(403);
            }
            return deferred.promise;
        }

        public hasClaimBoolean(claim: string): boolean {

            var claims = this.localStorageHelper.get(this.settings.ClaimsStorageKey);
            if (claims) {
                var arrClaims = claims.claims.split('//');
                var searchedClaim = arrClaims.indexOf(claim);
                if (searchedClaim >= 0) {
                    //has claim - return a true promise
                    return true;
                } else {
                    //no claim
                    return false;
                }
            } else {
                return false;
            }

        }
    }
}