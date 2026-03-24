module intranet.home {
    export interface IPubLinkScope extends intranet.common.IScopeBase {
        webname: string;
        host: any;
        absUrl: any;
    }

    export class PubLinkCtrl extends intranet.common.ControllerBase<IPubLinkScope>
        implements intranet.common.init.IInit {
        constructor($scope: IPubLinkScope,
            private $location:any,
            private settings: intranet.common.IBaseSettings) {
            super($scope);

            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.webname = this.settings.Title;
            this.$scope.host = this.$location.$$host;
            this.$scope.absUrl = this.$location.$$absUrl.split('#')[0];
        }

        public loadInitialData(): void {
        }


    }
    angular.module('intranet.home').controller('pubLinkCtrl', PubLinkCtrl);
}