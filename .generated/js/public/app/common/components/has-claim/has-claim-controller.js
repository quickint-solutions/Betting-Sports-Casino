var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var directives;
        (function (directives) {
            class KTHasClaimController extends intranet.common.ControllerBase {
                constructor($scope, settings, commonDataService, authorizationService) {
                    super($scope);
                    this.settings = settings;
                    this.commonDataService = commonDataService;
                    this.authorizationService = authorizationService;
                    this.checkClaims();
                }
                checkClaims() {
                    if (this.$scope.mandateAll == 'true') {
                        this.$scope.isAuthorized = true;
                        if (this.$scope.claims && !this.settings.IsFaaS) {
                            for (var i = 0; i < this.$scope.claims.Claims.length; i++) {
                                if (common.helpers.CommonHelper.isCPPermission(this.$scope.claims.Claims[i])) {
                                    if (this.commonDataService.isCPLogin() == true) {
                                        this.$scope.isAuthorized = this.authorizationService.hasClaimBoolean(this.$scope.claims.Claims[i]);
                                    }
                                    else {
                                        this.$scope.isAuthorized = true;
                                    }
                                }
                                else {
                                    this.$scope.isAuthorized = this.authorizationService.hasClaimBoolean(this.$scope.claims.Claims[i]);
                                }
                                if (!this.$scope.isAuthorized) {
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        this.$scope.isAuthorized = true;
                        if (this.$scope.claims && !this.settings.IsFaaS) {
                            for (var i = 0; i < this.$scope.claims.Claims.length; i++) {
                                if (common.helpers.CommonHelper.isCPPermission(this.$scope.claims.Claims[i])) {
                                    if (this.commonDataService.isCPLogin() == true) {
                                        this.$scope.isAuthorized = this.authorizationService.hasClaimBoolean(this.$scope.claims.Claims[i]);
                                    }
                                    else {
                                        this.$scope.isAuthorized = true;
                                    }
                                }
                                else {
                                    this.$scope.isAuthorized = this.authorizationService.hasClaimBoolean(this.$scope.claims.Claims[i]);
                                }
                                if (this.$scope.isAuthorized) {
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            angular.module('kt.components')
                .controller('KTHasClaimController', KTHasClaimController)
                .directive('ktHasClaim', () => {
                return {
                    restrict: 'A',
                    scope: {
                        claims: '<',
                        mandateAll: '@?'
                    },
                    controller: 'KTHasClaimController',
                    link: (scope, elem, attr) => {
                        if (!scope.isAuthorized) {
                            elem.remove();
                        }
                        else {
                            elem.removeAttr('claims');
                            elem.removeAttr('kt-has-claim');
                        }
                        scope.$destroy();
                    }
                };
            });
        })(directives = common.directives || (common.directives = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=has-claim-controller.js.map