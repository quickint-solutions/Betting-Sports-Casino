module intranet.help {
    export interface IBaseHelpScope extends intranet.common.IScopeBase {
        logo: any;
    }

    export class BaseHelpCtrl extends intranet.common.ControllerBase<IBaseHelpScope>
        implements intranet.common.init.IInit {
        constructor($scope: IBaseHelpScope,
            private settings: common.IBaseSettings,
            private $stateParams: any) {
            super($scope);


            super.init(this);
        }

        public initScopeValues() {
            this.$scope.logo = this.settings.ImagePath + 'images/' + this.settings.WebApp + '/login-logo.png';
        }

        public loadInitialData(): void {
        }

    }
    angular.module('intranet.help').controller('baseHelpCtrl', BaseHelpCtrl);
}