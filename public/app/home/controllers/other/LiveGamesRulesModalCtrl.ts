module intranet.home {

    export interface ILiveGamesRulesModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        imagePath: string;
        market: any;
    }

    export class LiveGamesRulesModalCtrl extends intranet.common.ControllerBase<ILiveGamesRulesModalScope>
        implements intranet.common.init.IInitScopeValues {

        constructor($scope: ILiveGamesRulesModalScope,
            private settings: common.IBaseSettings,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.imagePath = this.settings.ImagePath + 'images/';
            this.$scope.modalOptions = this.modalOptions;

            if (this.modalOptions.data) { this.$scope.market = this.modalOptions.data;}

            this.$scope.modalOptions.ok = result => ({ data: null, button: common.services.ModalResult.Cancel });
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

    }

    angular.module('intranet.home').controller('liveGamesRulesModalCtrl', LiveGamesRulesModalCtrl);
}