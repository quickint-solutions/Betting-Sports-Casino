module intranet.common.directives {

    export interface IKTGameRulesModalScope extends common.IScopeBase {
        market: any;
        modalOptions: any;
        imagePath: string;
        showCardRank: boolean;
    }

    export class KTGameRulesModalCtrl extends common.ControllerBase<IKTGameRulesModalScope>
        implements common.init.IInitScopeValues {

        constructor($scope: IKTGameRulesModalScope,
            private $uibModalInstance,
            private settings: common.IBaseSettings,
            private modalOptions: any) {
            super($scope);
            
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.showCardRank = false;
            this.$scope.modalOptions = this.modalOptions;
            this.$scope.imagePath = this.settings.ImagePath + 'images/';

            if (this.modalOptions.data) {
                this.$scope.market = this.modalOptions.data;
                if (this.$scope.market.gameType == common.enums.GameType.Patti2
                    || this.$scope.market.gameType == common.enums.GameType.Patti3
                    || this.$scope.market.gameType == common.enums.GameType.PattiODI) {
                    this.$scope.showCardRank = true;
                }
            }

            this.$scope.modalOptions.ok = result => ({ data: null, button: common.services.ModalResult.Cancel });
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

    }

    angular.module('kt.components').controller('ktGameRulesModalCtrl', KTGameRulesModalCtrl);
}