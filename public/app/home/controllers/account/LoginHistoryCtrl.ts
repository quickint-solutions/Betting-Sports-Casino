module intranet.home {
    export interface ILoginHistoryScope extends intranet.common.IScopeBase {
        loginHistory: any[];
        fromMaster: any;
    }

    export class LoginHistoryCtrl extends intranet.common.ControllerBase<ILoginHistoryScope>
        implements intranet.common.init.ILoadInitialData {
        constructor($scope: ILoginHistoryScope,
            private $stateParams: any,
            private tokenService: services.TokenService) {
            super($scope);
            super.init(this);
        }

        public loadInitialData(): void {
            this.getLoginHistory();
        }

        private getLoginHistory(): void {
            var promise: ng.IHttpPromise<any>;
            if (this.$stateParams.memberid) {
                this.$scope.fromMaster = true;
                promise = this.tokenService.getLoginHistoryById(this.$stateParams.memberid);
            }
            else {
                promise = this.tokenService.getLoginHistory();
            }

            promise.success((response: common.messaging.IResponse<any>) => {
                if (response.success) {
                    this.$scope.loginHistory = response.data;
                }
            });
        }
    }
    angular.module('intranet.home').controller('loginHistoryCtrl', LoginHistoryCtrl);
}