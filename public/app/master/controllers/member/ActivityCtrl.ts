module intranet.master {

    export interface IActivityScope extends intranet.common.IScopeBase {
        onlyChild: any;
        actData: any;

        dwData: any;
        casinoData: any;
    }

    export class ActivityCtrl extends intranet.common.ControllerBase<IActivityScope>
        implements common.init.IInit {
        constructor($scope: IActivityScope,
            private betHistoryService: services.BetHistoryService,
            private accountService: services.AccountService,
            private $stateParams: any
        ) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.onlyChild = 'true';
        }

        public loadInitialData(): void {
            this.getUserActivity();
            this.getDWActivity();
            this.getCasinoActivity();
        }

        private getUserActivity(): void {
            this.betHistoryService.getUserActivity(this.$stateParams.memberid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.actData = response.data.user;
                    }
                });
        }

        private getDWActivity() {
            this.accountService.getInOutActivity(this.$stateParams.memberid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.dwData = response.data.user;
                    }
                });
        }

        private getCasinoActivity() {
            this.accountService.getCasinoActivity(this.$stateParams.memberid)
                .success((response: common.messaging.IResponse<any>) => {
                    if (response.success && response.data) {
                        this.$scope.casinoData = response.data.user;
                    }
                });
        }
    }
    angular.module('intranet.master').controller('activityCtrl', ActivityCtrl);
}