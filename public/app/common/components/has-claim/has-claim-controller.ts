namespace intranet.common.directives {
    export interface IHasClaimScope
        extends intranet.common.IScopeBase {
        claims: any;
        mandateAll: any;
        isAuthorized: boolean;
    }

    class KTHasClaimController extends intranet.common.ControllerBase<IHasClaimScope> {

        /* @ngInject */
        constructor($scope: IHasClaimScope,
            private settings: common.IBaseSettings,
            private commonDataService: common.services.CommonDataService,
            private authorizationService: security.BaseAuthorizationService) {
            super($scope);

            this.checkClaims();
        }


        private checkClaims(): void {
            if (this.$scope.mandateAll == 'true') {
                this.$scope.isAuthorized = true;
                if (this.$scope.claims && !this.settings.IsFaaS) {
                    for (var i = 0; i < this.$scope.claims.Claims.length; i++) {

                        if (common.helpers.CommonHelper.isCPPermission(this.$scope.claims.Claims[i])) {
                            if (this.commonDataService.isCPLogin() == true) {
                                this.$scope.isAuthorized = this.authorizationService.hasClaimBoolean(this.$scope.claims.Claims[i]);
                            } else {
                                this.$scope.isAuthorized = true;
                            }
                        }
                        else {
                            this.$scope.isAuthorized = this.authorizationService.hasClaimBoolean(this.$scope.claims.Claims[i]);
                        }
                        if (!this.$scope.isAuthorized) { break; }
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
                            } else {
                                this.$scope.isAuthorized = true;
                            }
                        } else {
                            this.$scope.isAuthorized = this.authorizationService.hasClaimBoolean(this.$scope.claims.Claims[i]);
                        }
                        if (this.$scope.isAuthorized) { break; }
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
                link: (scope: IHasClaimScope, elem, attr: any) => {
                    if (!scope.isAuthorized) {
                        elem.remove();
                    } else {
                        elem.removeAttr('claims');
                        elem.removeAttr('kt-has-claim');
                    }
                    scope.$destroy();
                }
            };
        });
}