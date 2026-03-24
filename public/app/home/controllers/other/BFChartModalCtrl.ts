module intranet.home {
    export interface IBFChartModalScope extends intranet.common.IScopeBase {
        modalOptions: any;
        ids: { marketid: any, runnerId: any, eventType: any };
        bfUrl: any;
    }

    export class BFChartModalCtrl extends intranet.common.ControllerBase<IBFChartModalScope>
        implements intranet.common.init.IInit {
        constructor($scope: IBFChartModalScope,
            private settings: common.IBaseSettings,
            private $uibModalInstance,
            private $sce: any,
            private modalOptions: any) {
            super($scope);
            super.init(this);
        }

        public initScopeValues() {
            this.$scope.modalOptions = this.modalOptions;

            if (this.modalOptions.data) { this.$scope.ids = this.modalOptions.data; }

            this.$scope.modalOptions.ok = result => ({ data: null, button: common.services.ModalResult.Cancel });
            this.$scope.modalOptions.close = result => {
                this.$uibModalInstance.close({ data: null, button: common.services.ModalResult.Cancel });
            };
        }

        public loadInitialData(): void {
            this.loadBFChanrt();
        }

        public loadBFChanrt(): void {
            if (this.$scope.ids.eventType == this.settings.CricketBfId) {
                this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/cricket/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId)
            }
            else if (this.$scope.ids.eventType == this.settings.SoccerBfId) {
                this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/football/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId)
            }
            else if (this.$scope.ids.eventType == this.settings.TennisBfId) {
                this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/tennis/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId)
            }
            else if (this.$scope.ids.eventType == this.settings.HorseRacingId) {
                this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/horse-racing/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId)
            }
            else if (this.$scope.ids.eventType == this.settings.GreyhoundId) {
                this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/greyhound-racing/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId)
            }
        }

    }
    angular.module('intranet.home').controller('bFChartModalCtrl', BFChartModalCtrl);
}