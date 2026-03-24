var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var security;
        (function (security) {
            class BaseAuthorizationService {
                constructor(localStorageHelper, settings, websiteService, $q) {
                    this.localStorageHelper = localStorageHelper;
                    this.settings = settings;
                    this.websiteService = websiteService;
                    this.$q = $q;
                }
                storeClaims(lstClaims) {
                    var claimsString;
                    if (lstClaims) {
                        claimsString = lstClaims.join('//');
                        this.localStorageHelper.set(this.settings.ClaimsStorageKey, { claims: claimsString });
                    }
                    return claimsString;
                }
                getPaymentClaims(lstClaims, hasOBD = false) {
                    var deferred = this.$q.defer();
                    if (hasOBD) {
                        lstClaims.push('ui.client.payment.offlinepayment');
                    }
                    this.websiteService.getPGInfo()
                        .success((response) => {
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
                loadClaims(lstClaims, usertype = '', hasOBD = false) {
                    var deferred = this.$q.defer();
                    if (usertype == common.enums.UserType.SuperAdmin
                        || usertype == common.enums.UserType.Manager
                        || usertype == common.enums.UserType.Agent
                        || usertype == common.enums.UserType.Player) {
                        this.getPaymentClaims(lstClaims, hasOBD)
                            .then(response => {
                            const claimsStored = this.storeClaims(response);
                            deferred.resolve(claimsStored);
                        });
                    }
                    else {
                        const claimsStored = this.storeClaims(lstClaims);
                        deferred.resolve(claimsStored);
                    }
                    return deferred.promise;
                }
                hasClaim(claim) {
                    var deferred = this.$q.defer();
                    var claims = this.localStorageHelper.get(this.settings.ClaimsStorageKey);
                    if (claims) {
                        var arrClaims = claims.claims.split('//');
                        var searchedClaim = arrClaims.indexOf(claim);
                        if (searchedClaim >= 0) {
                            deferred.resolve(true);
                        }
                        else {
                            deferred.reject(403);
                        }
                    }
                    else {
                        deferred.reject(403);
                    }
                    return deferred.promise;
                }
                hasClaimBoolean(claim) {
                    var claims = this.localStorageHelper.get(this.settings.ClaimsStorageKey);
                    if (claims) {
                        var arrClaims = claims.claims.split('//');
                        var searchedClaim = arrClaims.indexOf(claim);
                        if (searchedClaim >= 0) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
            }
            security.BaseAuthorizationService = BaseAuthorizationService;
        })(security = common.security || (common.security = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BaseAuthorizationService.js.map