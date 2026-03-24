module intranet.home {

    export interface IMyAccountScope extends intranet.common.IScopeBase {
        footerTemplate: any;
    }

    export class MyAccountCtrl extends intranet.common.ControllerBase<IMyAccountScope>
    {
        constructor($scope: IMyAccountScope,
            private settings: common.IBaseSettings,
            private $location: any) {
            super($scope);

            this.$scope.footerTemplate = this.settings.ThemeName + '/template/footer.html';
        }

        private isActive(path: string): string {
            return (this.$location.$$url.indexOf(path) >= 0) ? 'active' : '';
        }

    }
    angular.module('intranet.home').controller('myAccountCtrl', MyAccountCtrl);
}