var intranet;
(function (intranet) {
    var master;
    (function (master) {
        class ViewCardsModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, toasterService, settings, commonDataService, $uibModalInstance, modalOptions) {
                super($scope);
                this.toasterService = toasterService;
                this.settings = settings;
                this.commonDataService = commonDataService;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
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
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
            loadInitialData() {
            }
        }
        master.ViewCardsModalCtrl = ViewCardsModalCtrl;
        angular.module('intranet.master').controller('viewCardsModalCtrl', ViewCardsModalCtrl);
    })(master = intranet.master || (intranet.master = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ViewCardsModalCtrl.js.map