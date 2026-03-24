module intranet.home {
    export interface IMyBetsScope extends intranet.common.IScopeBase {

    }

    export class MyBetsCtrl extends intranet.common.ControllerBase<IMyBetsScope>
        implements intranet.common.init.IInit {
        constructor($scope: IMyBetsScope,
            private $location: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
        }

        public loadInitialData(): void {

        }

        private isActive(path: string): string {
            return (this.$location.$$url == path) ? 'active' : '';
        }
    }
    angular.module('intranet.home').controller('myBetsCtrl', MyBetsCtrl);
}