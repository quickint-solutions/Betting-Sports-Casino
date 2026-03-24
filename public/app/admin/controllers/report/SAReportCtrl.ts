module intranet.admin {
    export interface ISAReportScope extends intranet.common.IScopeBase {

    }

    export class SAReportCtrl extends intranet.common.ControllerBase<ISAReportScope>
        implements intranet.common.init.IInit {
        constructor($scope: ISAReportScope,
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
    angular.module('intranet.admin').controller('sAReportCtrl', SAReportCtrl);
}