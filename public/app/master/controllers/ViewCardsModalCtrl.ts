module intranet.master {

    export interface IViewCardsModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        winner: any;
        gameString: any;
        cardImagePath: string;
        gameType: any;
        settleTime: any;
        extraWinnerList: any;
    }

    export class ViewCardsModalCtrl extends intranet.common.ControllerBase<IViewCardsModalScope>
        implements intranet.common.init.IInit {

        constructor($scope: IViewCardsModalScope,
            private toasterService: intranet.common.services.ToasterService,
            private settings: common.IBaseSettings,
            private commonDataService: common.services.CommonDataService,
            private $uibModalInstance,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues(): void {
            this.$scope.cardImagePath = this.settings.ImagePath + 'images/scards/';
            this.$scope.messages = [];
            this.$scope.modalOptions = this.modalOptions;
            if (this.modalOptions.data) {
                this.$scope.winner = this.modalOptions.data.winner;
                this.$scope.gameType = this.modalOptions.data.gameType;
                this.$scope.gameString = this.modalOptions.data.gameString;
                this.$scope.settleTime = this.modalOptions.data.settleTime;
                this.$scope.extraWinnerList = this.modalOptions.data.extraWinnerList;
            }

            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {

        }
    }

    angular.module('intranet.master').controller('viewCardsModalCtrl', ViewCardsModalCtrl);
}