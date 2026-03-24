var intranet;
(function (intranet) {
    var home;
    (function (home) {
        class LiveGamesRulesModalCtrl extends intranet.common.ControllerBase {
            constructor($scope, settings, $uibModalInstance, modalOptions) {
                super($scope);
                this.settings = settings;
                this.$uibModalInstance = $uibModalInstance;
                this.modalOptions = modalOptions;
                super.init(this);
            }
            initScopeValues() {
                this.$scope.imagePath = this.settings.ImagePath + 'images/';
                this.$scope.modalOptions = this.modalOptions;
                if (this.modalOptions.data) {
                    this.$scope.market = this.modalOptions.data;
                }
                this.$scope.modalOptions.ok = result => ({ data: null, button: intranet.common.services.ModalResult.Cancel });
                this.$scope.modalOptions.close = result => {
                    this.$uibModalInstance.close({ data: null, button: intranet.common.services.ModalResult.Cancel });
                };
            }
        }
        home.LiveGamesRulesModalCtrl = LiveGamesRulesModalCtrl;
        angular.module('intranet.home').controller('liveGamesRulesModalCtrl', LiveGamesRulesModalCtrl);
    })(home = intranet.home || (intranet.home = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=LiveGamesRulesModalCtrl.js.map