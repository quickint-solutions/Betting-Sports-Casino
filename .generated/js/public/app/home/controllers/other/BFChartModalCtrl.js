var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class BFChartModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, $uibModalInstance, $sce, modalOptions) {
                super($scope);
                this.settings = settings;
                this.$uibModalInstance = $uibModalInstance;
                this.$sce = $sce;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.ids = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => ({ data: null, button: intranet.common.services.ModalResult.Cancel });
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
                this.loadBFChanrt();
            }
            loadBFChanrt() {
                if (this.$scope.ids.eventType == this.settings.CricketBfId) {
                    this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/cricket/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId);
                }
                else if (this.$scope.ids.eventType == this.settings.SoccerBfId) {
                    this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/football/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId);
                }
                else if (this.$scope.ids.eventType == this.settings.TennisBfId) {
                    this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/tennis/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId);
                }
                else if (this.$scope.ids.eventType == this.settings.HorseRacingId) {
                    this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/horse-racing/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId);
                }
                else if (this.$scope.ids.eventType == this.settings.GreyhoundId) {
                    this.$scope.bfUrl = this.$sce.trustAsResourceUrl("https://www.betfair.com/exchange/greyhound-racing/marketactivity?id=" + this.$scope.ids.marketid + "&selectionId=" + this.$scope.ids.runnerId);
                }
            }
        }
        home.BFChartModalCtrl = BFChartModalCtrl;
        angular.module('intranet.home').controller('bFChartModalCtrl', BFChartModalCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=BFChartModalCtrl.js.map