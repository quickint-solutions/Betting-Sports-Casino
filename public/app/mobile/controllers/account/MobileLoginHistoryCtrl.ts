module intranet.mobile.account {
    export interface IMobileLoginHistoryScope extends intranet.common.IScopeBase {
        loginHistory: any[];
    }

    export class MobileLoginHistoryCtrl extends intranet.common.ControllerBase<IMobileLoginHistoryScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: IMobileLoginHistoryScope,
            private tokenService: services.TokenService) {
            super($scope);
            super.init(this);
        }

        public loadInitialData(): void {
            this.getLoginHistory();
        }

        private getLoginHistory(): void {
            var promise: ng.IHttpPromise<any>;
            promise = this.tokenService.getLoginHistory();
            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.$scope.loginHistory = response.data;
                }
            });
        }
    }
    angular.module('intranet.mobile.account').controller('mobileLoginHistoryCtrl', MobileLoginHistoryCtrl);
}