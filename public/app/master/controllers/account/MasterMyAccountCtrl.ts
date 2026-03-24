module intranet.master {

    export interface IMasterMyAccountScope extends intranet.common.IScopeBase {
        user: any;
        fromMaster: boolean;
    }

    export class MasterMyAccountCtrl extends intranet.common.ControllerBase<IMasterMyAccountScope >
        implements common.init.IInit {
        constructor($scope: IMasterMyAccountScope ,
            private commonDataService: common.services.CommonDataService,
            private $location: any,
            private settings: common.IBaseSettings) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.fromMaster = true;
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
    angular.module('intranet.master').controller('masterMyAccountCtrl', MasterMyAccountCtrl);
}