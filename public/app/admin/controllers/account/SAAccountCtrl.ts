module intranet.admin {

    export interface ISAAccountScope extends intranet.common.IScopeBase {
        user: any;
        fromMember: any;
    }

    export class SAAccountCtrl extends intranet.common.ControllerBase<ISAAccountScope>
        implements common.init.IInit {
        constructor($scope: ISAAccountScope,
            private commonDataService: common.services.CommonDataService,
            private $location: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.fromMember = false;
        }

        public loadInitialData(): void {
            this.getUserData();
        }

        private isActive(path: string): string {
            return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
        }

        private getUserData(): void {
            this.$scope.user = this.commonDataService.getLoggedInUserData();
        }

    }
    angular.module('intranet.admin').controller('sAAccountCtrl', SAAccountCtrl);
}